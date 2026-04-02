import React from "react";
import {
  Shield,
  Bot,
  Brain,
  MessageSquare,
  Send,
  Upload,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Wifi,
  Check,
} from "lucide-react";
import { useBotContext } from "../BotProvider";

export function BrainTab() {
  const ctx = useBotContext();

  return (
    <div className="space-y-6">
      {/* Token Connection */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 rounded-xl">
            <Shield size={18} className="text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Bot Ulanishi</h3>
            <p className="text-xs text-slate-400">
              Telegram @BotFather dan olingan tokenni kiriting
            </p>
          </div>
        </div>

        {ctx.connected && ctx.botInfo ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Bot size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">
                  @{ctx.botInfo.username || "bot"}
                </p>
                <p className="text-xs text-green-600">Muvaffaqiyatli ulangan ✓</p>
              </div>
            </div>
            <button
              onClick={ctx.disconnect}
              className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
            >
              Uzish
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="123456789:ABCdefGHIjklMNO..."
                value={ctx.botToken}
                onChange={(e) => ctx.setBotToken(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
              <button
                onClick={ctx.validateToken}
                disabled={ctx.tokenValidating}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {ctx.tokenValidating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Wifi size={14} />
                )}
                Tekshirish
              </button>
            </div>
            {ctx.tokenError && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle size={12} /> {ctx.tokenError}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Base */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl">
            <Brain size={18} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Bilimlar Bazasi (RAG)</h3>
            <p className="text-xs text-slate-400">
              Mahsulotlar, narxlar va biznes haqida ma'lumot yuklang
            </p>
          </div>
        </div>

        {/* Upload File */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer transition-all group">
            <Upload
              size={24}
              className="text-slate-400 group-hover:text-orange-500 transition-colors mb-2"
            />
            <span className="text-sm font-bold text-slate-600 group-hover:text-orange-600">
              Fayl yuklash
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              PDF, DOCX, TXT — 10MB gacha
            </span>
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".pdf,.docx,.doc,.txt"
              onChange={ctx.uploadFile}
              disabled={ctx.knowledgeUploading}
            />
            {ctx.knowledgeUploading && (
              <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-orange-500" />
              </div>
            )}
          </label>

          <div className="flex flex-col gap-2">
            <textarea
              placeholder={"Mahsulotlar haqida matn yozing...\nNarxlar, tafsilotlar, FAQ va h.k."}
              value={ctx.knowledgeText}
              onChange={(e) => ctx.setKnowledgeText(e.target.value)}
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
              rows={4}
            />
            <button
              onClick={ctx.uploadText}
              disabled={ctx.knowledgeUploading || !ctx.knowledgeText.trim()}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Matn qo'shish
            </button>
          </div>
        </div>

        {/* Knowledge chunks list */}
        {ctx.knowledgeChunks.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Yuklangan ma'lumotlar ({ctx.knowledgeChunks.length} bo'lak)
            </p>
            {ctx.knowledgeChunks.map((chunk) => (
              <div
                key={chunk._id}
                className="flex items-start justify-between p-3 bg-slate-50 rounded-xl group"
              >
                <div className="flex-1 min-w-0">
                  {chunk.fileName && (
                    <span className="text-[10px] font-bold text-blue-500 uppercase">
                      {chunk.fileName}
                    </span>
                  )}
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    {chunk.content.slice(0, 120)}...
                  </p>
                </div>
                <button
                  onClick={() => ctx.deleteChunk(chunk._id)}
                  className="ml-3 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Prompt Editor */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-xl">
            <MessageSquare size={18} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Bot Shaxsiyati</h3>
            <p className="text-xs text-slate-400">
              Bot qanday muomala qilishi kerakligini belgilang
            </p>
          </div>
        </div>
        <textarea
          value={ctx.systemPrompt}
          onChange={(e) => ctx.setSystemPrompt(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
          rows={5}
          placeholder="Masalan: Siz xushmuomala sotuvchisiz..."
        />
        <button
          onClick={ctx.saveSettings}
          disabled={ctx.settingsSaving}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {ctx.settingsSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          Saqlash
        </button>
      </div>

      {/* Test Chat */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-xl">
            <Send size={18} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Test Suhbat</h3>
            <p className="text-xs text-slate-400">
              Botni sinab ko'ring — bilimlar bazasi asosida javob beradi
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Masalan: Narxlaringiz qancha?"
            value={ctx.testMessage}
            onChange={(e) => ctx.setTestMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ctx.testChat()}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none"
          />
          <button
            onClick={ctx.testChat}
            disabled={ctx.testLoading || !ctx.testMessage.trim()}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {ctx.testLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Yuborish
          </button>
        </div>
        {ctx.testResponse && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-orange-500 uppercase mb-2">Bot javobi:</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{ctx.testResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
