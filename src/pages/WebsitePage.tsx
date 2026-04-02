import { motion } from "motion/react";
import { Globe, Clock, Zap, Download, Layout, Code, TrendingUp } from "lucide-react";

interface WebsitePageProps {
  websiteInput: string;
  setWebsiteInput: (v: string) => void;
  websiteResult: string | null;
  websiteLoading: boolean;
  handleGenerateWebsite: () => void;
}

export default function WebsitePage({
  websiteInput,
  setWebsiteInput,
  websiteResult,
  websiteLoading,
  handleGenerateWebsite,
}: WebsitePageProps) {
  return (
    <motion.div
      key="website"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Sayt Yaratuvchi</h3>
            <p className="text-sm text-slate-500">Biznesingiz uchun mukammal veb-sayt konseptini yarating</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Sizga qanday sayt kerak?</label>
            <textarea
              className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-base outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-300"
              placeholder="Masalan: Mebel do'koni uchun zamonaviy landing page. Katalog, savatcha va buyurtma berish tugmasi bo'lsin. Ranglar jigarrang va oq bo'lishi kerak..."
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerateWebsite}
            disabled={websiteLoading}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 active:scale-[0.98] disabled:opacity-50"
          >
            {websiteLoading ? <Clock className="animate-spin" size={24} /> : <Zap size={24} />}
            Sayt Konseptini Yaratish
          </button>
        </div>
      </div>

      {websiteResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
              <Layout size={20} className="text-orange-500" />
              Sayt Strukturasi va Dizayni
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([websiteResult], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "sayt_konsepti.txt";
                  a.click();
                }}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100 font-medium">
            {websiteResult}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Code size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Texnologiya</p>
                <p className="text-sm font-bold text-slate-700">React + Tailwind</p>
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center"><Layout size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Sahifalar</p>
                <p className="text-sm font-bold text-slate-700">5-7 ta sahifa</p>
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><TrendingUp size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">SEO</p>
                <p className="text-sm font-bold text-slate-700">Optimallashgan</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
