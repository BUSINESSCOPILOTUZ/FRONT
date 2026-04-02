import { motion } from "motion/react";
import { MessageSquare, Share2, CheckCircle, Clock } from "lucide-react";
import { cn } from "../components/CoreComponents";

interface AutomationSettings {
  telegramBot: boolean;
  autoPosting: boolean;
  aiReply: boolean;
  welcomeMessage: string;
}

interface AutomationPageProps {
  automationSettings: AutomationSettings;
  setAutomationSettings: React.Dispatch<React.SetStateAction<AutomationSettings>>;
  saveStatus: string | null;
  handleSaveAutomation: () => void;
}

export default function AutomationPage({
  automationSettings,
  setAutomationSettings,
  saveStatus,
  handleSaveAutomation,
}: AutomationPageProps) {
  return (
    <motion.div
      key="automation"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-8"
    >
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="border-b border-slate-50 pb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Avtomatizatsiya Sozlamalari</h3>
          <p className="text-slate-500">Ijtimoiy tarmoqlar va AI botlarni boshqarish</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white"><MessageSquare size={24} /></div>
                <div>
                  <p className="font-bold text-slate-900">Telegram Bot</p>
                  <p className="text-xs text-slate-500">Avtomatik javob berish</p>
                </div>
              </div>
              <button
                onClick={() => setAutomationSettings((s) => ({ ...s, telegramBot: !s.telegramBot }))}
                className={cn("w-12 h-6 rounded-full transition-all relative", automationSettings.telegramBot ? "bg-orange-500" : "bg-slate-300")}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", automationSettings.telegramBot ? "left-7" : "left-1")} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white"><Share2 size={24} /></div>
                <div>
                  <p className="font-bold text-slate-900">Auto-Posting</p>
                  <p className="text-xs text-slate-500">Rejali postlar</p>
                </div>
              </div>
              <button
                onClick={() => setAutomationSettings((s) => ({ ...s, autoPosting: !s.autoPosting }))}
                className={cn("w-12 h-6 rounded-full transition-all relative", automationSettings.autoPosting ? "bg-orange-500" : "bg-slate-300")}
              >
                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", automationSettings.autoPosting ? "left-7" : "left-1")} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700">Xush kelibsiz xabari</label>
            <textarea
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
              value={automationSettings.welcomeMessage}
              onChange={(e) => setAutomationSettings((s) => ({ ...s, welcomeMessage: e.target.value }))}
            />
            <button
              onClick={handleSaveAutomation}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              {saveStatus === "Saqlanmoqda..." ? <Clock className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              {saveStatus || "Sozlamalarni saqlash"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
