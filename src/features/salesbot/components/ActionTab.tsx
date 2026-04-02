import React from "react";
import {
  RefreshCw,
  Gift,
  MessageSquare,
  Brain,
  Activity,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useBotContext } from "../BotProvider";

export function ActionTab() {
  const ctx = useBotContext();

  return (
    <div className="space-y-6">
      {/* Re-engagement */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <RefreshCw size={18} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Qayta Bog'lanish (Retargeting)
              </h3>
              <p className="text-xs text-slate-400">
                Xarid qilmagan mijozlarga avtomatik xabar yuborish
              </p>
            </div>
          </div>
          <button
            onClick={() => ctx.setRetargetEnabled(!ctx.retargetEnabled)}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors",
              ctx.retargetEnabled ? "bg-orange-500" : "bg-slate-200",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
                ctx.retargetEnabled ? "left-6" : "left-1",
              )}
            />
          </button>
        </div>

        {ctx.retargetEnabled && (
          <div className="space-y-4 pl-14">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-slate-600 whitespace-nowrap">
                Kutish muddati:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={ctx.retargetDays}
                  onChange={(e) => ctx.setRetargetDays(parseInt(e.target.value) || 7)}
                  className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-bold"
                />
                <span className="text-sm text-slate-500">kun</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">
                Xabar matni:
              </label>
              <textarea
                value={ctx.retargetMessage}
                onChange={(e) => ctx.setRetargetMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loyalty System */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Gift size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Sodiq Mijozlar Dasturi
              </h3>
              <p className="text-xs text-slate-400">
                Eng faol 10% mijozlarga avtomatik chegirma kod yuborish
              </p>
            </div>
          </div>
          <button
            onClick={() => ctx.setLoyaltyEnabled(!ctx.loyaltyEnabled)}
            className={cn(
              "relative w-12 h-7 rounded-full transition-colors",
              ctx.loyaltyEnabled ? "bg-orange-500" : "bg-slate-200",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
                ctx.loyaltyEnabled ? "left-6" : "left-1",
              )}
            />
          </button>
        </div>

        {ctx.loyaltyEnabled && (
          <div className="space-y-4 pl-14">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-slate-600 whitespace-nowrap">
                Chegirma foizi:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={ctx.loyaltyDiscount}
                  onChange={(e) => ctx.setLoyaltyDiscount(parseInt(e.target.value) || 10)}
                  className="w-20 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-bold"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">
                Xabar matni:
              </label>
              <textarea
                value={ctx.loyaltyMessage}
                onChange={(e) => ctx.setLoyaltyMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                rows={3}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {"{discount}"} — chegirma foizi avtomatik qo'yiladi
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Smart FAQ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <MessageSquare size={18} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Aqlli Javob Berish</h3>
            <p className="text-xs text-slate-400">
              Bot bilimlar bazasi asosida FAQ savollarga javob beradi
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Brain, title: "RAG Qidiruv", desc: "Bilimlar bazasidan kontekst topadi" },
            {
              icon: MessageSquare,
              title: "AI Javob",
              desc: "GPT-4o-mini bilan javob generatsiya",
            },
            {
              icon: Activity,
              title: "Logga Yozish",
              desc: "Har bir suhbatni statistikada saqlaydi",
            },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <item.icon size={18} className="text-slate-500 mb-2" />
              <p className="text-sm font-bold text-slate-800">{item.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save all settings */}
      <button
        onClick={ctx.saveSettings}
        disabled={ctx.settingsSaving}
        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
      >
        {ctx.settingsSaving ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Check size={20} />
        )}
        Barcha Sozlamalarni Saqlash
      </button>
    </div>
  );
}
