import { motion } from "motion/react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Star,
  BadgeCheck,
  MapPin,
  CheckCircle,
  Bookmark,
  Instagram,
  Send,
  Youtube,
  Zap,
  X,
} from "lucide-react";
import { cn } from "../components/CoreComponents";

const MOCK_INFLUENCERS = [
  { id: "m1", name: "Munisa Rizayeva", username: "@munisa_rizayeva", avatar: "https://i.pravatar.cc/300?img=1", platform: ["instagram", "telegram", "youtube"], followers: 5200000, engagement: 4.8, price_per_post: 3500000, niche: "lifestyle", location: "Toshkent", contact: { telegram: "@munisa_agent", phone: "+998 90 123 45 67" }, verified: true, top: true, promoCode: "MUNISA10", conversions: 120, revenue: 15000000 },
  { id: "m2", name: "Shahzoda", username: "@shahzoda_official", avatar: "https://i.pravatar.cc/300?img=5", platform: ["instagram", "youtube", "tiktok"], followers: 4500000, engagement: 5.2, price_per_post: 4000000, niche: "lifestyle", location: "Toshkent", contact: { telegram: "@shahzoda_pr", agent: "Creative Agency UZ" }, verified: true, top: true, promoCode: "SHAHZODA15", conversions: 85, revenue: 9000000 },
  { id: "m3", name: "Dilshod Mirzamuratov", username: "@dilshod_tech", avatar: "https://i.pravatar.cc/300?img=12", platform: ["youtube", "telegram"], followers: 890000, engagement: 6.1, price_per_post: 1500000, niche: "tech", location: "Toshkent", contact: { telegram: "@dilshod_dm" }, verified: true, top: false, promoCode: "", conversions: 45, revenue: 3200000 },
  { id: "m4", name: "Nodira Karimova", username: "@nodira_food", avatar: "https://i.pravatar.cc/300?img=9", platform: ["instagram", "tiktok"], followers: 320000, engagement: 7.3, price_per_post: 800000, niche: "food", location: "Samarqand", contact: { phone: "+998 93 456 78 90" }, verified: false, top: false, promoCode: "", conversions: 30, revenue: 1500000 },
  { id: "m5", name: "Akbar Rakhimov", username: "@akbar_business", avatar: "https://i.pravatar.cc/300?img=15", platform: ["telegram", "youtube"], followers: 1100000, engagement: 3.9, price_per_post: 2000000, niche: "business", location: "Toshkent", contact: { telegram: "@akbar_biz", agent: "BizReach Agency" }, verified: true, top: false, promoCode: "", conversions: 60, revenue: 5500000 },
  { id: "m6", name: "Zulfiya Hamidova", username: "@zulfiya_edu", avatar: "https://i.pravatar.cc/300?img=25", platform: ["youtube", "telegram", "instagram"], followers: 750000, engagement: 5.8, price_per_post: 1200000, niche: "education", location: "Buxoro", contact: { telegram: "@zulfiya_contact", phone: "+998 97 111 22 33" }, verified: false, top: false, promoCode: "", conversions: 22, revenue: 1800000 },
];

interface InfluencersPageProps {
  influencers: any[];
  infSearchTerm: string;
  setInfSearchTerm: (v: string) => void;
  infPlatformFilter: string;
  setInfPlatformFilter: (v: string) => void;
  infNicheFilter: string;
  setInfNicheFilter: (v: string) => void;
  infFollowersFilter: string;
  setInfFollowersFilter: (v: string) => void;
  infSortBy: string;
  setInfSortBy: (v: string) => void;
  infSaved: Set<string>;
  setInfSaved: React.Dispatch<React.SetStateAction<Set<string>>>;
  setInfContactModal: (v: any) => void;
  setShowAddInfluencerModal: (v: boolean) => void;
}

