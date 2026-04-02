import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { botApi } from "../../services/api";
import type {
  BotInfo,
  BotSettings,
  KnowledgeChunk,
  BotAnalytics,
  BotLog,
} from "../../types";

// ─── Context State Shape ─────────────────────────────

interface BotState {
  // Connection
  botToken: string;
  botInfo: BotInfo | null;
  connected: boolean;
  tokenValidating: boolean;
  tokenError: string;

  // Training
  systemPrompt: string;
  knowledgeChunks: KnowledgeChunk[];
  knowledgeText: string;
  knowledgeUploading: boolean;

  // Automation
  retargetEnabled: boolean;
  retargetDays: number;
  retargetMessage: string;
  loyaltyEnabled: boolean;
  loyaltyDiscount: number;
  loyaltyMessage: string;

  // Analytics
  analytics: BotAnalytics | null;
  logs: BotLog[];
  statsLoading: boolean;

  // Test
  testMessage: string;
  testResponse: string;
  testLoading: boolean;

  // Meta
  settingsSaving: boolean;
  activeSubTab: "brain" | "action" | "stats";
  initialized: boolean;
}

// ─── Context Actions ─────────────────────────────────

interface BotActions {
  setActiveSubTab: (tab: "brain" | "action" | "stats") => void;
  setBotToken: (token: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setKnowledgeText: (text: string) => void;
  setRetargetEnabled: (val: boolean) => void;
  setRetargetDays: (days: number) => void;
  setRetargetMessage: (msg: string) => void;
  setLoyaltyEnabled: (val: boolean) => void;
  setLoyaltyDiscount: (pct: number) => void;
  setLoyaltyMessage: (msg: string) => void;
  setTestMessage: (msg: string) => void;
  validateToken: () => Promise<void>;
  disconnect: () => Promise<void>;
  saveSettings: () => Promise<void>;
  uploadFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadText: () => Promise<void>;
  deleteChunk: (chunkId: string) => Promise<void>;
  testChat: () => Promise<void>;
  loadStats: () => Promise<void>;
}

type BotContextType = BotState & BotActions;

const BotContext = createContext<BotContextType | null>(null);

export function useBotContext() {
  const ctx = useContext(BotContext);
  if (!ctx) throw new Error("useBotContext must be used inside <BotProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────

export function BotProvider({
  userId,
  active,
  children,
}: {
  userId: string;
  active: boolean;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<BotState>({
    botToken: "",
    botInfo: null,
    connected: false,
    tokenValidating: false,
    tokenError: "",
    systemPrompt:
      "Siz xushmuomala va professional sotuvchisiz. Mijozlarga mahsulotlar haqida batafsil ma'lumot bering, narxlarni ayting va xarid qilishga undang.",
    knowledgeChunks: [],
    knowledgeText: "",
    knowledgeUploading: false,
    retargetEnabled: false,
    retargetDays: 7,
    retargetMessage:
      "Assalomu alaykum! Sizni yana ko'rganimizdan xursandmiz. Yangi mahsulotlarimiz bilan tanishing! 🎁",
    loyaltyEnabled: false,
    loyaltyDiscount: 10,
    loyaltyMessage:
      "Hurmatli mijozimiz! Sodiq mijozimiz sifatida sizga maxsus chegirma: {discount}% 🎉",
    analytics: null,
    logs: [],
    statsLoading: false,
    testMessage: "",
    testResponse: "",
    testLoading: false,
    settingsSaving: false,
    activeSubTab: "brain",
    initialized: false,
  });

  const patch = useCallback(
    (updates: Partial<BotState>) => setState((s) => ({ ...s, ...updates })),
    [],
  );

  // ─── Load settings when tab becomes active ──────
  useEffect(() => {
    if (!active || state.initialized) return;
    (async () => {
      try {
        const settings = await botApi.getSettings(userId);
        const chunks = await botApi.getKnowledge(userId);
        patch({
          botToken: settings.botToken || "",
          botInfo: settings.botUsername ? { username: settings.botUsername } : null,
          connected: settings.isConnected || false,
          systemPrompt: settings.systemPrompt || state.systemPrompt,
          retargetEnabled: settings.retargetEnabled || false,
          retargetDays: settings.retargetDays || 7,
          retargetMessage: settings.retargetMessage || state.retargetMessage,
          loyaltyEnabled: settings.loyaltyEnabled || false,
          loyaltyDiscount: settings.loyaltyDiscountPercent || 10,
          loyaltyMessage: settings.loyaltyMessage || state.loyaltyMessage,
          knowledgeChunks: chunks,
          initialized: true,
        });
      } catch {
        patch({ initialized: true });
      }
    })();
  }, [active, userId, state.initialized, patch]);

  // ─── Load stats when stats tab is opened ──────
  useEffect(() => {
    if (active && state.activeSubTab === "stats" && state.initialized) {
      actions.loadStats();
    }
  }, [active, state.activeSubTab, state.initialized]);

  // ─── Actions ─────────────────────────────────────
  const actions: BotActions = {
    setActiveSubTab: (tab) => patch({ activeSubTab: tab }),
    setBotToken: (token) => patch({ botToken: token, tokenError: "" }),
    setSystemPrompt: (prompt) => patch({ systemPrompt: prompt }),
    setKnowledgeText: (text) => patch({ knowledgeText: text }),
    setRetargetEnabled: (val) => patch({ retargetEnabled: val }),
    setRetargetDays: (days) => patch({ retargetDays: days }),
    setRetargetMessage: (msg) => patch({ retargetMessage: msg }),
    setLoyaltyEnabled: (val) => patch({ loyaltyEnabled: val }),
    setLoyaltyDiscount: (pct) => patch({ loyaltyDiscount: pct }),
    setLoyaltyMessage: (msg) => patch({ loyaltyMessage: msg }),
    setTestMessage: (msg) => patch({ testMessage: msg }),

    validateToken: async () => {
      if (!state.botToken.trim() || state.botToken.trim().length < 30) {
        patch({ tokenError: "Token kamida 30 belgi bo'lishi kerak." });
        return;
      }
      patch({ tokenValidating: true, tokenError: "" });
      try {
        const info = await botApi.validateToken(state.botToken.trim());
        patch({ botInfo: info, connected: true, tokenValidating: false });
        await botApi.updateSettings(userId, {
          botToken: state.botToken.trim(),
          botUsername: info.username || "",
          isConnected: true,
        });
      } catch {
        patch({
          tokenError: "Bot token noto'g'ri yoki muddati tugagan.",
          botInfo: null,
          connected: false,
          tokenValidating: false,
        });
      }
    },

    disconnect: async () => {
      patch({ connected: false, botInfo: null, botToken: "" });
      await botApi.updateSettings(userId, {
        botToken: "",
        botUsername: "",
        isConnected: false,
      });
    },

    saveSettings: async () => {
      patch({ settingsSaving: true });
      try {
        await botApi.updateSettings(userId, {
          systemPrompt: state.systemPrompt,
          retargetEnabled: state.retargetEnabled,
          retargetDays: state.retargetDays,
          retargetMessage: state.retargetMessage,
          loyaltyEnabled: state.loyaltyEnabled,
          loyaltyDiscountPercent: state.loyaltyDiscount,
          loyaltyMessage: state.loyaltyMessage,
        });
      } catch (err) {
        console.error("Settings save error:", err);
      } finally {
        patch({ settingsSaving: false });
      }
    },

    uploadFile: async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      patch({ knowledgeUploading: true });
      try {
        await botApi.uploadKnowledgeFile(userId, file);
        const chunks = await botApi.getKnowledge(userId);
        patch({ knowledgeChunks: chunks });
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        patch({ knowledgeUploading: false });
        e.target.value = "";
      }
    },

    uploadText: async () => {
      if (!state.knowledgeText.trim()) return;
      patch({ knowledgeUploading: true });
      try {
        await botApi.uploadKnowledgeText(userId, state.knowledgeText.trim());
        const chunks = await botApi.getKnowledge(userId);
        patch({ knowledgeChunks: chunks, knowledgeText: "" });
      } catch (err) {
        console.error("Text upload error:", err);
      } finally {
        patch({ knowledgeUploading: false });
      }
    },

    deleteChunk: async (chunkId) => {
      try {
        await botApi.deleteKnowledge(userId, chunkId);
        patch({ knowledgeChunks: state.knowledgeChunks.filter((c) => c._id !== chunkId) });
      } catch (err) {
        console.error("Delete chunk error:", err);
      }
    },

    testChat: async () => {
      if (!state.testMessage.trim()) return;
      patch({ testLoading: true, testResponse: "" });
      try {
        const data = await botApi.testChat(userId, state.testMessage.trim());
        patch({ testResponse: data.response, testLoading: false });
      } catch {
        patch({ testResponse: "Xatolik yuz berdi. Qayta urinib ko'ring.", testLoading: false });
      }
    },

    loadStats: async () => {
      patch({ statsLoading: true });
      try {
        const [analytics, logs] = await Promise.all([
          botApi.getAnalytics(userId, 7),
          botApi.getLogs(userId, 5),
        ]);
        patch({ analytics, logs, statsLoading: false });
      } catch (err) {
        console.error("Stats load error:", err);
        patch({ statsLoading: false });
      }
    },
  };

  return (
    <BotContext.Provider value={{ ...state, ...actions }}>
      {children}
    </BotContext.Provider>
  );
}
