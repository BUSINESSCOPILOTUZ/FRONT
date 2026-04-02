import React from "react";
import {
  Users,
  RefreshCw,
  MessageSquare,
  Target,
  Activity,
  BarChart3,
  Radio,
  CircleDot,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../../lib/utils";
import { formatNumber } from "../../../lib/format";
import { useBotContext } from "../BotProvider";

export function StatsTab() {
  const ctx = useBotContext();

  const kpis = [
    {
      label: "Jami Mijozlar",
      value: ctx.analytics?.uniqueCustomers || 0,
      icon: Users,
      color: "bg-blue-50 text-blue-500 border-blue-100",
    },
    {
      label: "Qayta Bog'lanishlar",
      value: ctx.analytics?.retargets || 0,
      icon: RefreshCw,
      color: "bg-orange-50 text-orange-500 border-orange-100",
    },
    {
      label: "Jami Suhbatlar",
      value: ctx.analytics?.totalInteractions || 0,
      icon: MessageSquare,
      color: "bg-green-50 text-green-500 border-green-100",
    },
    {
      label: "Muvaffaqiyat",
      value: `${ctx.analytics?.conversionRate || 0}%`,
      icon: Target,
      color: "bg-purple-50 text-purple-500 border-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-2.5 rounded-xl ${kpi.color} border mb-3`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {kpi.label}
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
              {typeof kpi.value === "number" ? formatNumber(kpi.value) : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <Activity size={18} className="text-slate-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Faollik Grafigi</h3>
              <p className="text-xs text-slate-400">Oxirgi 7 kun ichida bot suhbatlari</p>
            </div>
          </div>
          <button
            onClick={ctx.loadStats}
            disabled={ctx.statsLoading}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={14} className={ctx.statsLoading ? "animate-spin" : ""} /> Yangilash
          </button>
        </div>

        {ctx.analytics?.activity && ctx.analytics.activity.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={ctx.analytics.activity}>
              <defs>
                <linearGradient id="sbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Suhbatlar"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#sbGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-60 flex items-center justify-center text-slate-300">
            {ctx.statsLoading ? (
              <Loader2 size={32} className="animate-spin" />
            ) : (
              <div className="text-center space-y-2">
                <BarChart3 size={40} className="mx-auto text-slate-200" />
                <p className="text-sm text-slate-400">Hozircha ma'lumot yo'q</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Feed */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-50 rounded-xl">
            <Radio size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Jonli Oqim</h3>
            <p className="text-xs text-slate-400">Botning oxirgi 5 ta harakati</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <CircleDot size={10} className="text-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>

        {ctx.logs.length > 0 ? (
          <div className="space-y-3">
            {ctx.logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div
                  className={cn(
                    "mt-0.5 w-2 h-2 rounded-full shrink-0",
                    log.type === "faq"
                      ? "bg-green-400"
                      : log.type === "retarget"
                        ? "bg-blue-400"
                        : log.type === "loyalty"
                          ? "bg-amber-400"
                          : "bg-slate-300",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">
                      {log.type === "faq"
                        ? "FAQ javob"
                        : log.type === "retarget"
                          ? "Qayta bog'lanish"
                          : log.type === "loyalty"
                            ? "Sodiq mijoz"
                            : "Xabar"}
                    </span>
                    {log.username && (
                      <span className="text-[10px] text-slate-400">@{log.username}</span>
                    )}
                    <span className="text-[10px] text-slate-300 ml-auto">
                      {new Date(log.createdAt).toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {log.userMessage ? `"${log.userMessage}"` : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-300">
            {ctx.statsLoading ? (
              <Loader2 size={24} className="animate-spin mx-auto" />
            ) : (
              <>
                <Radio size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-400">Hozircha loglar yo'q</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