export default function InfluencersPage({
  influencers,
  infSearchTerm,
  setInfSearchTerm,
  infPlatformFilter,
  setInfPlatformFilter,
  infNicheFilter,
  setInfNicheFilter,
  infFollowersFilter,
  setInfFollowersFilter,
  infSortBy,
  setInfSortBy,
  infSaved,
  setInfSaved,
  setInfContactModal,
  setShowAddInfluencerModal,
}: InfluencersPageProps) {
  // Merge real DB influencers with mock data
  const dbInfluencers = influencers.map((inf: any) => ({
    id: inf.id,
    name: inf.name,
    username: `@${inf.name.toLowerCase().replace(/\s+/g, "_")}`,
    avatar: `https://i.pravatar.cc/300?u=${inf.id}`,
    platform: ["instagram", "telegram"] as string[],
    followers:
      typeof inf.followers === "string"
        ? parseFloat(inf.followers.replace(/[^0-9.]/g, "")) *
          (inf.followers.includes("M") ? 1000000 : inf.followers.includes("K") ? 1000 : 1)
        : inf.followers || 0,
    engagement: 4.5,
    price_per_post: 1500000,
    niche: "lifestyle",
    location: "Toshkent",
    contact: { telegram: `@${inf.name.toLowerCase().replace(/\s+/g, "_")}` },
    verified: false,
    top: false,
    promoCode: inf.promoCode || "",
    conversions: inf.conversions || 0,
    revenue: inf.revenue || 0,
  }));

  const allInfluencers = [
    ...MOCK_INFLUENCERS,
    ...dbInfluencers.filter((d: any) => !MOCK_INFLUENCERS.find((m) => m.name === d.name)),
  ];

  let filtered = allInfluencers.filter((inf) => {
    if (infSearchTerm && !inf.name.toLowerCase().includes(infSearchTerm.toLowerCase()) && !inf.niche.toLowerCase().includes(infSearchTerm.toLowerCase()) && !inf.username.toLowerCase().includes(infSearchTerm.toLowerCase())) return false;
    if (infPlatformFilter !== "all" && !inf.platform.includes(infPlatformFilter)) return false;
    if (infNicheFilter !== "all" && inf.niche !== infNicheFilter) return false;
    if (infFollowersFilter === "10k" && inf.followers < 10000) return false;
    if (infFollowersFilter === "50k" && inf.followers < 50000) return false;
    if (infFollowersFilter === "100k" && inf.followers < 100000) return false;
    if (infFollowersFilter === "1m" && inf.followers < 1000000) return false;
    return true;
  });
  if (infSortBy === "followers") filtered.sort((a, b) => b.followers - a.followers);
  if (infSortBy === "engagement") filtered.sort((a, b) => b.engagement - a.engagement);
  if (infSortBy === "revenue") filtered.sort((a, b) => b.revenue - a.revenue);

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "") + "K";
    return n.toString();
  };

  const platformIcon = (p: string) => {
    switch (p) {
      case "instagram": return <Instagram size={13} />;
      case "telegram": return <Send size={13} />;
      case "youtube": return <Youtube size={13} />;
      case "tiktok": return <Zap size={13} />;
      default: return null;
    }
  };
  const platformColor = (p: string) => {
    switch (p) {
      case "instagram": return "bg-pink-100 text-pink-600";
      case "telegram": return "bg-sky-100 text-sky-600";
      case "youtube": return "bg-red-100 text-red-600";
      case "tiktok": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };
  const nicheLabel: Record<string, string> = { food: "Oziq-ovqat", education: "Ta'lim", tech: "Texnologiya", lifestyle: "Lifestyle", business: "Biznes" };
  const nicheColor: Record<string, string> = { food: "bg-amber-50 text-amber-700", education: "bg-blue-50 text-blue-700", tech: "bg-cyan-50 text-cyan-700", lifestyle: "bg-orange-50 text-orange-700", business: "bg-emerald-50 text-emerald-700" };

  return (
    <motion.div key="influencers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Influencer Marketplace</h3>
          <p className="text-sm text-slate-500">O'zbekistonning eng yaxshi influencerlari bilan hamkorlik qiling</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"><Users size={14} /> {allInfluencers.length} ta influencer</span>
          <button onClick={() => setShowAddInfluencerModal(true)} className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-200 transition-colors hover:bg-orange-600 active:scale-95"><Plus size={16} /> Yangi Hamkor</button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Ism, niche yoki username bo'yicha qidiring..." value={infSearchTerm} onChange={(e) => setInfSearchTerm(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={infPlatformFilter} onChange={(e) => setInfPlatformFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">Barcha platformalar</option>
              <option value="instagram">Instagram</option>
              <option value="telegram">Telegram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
            </select>
            <select value={infNicheFilter} onChange={(e) => setInfNicheFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">Barcha sohalar</option>
              <option value="food">Oziq-ovqat</option>
              <option value="education">Ta'lim</option>
              <option value="tech">Texnologiya</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="business">Biznes</option>
            </select>
            <select value={infFollowersFilter} onChange={(e) => setInfFollowersFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">Obunachi soni</option>
              <option value="10k">10K+</option>
              <option value="50k">50K+</option>
              <option value="100k">100K+</option>
              <option value="1m">1M+</option>
            </select>
            <select value={infSortBy} onChange={(e) => setInfSortBy(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-orange-500">
              <option value="followers">Eng ko'p obunachi</option>
              <option value="engagement">Eng faol</option>
              <option value="revenue">Eng yuqori daromad</option>
            </select>
          </div>
        </div>

        {(infSearchTerm || infPlatformFilter !== "all" || infNicheFilter !== "all" || infFollowersFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Filtrlar:</span>
            {infSearchTerm && <button onClick={() => setInfSearchTerm("")} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">"{infSearchTerm}" <X size={12} /></button>}
            {infPlatformFilter !== "all" && <button onClick={() => setInfPlatformFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100">{infPlatformFilter} <X size={12} /></button>}
            {infNicheFilter !== "all" && <button onClick={() => setInfNicheFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100">{nicheLabel[infNicheFilter] || infNicheFilter} <X size={12} /></button>}
            {infFollowersFilter !== "all" && <button onClick={() => setInfFollowersFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100">{infFollowersFilter.toUpperCase()}+ <X size={12} /></button>}
            <button onClick={() => { setInfSearchTerm(""); setInfPlatformFilter("all"); setInfNicheFilter("all"); setInfFollowersFilter("all"); }} className="text-xs font-semibold text-red-500 hover:underline">Tozalash</button>
          </div>
        )}
      </div>

      {/* INFLUENCER GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((inf) => (
          <div key={inf.id} className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
            {inf.top && <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"><Star size={10} fill="currentColor" /> TOP</div>}
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img src={inf.avatar} alt={inf.name} className="h-14 w-14 rounded-xl border border-slate-100 object-cover" referrerPolicy="no-referrer" />
                  {inf.verified && <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white"><BadgeCheck size={12} /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-slate-900">{inf.name}</h4>
                  <p className="text-xs text-slate-400">{inf.username}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {inf.platform.map((p: string) => (
                      <span key={p} className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold", platformColor(p))}>{platformIcon(p)} {p.charAt(0).toUpperCase() + p.slice(1)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-6 grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-100 bg-slate-50">
              <div className="px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Obunachi</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{formatFollowers(inf.followers)}</p>
              </div>
              <div className="px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Faollik</p>
                <p className="mt-0.5 text-sm font-bold text-green-600">{inf.engagement}%</p>
              </div>
              <div className="px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Narx/post</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{(inf.price_per_post / 1000000).toFixed(1)}M</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", nicheColor[inf.niche] || "bg-slate-50 text-slate-600")}>{nicheLabel[inf.niche] || inf.niche}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"><MapPin size={10} /> {inf.location}</span>
                {inf.promoCode && <span className="rounded-full bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-orange-600">{inf.promoCode}</span>}
              </div>
              {inf.revenue > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-500"><CheckCircle size={12} className="mr-1 inline text-green-500" />{inf.conversions} konversiya</span>
                  <span className="font-bold text-green-600">{(inf.revenue / 1000000).toFixed(1)}M so'm</span>
                </div>
              )}
              <div className="mt-auto flex items-center gap-2 pt-2">
                <button onClick={() => setInfContactModal(inf)} className="flex-1 rounded-xl bg-orange-500 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]">Bog'lanish</button>
                <button onClick={() => setInfSaved((prev) => { const next = new Set(prev); next.has(inf.id) ? next.delete(inf.id) : next.add(inf.id); return next; })} className={cn("flex h-10 w-10 items-center justify-center rounded-xl border transition-colors", infSaved.has(inf.id) ? "border-orange-200 bg-orange-50 text-orange-500" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-orange-500")} title="Saqlash">
                  <Bookmark size={16} fill={infSaved.has(inf.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-white py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200"><Users size={32} /></div>
          <p className="text-lg font-bold text-slate-900">Mos influencer topilmadi</p>
          <p className="mt-1 text-sm text-slate-400">Filtrlarni o'zgartiring yoki qidiruv so'zini tekshiring</p>
          <button onClick={() => { setInfSearchTerm(""); setInfPlatformFilter("all"); setInfNicheFilter("all"); setInfFollowersFilter("all"); }} className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-95"><Filter size={16} /> Filtrlarni tozalash</button>
        </div>
      )}
    </motion.div>
  );
}
