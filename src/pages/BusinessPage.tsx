import { motion } from "motion/react";
import {
  Sparkles,
  Send,
  Calculator,
  DollarSign,
  Landmark,
  PieChart,
  Rocket,
  Loader2,
} from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "../components/CoreComponents";

// --- Number Formatting Utilities ---
const formatNumber = (value: number): string =>
  new Intl.NumberFormat("uz-UZ").format(value).replace(/\s/g, ",");

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " mlrd";
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + " mln";
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, "") + " ming";
  return value.toString();
};

const formatCurrency = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1_000_000) return `${formatCompact(value)} so'm`;
  return `${formatNumber(value)} so'm`;
};

const FormattedNumber = ({ value, currency, compact, className }: { value: number; currency?: boolean; compact?: boolean; className?: string }) => {
  const display = currency ? formatCurrency(value, compact) : formatNumber(value);
  const tooltip = currency && compact && Math.abs(value) >= 1_000_000 ? formatCurrency(value, false) : undefined;
  return <span className={className} title={tooltip}>{display}</span>;
};

const StatCard = ({ label, value, icon: Icon, color = "slate" }: { label: string; value: number; icon?: any; color?: "orange" | "green" | "red" | "blue" | "slate" }) => {
  const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
    orange: { bg: "bg-orange-50", text: "text-slate-900", border: "border-orange-100", iconBg: "text-orange-500" },
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-100", iconBg: "text-green-500" },
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", iconBg: "text-red-500" },
    blue: { bg: "bg-blue-50", text: "text-slate-900", border: "border-blue-100", iconBg: "text-blue-500" },
    slate: { bg: "bg-slate-50", text: "text-slate-900", border: "border-slate-100", iconBg: "text-slate-500" },
  };
  const c = colorMap[color];
  return (
    <div className={`p-4 ${c.bg} rounded-xl border ${c.border} transition-colors`}>
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && <Icon size={14} className={c.iconBg} />}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-xl font-bold ${c.text} tabular-nums`}><FormattedNumber value={value} currency compact /></p>
      <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{formatNumber(value)} so'm</p>
    </div>
  );
};

interface Message {
  role: "user" | "model";
  text: string;
}

interface BusinessPageProps {
  bizChat: Message[];
  bizInput: string;
  setBizInput: (v: string) => void;
  bizLoading: boolean;
  handleBizChat: (msg?: string) => void;
  loanAmount: number;
  setLoanAmount: (v: number) => void;
  loanRate: number;
  setLoanRate: (v: number) => void;
  loanTerm: number;
  setLoanTerm: (v: number) => void;
  calculateLoan: () => number;
  taxRevenue: number;
  setTaxRevenue: (v: number) => void;
  taxType: string;
  setTaxType: (v: string) => void;
  calculateTax: () => number;
  marketAnalysisInput: string;
  setMarketAnalysisInput: (v: string) => void;
  marketAnalysisResult: string | null;
  marketAnalysisLoading: boolean;
  handleMarketAnalysis: () => void;
  setShowBizPlanForm: (v: boolean) => void;
}

export default function BusinessPage({
  bizChat,
  bizInput,
  setBizInput,
  bizLoading,
  handleBizChat,
  loanAmount,
  setLoanAmount,
  loanRate,
  setLoanRate,
  loanTerm,
  setLoanTerm,
  calculateLoan,
  taxRevenue,
  setTaxRevenue,
  taxType,
  setTaxType,
  calculateTax,
  marketAnalysisInput,
  setMarketAnalysisInput,
  marketAnalysisResult,
  marketAnalysisLoading,
  handleMarketAnalysis,
  setShowBizPlanForm,
}: BusinessPageProps) {
  return (
    <motion.div key="business" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* AI Advisor Chat */}
        <div className="xl:col-span-2 flex flex-col h-[600px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white"><Sparkles size={18} /></div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Moliyaviy Maslahatchi</h3>
              <p className="text-xs text-slate-400">Biznesingiz uchun aqlli yordamchi</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {bizChat.map((msg, idx) => (
              <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] p-4 rounded-2xl text-sm", msg.role === "user" ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm")}>
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            ))}
            {bizLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input type="text" placeholder="Savolingizni yozing (masalan: Biznes-reja qanday tuziladi?)..." className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" value={bizInput} onChange={(e) => setBizInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleBizChat()} />
              <button onClick={() => handleBizChat()} disabled={bizLoading} className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50"><Send size={18} /></button>
            </div>
          </div>
        </div>

        {/* Tools Sidebar */}
        <div className="space-y-6">
          {/* Loan Calculator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3"><Calculator size={18} className="text-orange-500" /><h4 className="font-bold text-sm text-slate-900">Kredit Kalkulyatori</h4></div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Summa (so'm)</label>
                <input type="text" inputMode="numeric" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 tabular-nums" value={formatNumber(loanAmount)} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setLoanAmount(Number(raw) || 0); }} />
                {loanAmount > 0 && <p className="text-[10px] text-slate-400 pl-1">{formatCompact(loanAmount)} so'm</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Foiz (%)</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Muddat (oy)</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} />
                </div>
              </div>
              <StatCard label="Oylik to'lov" value={calculateLoan()} icon={DollarSign} color="orange" />
              {calculateLoan() > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-500">Jami to'lov</span>
                  <span className="font-bold text-slate-700 tabular-nums"><FormattedNumber value={calculateLoan() * loanTerm} currency compact /></span>
                </div>
              )}
            </div>
          </div>

          {/* Tax Calculator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3"><Landmark size={18} className="text-blue-500" /><h4 className="font-bold text-sm text-slate-900">Soliq Hisob-kitobi</h4></div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Yillik tushum (so'm)</label>
                <input type="text" inputMode="numeric" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 tabular-nums" value={formatNumber(taxRevenue)} onChange={(e) => { const raw = e.target.value.replace(/[^0-9]/g, ""); setTaxRevenue(Number(raw) || 0); }} />
                {taxRevenue > 0 && <p className="text-[10px] text-slate-400 pl-1">{formatCompact(taxRevenue)} so'm</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Soliq turi</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500" value={taxType} onChange={(e) => setTaxType(e.target.value)}>
                  <option value="simplified">Aylanmadan soliq (4%)</option>
                  <option value="fixed">Qat'iy belgilangan soliq</option>
                  <option value="general">Umumbelgilangan (12% QQS + foyda)</option>
                </select>
              </div>
              <StatCard label="Taxminiy soliq" value={calculateTax()} icon={Landmark} color="blue" />
              {taxRevenue > 0 && calculateTax() > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-500">Soliqdan keyin</span>
                  <span className="font-bold text-green-600 tabular-nums"><FormattedNumber value={taxRevenue - calculateTax()} currency compact /></span>
                </div>
              )}
            </div>
          </div>

          {/* Market Analysis Tool */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3"><PieChart size={18} className="text-orange-500" /><h4 className="font-bold text-sm text-slate-900">Bozor Tahlili (AI)</h4></div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Biznes g'oyasi</label>
                <input type="text" placeholder="Masalan: Toshkentda kofe do'koni..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500" value={marketAnalysisInput} onChange={(e) => setMarketAnalysisInput(e.target.value)} />
              </div>
              <button onClick={handleMarketAnalysis} disabled={marketAnalysisLoading || !marketAnalysisInput.trim()} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {marketAnalysisLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Sparkles size={16} /><span>Tahlil qilish</span></>}
              </button>
              {marketAnalysisResult && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto prose prose-sm prose-slate"><Markdown>{marketAnalysisResult}</Markdown></div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setShowBizPlanForm(true)} className="p-4 bg-slate-900 text-white rounded-xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors"><Rocket size={18} /><span className="text-[10px] font-bold uppercase tracking-tight">Biznes-reja</span></button>
            <button onClick={() => handleBizChat("Mening biznesim uchun bozor tahlilini qilib bering. O'zbekiston bozoridagi raqobatchilar va imkoniyatlarni qanday aniqlasam bo'ladi?")} className="p-4 bg-white border border-slate-200 text-slate-900 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors"><PieChart size={18} /><span className="text-[10px] font-bold uppercase tracking-tight">Bozor tahlili</span></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
