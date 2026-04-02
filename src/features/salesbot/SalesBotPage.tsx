import React from "react";
import { motion } from "motion/react";
import { Bot, Brain, Zap, BarChart3, Wifi, WifiOff } from "lucide-react";
import { cn } from "../../lib/utils";
import { BotProvider, useBotContext } from "./BotProvider";
import { BrainTab } from "./components/BrainTab";
import { ActionTab } from "./components/ActionTab";
import { StatsTab } from "./components/StatsTab";

function SalesBotContent() {
  const ctx = useBotContext();

  const subTabs = [
    { id: "brain" as const, icon: Brain, label: "Botni O'qitish" },
    { id: "action" as const, icon: Zap, label: "Avtomatik Sotish" },
    { id: "stats" as const, icon: BarChart3, label: "Statistika" },
  ];

  return (
    <motion.div
      key="salesbot"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0xMiAxMmMxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <Bot size={32} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Sotuvchi Robot</h2>
            <p className="text-sm text-white/60 mt-1">
              AI bilan ishlaydigan Telegram savdo boti — o'qiting, sozlang, natijalarni kuzating
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {ctx.connected ? (
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-400/30 text-sm font-bold text-green-300">
                <Wifi size={14} /> Ulangan
              </span>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-400/30 text-sm font-bold text-red-300">
                <WifiOff size={14} /> Ulanmagan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-100 p-1.5">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => ctx.setActiveSubTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              ctx.activeSubTab === t.id
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
            )}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {ctx.activeSubTab === "brain" && <BrainTab />}
      {ctx.activeSubTab === "action" && <ActionTab />}
      {ctx.activeSubTab === "stats" && <StatsTab />}
    </motion.div>
  );
}

export default function SalesBotPage({ userId }: { userId: string }) {
  return (
    <BotProvider userId={userId} active>
      <SalesBotContent />
    </BotProvider>
  );
}
