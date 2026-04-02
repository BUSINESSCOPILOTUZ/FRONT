// ─── Base API Configuration ──────────────────────────

const BASE = import.meta.env.DEV
  ? "/api" // Vite proxy handles CORS in development
  : "https://apibusinesscopilot.masatov.uz/api";

export const API_BASE = `${BASE}/ai`;
export const AUTH_API = `${BASE}/auth`;
export const CONTENT_API = `${BASE}/content-plans`;
export const LEADS_API = `${BASE}/leads`;
export const INFLUENCERS_API = `${BASE}/influencers`;
export const BOT_API = `${BASE}/bot`;

/** Type-safe fetch wrapper with automatic error handling */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Request failed");
  return data.data as T;
}

function post<T>(url: string, body: Record<string, unknown>): Promise<T> {
  return request<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── AI Service ──────────────────────────────────────

import type { Message, AdsResult, BizPlanForm } from "../types";

export const aiApi = {
  generateContent: (topic: string) =>
    request<{ text: string }>(`${API_BASE}/generate-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    }).then((d) => d.text),

  bizChat: (message: string, chatHistory: Message[]) =>
    post<{ text: string }>(`${API_BASE}/biz-chat`, {
      message,
      chatHistory: chatHistory as unknown as Record<string, unknown>[],
    }).then((d) => d.text),

  generateBizPlan: (formData: BizPlanForm) =>
    post<{ text: string }>(
      `${API_BASE}/generate-biz-plan`,
      formData as unknown as Record<string, unknown>,
    ).then((d) => d.text),

  generateWebsite: (description: string) =>
    post<{ text: string }>(`${API_BASE}/generate-website`, {
      description,
    }).then((d) => d.text),

  generateAds: (description: string, platform: string, language?: string) =>
    post<AdsResult>(`${API_BASE}/generate-ads`, {
      description,
      platform,
      ...(language && { language }),
    }),

  marketAnalysis: (businessIdea: string) =>
    post<{ text: string }>(`${API_BASE}/market-analysis`, {
      businessIdea,
    }).then((d) => d.text),

  generateAdImages: (
    description: string,
    platform: string,
    language?: string,
  ) =>
    post<{ platform: string; images: unknown[] }>(
      `${API_BASE}/generate-ad-images`,
      {
        description,
        platform,
        ...(language && { language }),
      },
    ),
};

// ─── Bot Service ─────────────────────────────────────

import type {
  BotInfo,
  BotSettings,
  KnowledgeChunk,
  BotAnalytics,
  BotLog,
} from "../types";

export const botApi = {
  validateToken: (token: string) =>
    post<BotInfo>(`${BOT_API}/validate-token`, { token }),

  getSettings: (userId: string) =>
    request<BotSettings>(`${BOT_API}/settings/${userId}`),

  updateSettings: (userId: string, updates: Partial<BotSettings>) =>
    request<BotSettings>(`${BOT_API}/settings/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),

  uploadKnowledgeFile: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ chunksAdded: number; fileName: string }>(
      `${BOT_API}/knowledge/${userId}`,
      {
        method: "POST",
        body: formData,
      },
    );
  },

  uploadKnowledgeText: (userId: string, text: string) =>
    post<{ chunksAdded: number }>(`${BOT_API}/knowledge/${userId}`, { text }),

  getKnowledge: (userId: string) =>
    request<KnowledgeChunk[]>(`${BOT_API}/knowledge/${userId}`),

  deleteKnowledge: (userId: string, chunkId: string) =>
    request<void>(`${BOT_API}/knowledge/${userId}/${chunkId}`, {
      method: "DELETE",
    }),

  clearKnowledge: (userId: string) =>
    request<void>(`${BOT_API}/knowledge/${userId}`, { method: "DELETE" }),

  testChat: (userId: string, message: string) =>
    post<{ response: string }>(`${BOT_API}/chat/${userId}`, { message }),

  getAnalytics: (userId: string, days = 7) =>
    request<BotAnalytics>(`${BOT_API}/analytics/${userId}?days=${days}`),

  getLogs: (userId: string, count = 5) =>
    request<BotLog[]>(`${BOT_API}/logs/${userId}?count=${count}`),
};

// ─── Auth Service ────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    post<{ token: string; user: Record<string, unknown> }>(
      `${AUTH_API}/login`,
      { email, password },
    ),

  register: (name: string, email: string, password: string) =>
    post<{ token: string; user: Record<string, unknown> }>(
      `${AUTH_API}/register`,
      { name, email, password },
    ),

  sendOtp: (phone: string) =>
    post<{ message: string }>(`${AUTH_API}/send-otp`, { phone }),

  verifyOtp: (phone: string, code: string) =>
    post<{ token: string; user: Record<string, unknown> }>(
      `${AUTH_API}/verify-otp`,
      { phone, code },
    ),
};

// ─── Content Plans Service ──────────────────────────

export const contentApi = {
  list: () => request<Record<string, unknown>[]>(CONTENT_API),

  generate: (topic: string) =>
    post<Record<string, unknown>>(`${CONTENT_API}/generate`, { topic }),

  approve: (
    planId: string,
    telegramChannelId: string,
    scheduledPosts: unknown[],
  ) =>
    request<Record<string, unknown>>(`${CONTENT_API}/${planId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramChannelId, scheduledPosts }),
    }),
};

// ─── Leads Service ──────────────────────────────────

function authRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("auth-token");
  return request<T>(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
}

export const leadsApi = {
  list: () => authRequest<Record<string, unknown>[]>(LEADS_API),

  getById: (id: string) =>
    authRequest<Record<string, unknown>>(`${LEADS_API}/${id}`),

  create: (data: Record<string, unknown>) =>
    authRequest<Record<string, unknown>>(LEADS_API, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    authRequest<Record<string, unknown>>(`${LEADS_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    authRequest<void>(`${LEADS_API}/${id}`, { method: "DELETE" }),
};

// ─── Influencers Service ────────────────────────────

export const influencersApi = {
  list: () => authRequest<Record<string, unknown>[]>(INFLUENCERS_API),

  getById: (id: string) =>
    authRequest<Record<string, unknown>>(`${INFLUENCERS_API}/${id}`),

  create: (data: Record<string, unknown>) =>
    authRequest<Record<string, unknown>>(INFLUENCERS_API, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    authRequest<Record<string, unknown>>(`${INFLUENCERS_API}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    authRequest<void>(`${INFLUENCERS_API}/${id}`, { method: "DELETE" }),
};
