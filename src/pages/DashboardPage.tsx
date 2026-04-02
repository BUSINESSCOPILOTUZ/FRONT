import { motion } from "motion/react";
import {
  Users,
  DollarSign,
  CheckCircle,
  MessageSquare,
  Eye,
  Target,
  Sparkles,
} from "lucide-react";
import { AnalyticsCard, LeadRow, cn } from "../components/CoreComponents";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- Number Formatting Utilities ---
const formatNumber = (value: number): string =>
  new Intl.NumberFormat("uz-UZ").format(value).replace(/\s/g, ",");

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000)
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " mlrd";
  if (Math.abs(value) >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + " mln";
  if (Math.abs(value) >= 1_000)
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + " ming";
  return value.toString();
};

const formatCurrency = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1_000_000)
    return `${formatCompact(value)} so'm`;
  return `${formatNumber(value)} so'm`;
};

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  createdAt?: any;
}

interface DashboardPageProps {
  leads: Lead[];
  adDateRange: "7" | "30" | "90";
  setAdDateRange: (v: "7" | "30" | "90") => void;
  adPlatform: "all" | "instagram" | "telegram" | "google";
  setAdPlatform: (v: "all" | "instagram" | "telegram" | "google") => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardPage({
  leads,
  adDateRange,
  setAdDateRange,
  adPlatform,
  setAdPlatform,
  setActiveTab,
}: DashboardPageProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard title="Jami Lidlar" value={leads.length} change="+12.5%" icon={Users} />
        <AnalyticsCard title="Konversiyalar" value={Math.round(leads.length * 0.2)} change="+5.2%" icon={CheckCircle} />
        <AnalyticsCard title="Haftalik Daromad" value="12,450,000 so'm" change="+18.7%" icon={DollarSign} />
        <AnalyticsCard title="AI Xabarlar" value="1,240" change="+24.1%" icon={MessageSquare} />
      </div>

      {/* Reklama natijalari */}
      {(() => {
        const adDataByRange: Record<string, { budget: number; impressions: number; leads: number; conversion: number; ctr: number; cpm: number; cps: number; chart: { name: string; impressions: number; leads: number }[] }> = {
          "7": { budget: 450000, impressions: 18200, leads: 12, conversion: 2.8, ctr: 3.1, cpm: 24700, cps: 37500, chart: [{ name: "Dush", impressions: 2400, leads: 1 }, { name: "Sesh", impressions: 2800, leads: 2 }, { name: "Chor", impressions: 3100, leads: 2 }, { name: "Pay", impressions: 2600, leads: 1 }, { name: "Jum", impressions: 2900, leads: 3 }, { name: "Shan", impressions: 2200, leads: 2 }, { name: "Yak", impressions: 2200, leads: 1 }] },
          "30": { budget: 1500000, impressions: 68400, leads: 42, conversion: 3.2, ctr: 2.5, cpm: 21900, cps: 35700, chart: [{ name: "1-hafta", impressions: 15200, leads: 8 }, { name: "2-hafta", impressions: 17800, leads: 11 }, { name: "3-hafta", impressions: 18600, leads: 12 }, { name: "4-hafta", impressions: 16800, leads: 11 }] },
          "90": { budget: 4200000, impressions: 210000, leads: 135, conversion: 3.5, ctr: 2.8, cpm: 20000, cps: 31100, chart: [{ name: "Yanvar", impressions: 58000, leads: 35 }, { name: "Fevral", impressions: 72000, leads: 48 }, { name: "Mart", impressions: 80000, leads: 52 }] },
        };

        const platformMultiplier: Record<string, number> = { all: 1, instagram: 0.45, telegram: 0.35, google: 0.2 };
        const mult = platformMultiplier[adPlatform];
        const base = adDataByRange[adDateRange];
        const ad = {
          budget: Math.round(base.budget * mult),
          impressions: Math.round(base.impressions * mult),
          leads: Math.round(base.leads * mult),
          conversion: +(base.conversion * (mult === 1 ? 1 : 0.7 + Math.random() * 0.6)).toFixed(1),
          ctr: +(base.ctr * (mult === 1 ? 1 : 0.8 + Math.random() * 0.4)).toFixed(1),
          cpm: Math.round(base.cpm * (mult === 1 ? 1 : 0.85 + Math.random() * 0.3)),
          cps: Math.round(base.cps * (mult === 1 ? 1 : 0.8 + Math.random() * 0.4)),
          chart: base.chart.map((d) => ({ name: d.name, impressions: Math.round(d.impressions * mult), leads: Math.max(1, Math.round(d.leads * mult)) })),
        };

        const insights: { text: string; type: "good" | "warn" | "bad" }[] = [];
        if (ad.ctr < 2) insights.push({ text: "CTR past — reklama matnini yaxshilang", type: "bad" });
        else if (ad.ctr >= 3) insights.push({ text: "CTR yuqori — reklama samarali ishlayapti", type: "good" });
        else insights.push({ text: "CTR o'rtacha — A/B test qiling", type: "warn" });
        if (ad.conversion >= 3) insights.push({ text: "Konversiya yuqori — kampaniya samarali", type: "good" });
        else if (ad.conversion < 2) insights.push({ text: "Konversiya past — landing sahifani optimallashtiring", type: "bad" });
        if (ad.cps > 40000) insights.push({ text: "CPS yuqori — auditoriyani aniqroq tanlang", type: "warn" });
        else insights.push({ text: "CPS optimal — xarajat nazoratda", type: "good" });

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Reklama natijalari</h3>
                <p className="text-sm text-slate-400 mt-0.5">So'nggi kampaniyalar bo'yicha asosiy ko'rsatkichlar</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(["7", "30", "90"] as const).map((v) => (
                  <button key={v} onClick={() => setAdDateRange(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", adDateRange === v ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>
                    {v === "7" ? "7 kun" : v === "30" ? "30 kun" : "90 kun"}
                  </button>
                ))}
                <select value={adPlatform} onChange={(e) => setAdPlatform(e.target.value as any)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="all">Barcha platformalar</option>
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="google">Google</option>
                </select>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><DollarSign size={12} /> Xarajat</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Byudjet</p>
                      <p className="text-xl font-bold text-slate-900 tabular-nums">{formatCurrency(ad.budget, true)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{formatNumber(ad.budget)} so'm</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CPM</p>
                      <p className="text-xl font-bold text-slate-900 tabular-nums">{formatCurrency(ad.cpm, true)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">1000 ko'rish narxi</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Eye size={12} /> Trafik</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ko'rishlar</p>
                      <p className="text-xl font-bold text-slate-900 tabular-nums">{formatCompact(ad.impressions)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{formatNumber(ad.impressions)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CTR</p>
                      <p className={cn("text-xl font-bold tabular-nums", ad.ctr >= 3 ? "text-green-600" : ad.ctr < 2 ? "text-red-500" : "text-slate-900")}>{ad.ctr}%</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">bosish darajasi</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Target size={12} /> Natija</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Murojaatlar</p>
                      <p className="text-xl font-bold text-slate-900 tabular-nums">{ad.leads}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Konversiya</p>
                      <p className={cn("text-xl font-bold tabular-nums", ad.conversion >= 3 ? "text-green-600" : ad.conversion < 2 ? "text-red-500" : "text-slate-900")}>{ad.conversion}%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CPS</p>
                      <p className="text-xl font-bold text-slate-900 tabular-nums">{formatCompact(ad.cps)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">so'm/lid</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-100 p-5">
                  <p className="text-xs font-bold text-slate-500 mb-4">Ko'rishlar va Murojaatlar</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={ad.chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradImpr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(value: number, name: string) => [formatNumber(value), name === "impressions" ? "Ko'rishlar" : "Murojaatlar"]} />
                      <Area type="monotone" dataKey="impressions" stroke="#f97316" strokeWidth={2} fill="url(#gradImpr)" />
                      <Area type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} fill="url(#gradLeads)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Sparkles size={14} className="text-orange-400" /> Tezkor tavsiyalar</p>
                  <div className="space-y-2">
                    {insights.map((ins, i) => (
                      <div key={i} className={cn("p-3 rounded-xl border text-sm", ins.type === "good" && "bg-green-50 border-green-100 text-green-700", ins.type === "warn" && "bg-orange-50 border-orange-100 text-orange-700", ins.type === "bad" && "bg-red-50 border-red-100 text-red-600")}>
                        <span className="mr-1.5">{ins.type === "good" ? "✓" : ins.type === "warn" ? "⚠" : "✗"}</span>
                        {ins.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Oxirgi Lidlar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Oxirgi Lidlar</h3>
          <button onClick={() => setActiveTab("crm")} className="text-sm text-orange-500 font-semibold hover:underline">Hammasini ko'rish</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Ism</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Manba</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amal</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">Hozircha lidlar mavjud emas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
