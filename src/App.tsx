import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
declare var process: any;
import {
  Sidebar,
  AnalyticsCard,
  LeadRow,
  cn,
} from "./components/CoreComponents";
import {
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  LogIn,
  LogOut,
  Share2,
  Filter,
  Download,
  Search,
  MoreVertical,
  Calendar,
  BarChart3,
  FileText,
  Rocket,
  Calculator,
  PieChart,
  Landmark,
  Send,
  Sparkles,
  Globe,
  Code,
  Layout,
  Zap,
  Loader2,
  Eye,
  Copy,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Hash,
  Star,
  Heart,
  Bookmark,
  MapPin,
  BadgeCheck,
  ExternalLink,
  Phone,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Instagram,
  Youtube,
  Target,
  MousePointerClick,
  TrendingDown,
  Image,
  Type,
  Languages,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// --- Number Formatting Utilities ---
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("uz-UZ").format(value).replace(/\s/g, ",");
};

const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " mlrd";
  if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + " mln";
  if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1).replace(/\.0$/, "") + " ming";
  return value.toString();
};

const formatCurrency = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1_000_000) {
    return `${formatCompact(value)} so'm`;
  }
  return `${formatNumber(value)} so'm`;
};

// --- Reusable UI Components ---
const FormattedNumber = ({ value, currency, compact, className }: { value: number; currency?: boolean; compact?: boolean; className?: string }) => {
  const display = currency ? formatCurrency(value, compact) : formatNumber(value);
  const tooltip = currency && compact && Math.abs(value) >= 1_000_000 ? formatCurrency(value, false) : undefined;
  return (
    <span className={className} title={tooltip}>
      {display}
    </span>
  );
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
      <p className={`text-xl font-bold ${c.text} tabular-nums`}>
        <FormattedNumber value={value} currency compact />
      </p>
      <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
        {formatNumber(value)} so'm
      </p>
    </div>
  );
};

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Xatolik yuz berdi
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Ilovada kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang
              yoki keyinroq urinib ko'ring.
            </p>
            <pre className="text-left bg-slate-50 p-4 rounded-lg text-xs overflow-auto max-h-40 mb-6 font-mono text-red-600">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Sahifani yangilash
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- AI Setup (Backend Proxy) ---
// Use deployed API in production
const API_BASE = "https://apibusinesscopilot.masatov.uz/api/ai";
const CONTENT_API = "https://apibusinesscopilot.masatov.uz/api/content-plans";

const aiApi = {
  generateContent: async (topic: string) => {
    const res = await fetch(`${API_BASE}/generate-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data.text;
  },
  bizChat: async (message: string, chatHistory: Message[]) => {
    const res = await fetch(`${API_BASE}/biz-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chatHistory }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data.text;
  },
  generateBizPlan: async (formData: any) => {
    const res = await fetch(`${API_BASE}/generate-biz-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data.text;
  },
  generateWebsite: async (description: string) => {
    const res = await fetch(`${API_BASE}/generate-website`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data.text;
  },
  generateAds: async (description: string, platform: string, language?: string) => {
    // Extended: sends language for TG Ads (uz, en, ru)
    const res = await fetch(`${API_BASE}/generate-ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, platform, ...(language && { language }) }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  marketAnalysis: async (businessIdea: string) => {
    const res = await fetch(`${API_BASE}/market-analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessIdea }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data.text;
  },
};

// --- Types ---
interface Lead {
  id: string;
  name: string;
  phone: string;
  status: "cold" | "warm" | "hot" | "appointment";
  source: string;
  createdAt?: Timestamp;
}

interface Analytics {
  leads: number;
  conversions: number;
  revenue: string;
}

interface ScheduledPost {
  day: string;
  date: string;
  time: string;
  title: string;
  type: string;
  content: string;
  hashtags: string[];
  status: "pending" | "scheduled" | "sent" | "failed";
  sentAt?: string;
}

interface ContentPlan {
  id: string;
  title: string;
  rawText: string;
  generatedPlan: string;
  scheduledPosts: ScheduledPost[];
  telegramChannelId?: string;
  status: "pending" | "approved" | "completed" | "rejected";
  createdAt: Timestamp;
}

interface Message {
  role: "user" | "model";
  text: string;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [automationSettings, setAutomationSettings] = useState({
    telegramBot: true,
    autoPosting: false,
    aiReply: true,
    welcomeMessage: "Assalomu alaykum! BUSINESS COPILOT ga xush kelibsiz.",
  });
  const [loading, setLoading] = useState(true);
  const [contentInput, setContentInput] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [telegramChannelId, setTelegramChannelId] = useState("");
  const [approvingPlanId, setApprovingPlanId] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddInfluencerModal, setShowAddInfluencerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Influencer Marketplace State
  const [infSearchTerm, setInfSearchTerm] = useState("");
  const [infPlatformFilter, setInfPlatformFilter] = useState("all");
  const [infNicheFilter, setInfNicheFilter] = useState("all");
  const [infFollowersFilter, setInfFollowersFilter] = useState("all");
  const [infSortBy, setInfSortBy] = useState("followers");
  const [infContactModal, setInfContactModal] = useState<any | null>(null);
  const [infSaved, setInfSaved] = useState<Set<string>>(new Set());

  // Website Creation State
  const [websiteInput, setWebsiteInput] = useState("");
  const [websiteResult, setWebsiteResult] = useState<string | null>(null);
  const [websiteLoading, setWebsiteLoading] = useState(false);

  // Business Launch State
  const [bizChat, setBizChat] = useState<Message[]>([
    {
      role: "model",
      text: "Assalomu alaykum! 👋 Men sizning moliyaviy maslahatchi AI yordamchingizman. Biznesingizni boshlash yoki rivojlantirish bo'yicha qanday savollaringiz bor? Keling, birga biznes-reja tuzamiz! 🚀\n\nBoshlash uchun, menga qanday biznes boshlashni rejalashtirmoqdasiz — shu haqida gapirib bering.",
    },
  ]);
  const [bizInput, setBizInput] = useState("");
  const [loanAmount, setLoanAmount] = useState(10000000);
  const [loanRate, setLoanRate] = useState(24);
  const [loanTerm, setLoanTerm] = useState(12);
  const [taxRevenue, setTaxRevenue] = useState(50000000);
  const [taxType, setTaxType] = useState("simplified");
  const [bizLoading, setBizLoading] = useState(false);

  const [bizPlanForm, setBizPlanForm] = useState({
    industry: "",
    budget: "",
    equipment: "",
    team: "",
    country: "O'zbekiston",
    region: "",
    district: "",
    type: "online",
  });
  const [showBizPlanForm, setShowBizPlanForm] = useState(false);

  // Advertising Automation State
  const [adsInput, setAdsInput] = useState("");
  const [adsPlatform, setAdsPlatform] = useState<"tg" | "instagram">("tg");
  const [adsResult, setAdsResult] = useState<{
    creative: string;
    hooks: string[];
    ctas: string[];
  } | null>(null);
  const [adsLoading, setAdsLoading] = useState(false);

  // TG Ads Extended State
  const [tgAdsLang, setTgAdsLang] = useState<"uz" | "en" | "ru">("uz");
  const [tgTextVariants, setTgTextVariants] = useState<string[]>([]);
  const [tgImageVariants, setTgImageVariants] = useState<string[]>([]);
  const [tgSelectedText, setTgSelectedText] = useState<number | null>(null);
  const [tgSelectedImage, setTgSelectedImage] = useState<number | null>(null);

  // Meta Ads Extended State
  const [metaImages, setMetaImages] = useState<{ url: string; ratio: string; label: string }[]>([]);
  const [metaTexts, setMetaTexts] = useState<{ headline: string; primary: string; cta: string } | null>(null);

  // Market Analysis State
  const [marketAnalysisInput, setMarketAnalysisInput] = useState("");
  const [marketAnalysisResult, setMarketAnalysisResult] = useState<
    string | null
  >(null);
  const [marketAnalysisLoading, setMarketAnalysisLoading] = useState(false);

  // Dashboard Ad Performance State
  const [adDateRange, setAdDateRange] = useState<"7" | "30" | "90">("30");
  const [adPlatform, setAdPlatform] = useState<"all" | "instagram" | "telegram" | "google">("all");

  // Auth Listener
  useEffect(() => {
    // 1. URL'dan Google OAuth token va user ma'lumotlarini tekshirish
    //    Backend Google callback'dan qaytarganida URL da ?token=...&user=... bo'ladi
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    const userFromUrl = urlParams.get("user");
    const errorFromUrl = urlParams.get("error");

    // Agar URL'da xatolik parametri bo'lsa — konsolga chiqarish
    if (errorFromUrl) {
      console.error("Google OAuth xatosi:", errorFromUrl);
      // URL'ni tozalash (parametrlarni olib tashlash)
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Agar URL'da token va user ma'lumotlari bo'lsa — Google OAuth muvaffaqiyatli
    if (tokenFromUrl && userFromUrl) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userFromUrl));
        // JWT tokenni localStorage'ga saqlash — keyingi so'rovlarda ishlatiladi
        localStorage.setItem("auth-token", tokenFromUrl);
        // Foydalanuvchi ma'lumotlarini saqlash
        localStorage.setItem("auth-user", JSON.stringify(parsedUser));

        // FirebaseUser formatiga moslashtirish (mavjud kod bilan ishlashi uchun)
        const mockUser = {
          uid: parsedUser.id,
          displayName: parsedUser.name,
          email: parsedUser.email,
          photoURL: parsedUser.photoURL || "",
        } as FirebaseUser;

        setUser(mockUser);
        setIsAuthReady(true);

        // URL'ni tozalash (token va user parametrlarini olib tashlash — xavfsizlik uchun)
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        return; // Boshqa tekshiruvlar kerak emas
      } catch (e) {
        console.error("URL'dan user ma'lumotlarini parse qilishda xatolik:", e);
      }
    }

    // 2. localStorage'dan saqlangan auth-user ni tekshirish (sahifa yangilanganda)
    const savedAuthUser = localStorage.getItem("auth-user");
    const savedToken = localStorage.getItem("auth-token");
    if (savedAuthUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedAuthUser);
        const mockUser = {
          uid: parsedUser.id,
          displayName: parsedUser.name,
          email: parsedUser.email,
          photoURL: parsedUser.photoURL || "",
        } as FirebaseUser;
        setUser(mockUser);
        setIsAuthReady(true);
        return;
      } catch (e) {
        // Noto'g'ri ma'lumot bo'lsa — tozalash
        localStorage.removeItem("auth-user");
        localStorage.removeItem("auth-token");
      }
    }

    // 3. Demo user ni localStorage dan tekshirish
    const savedDemo = localStorage.getItem("demo-user");
    if (savedDemo) {
      const mockUser = JSON.parse(savedDemo) as FirebaseUser;
      setUser(mockUser);
      setIsAuthReady(true);
    }

    // 4. Firebase Auth listener (eski usul — saqlab qolindi orqaga moslik uchun)
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Sync user to Firestore
        const userRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            name: u.displayName || "Noma'lum",
            email: u.email || "",
            createdAt: serverTimestamp(),
          });
        }
        localStorage.removeItem("demo-user");
      }
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthReady || !user) return;

    if (user.uid === "demo-user-123") {
      // Set mock data for demo
      setLeads([
        {
          id: "1",
          name: "Aziz Rahimov",
          phone: "+998 90 123 45 67",
          status: "hot",
          source: "Instagram",
          createdAt: Timestamp.now(),
        },
        {
          id: "2",
          name: "Malika Karimova",
          phone: "+998 93 765 43 21",
          status: "warm",
          source: "Telegram",
          createdAt: Timestamp.now(),
        },
        {
          id: "3",
          name: "Jasur Olimov",
          phone: "+998 99 111 22 33",
          status: "appointment",
          source: "Facebook",
          createdAt: Timestamp.now(),
        },
        {
          id: "4",
          name: "Dilnoza Ergasheva",
          phone: "+998 97 444 55 66",
          status: "cold",
          source: "Website",
          createdAt: Timestamp.now(),
        },
      ]);
      setInfluencers([
        {
          id: "1",
          name: "Munisa Rizayeva",
          followers: "5M",
          promoCode: "MUNISA10",
          conversions: 120,
          revenue: 15000000,
        },
        {
          id: "2",
          name: "Shahzoda",
          followers: "4.5M",
          promoCode: "SHAHZODA15",
          conversions: 85,
          revenue: 9000000,
        },
      ]);
      setContentPlans([
        {
          id: "1",
          title: "AI Reja: Restoran marketingi",
          rawText: "Milliy taomlar restorani uchun marketing",
          generatedPlan: "1. Dushanba: Milliy taomlar tarixi haqida post...",
          scheduledPosts: [
            {
              day: "Dushanba",
              date: "2026-04-02",
              time: "10:00",
              title: "Milliy taomlar tarixi",
              type: "rasm",
              content: "🍽 Milliy taomlar tarixi haqida qiziqarli post...",
              hashtags: ["#MilliyTaom", "#Restoran"],
              status: "sent",
              sentAt: "2026-04-02T10:00:00",
            },
          ],
          telegramChannelId: "@restoran_kanal",
          status: "completed",
          createdAt: Timestamp.now(),
        },
        {
          id: "2",
          title: "AI Reja: Oquv markazi",
          rawText: "Ingliz tili kursi uchun",
          generatedPlan: "1. Seshanba: Bepul darsga taklif...",
          scheduledPosts: [
            {
              day: "Seshanba",
              date: "2026-04-03",
              time: "09:00",
              title: "Bepul darsga taklif",
              type: "matn",
              content: "📚 Bepul ingliz tili darsiga taklif qilamiz!",
              hashtags: ["#InglizTili", "#OquvMarkazi"],
              status: "pending",
            },
          ],
          status: "pending",
          createdAt: Timestamp.now(),
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Leads Listener
    const leadsQuery = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const unsubscribeLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const leadsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Lead,
        );
        setLeads(leadsData);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "leads");
      },
    );

    // Influencers Listener
    const unsubscribeInfluencers = onSnapshot(
      collection(db, "influencers"),
      (snapshot) => {
        const influencersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInfluencers(influencersData);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "influencers");
      },
    );

    // Content Plans — Backend API dan olish (MongoDB)
    const loadContentPlans = async () => {
      if (user?.uid === "demo-user-123") return;
      try {
        const res = await fetch(CONTENT_API, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data.status && data.data) {
          setContentPlans(
            data.data.map((p: any) => ({
              ...p,
              id: p._id || p.id,
              createdAt: p.createdAt
                ? { toDate: () => new Date(p.createdAt) }
                : Timestamp.now(),
            })),
          );
        }
      } catch (error) {
        console.error("Content plans olishda xatolik:", error);
      }
    };
    loadContentPlans();

    return () => {
      unsubscribeLeads();
      unsubscribeInfluencers();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    /**
     * Google orqali kirish — Backend'ga yo'naltirish
     *
     * Foydalanuvchi "Google orqali kirish" tugmasini bosganda:
     * 1. Brauzer backend'ning /api/auth/google manzilga o'tadi
     * 2. Backend (Passport.js) Google login sahifasiga redirect qiladi
     * 3. Foydalanuvchi Google'da tizimga kiradi
     * 4. Google backend'ning /api/auth/google/callback ga qaytaradi
     * 5. Backend JWT token yaratib, frontend URL ga redirect qiladi:
     *    https://business-copilot.masatov.uz?token=...&user=...
     * 6. Frontend useEffect da URL'dan token va user ni oladi va saqlaydi
     */
    const BACKEND_AUTH_URL =
      "https://apibusinesscopilot.masatov.uz/api/auth/google";
    window.location.href = BACKEND_AUTH_URL;
  };

  const handleDemoLogin = () => {
    const mockUser = {
      uid: "demo-user-123",
      displayName: "Demo Foydalanuvchi",
      email: "demo@uzmarketing.ai",
      photoURL: "https://picsum.photos/seed/demo/200/200",
    } as FirebaseUser;
    setUser(mockUser);
    setIsAuthReady(true);
    localStorage.setItem("demo-user", JSON.stringify(mockUser));
  };

  const handleSaveAutomation = () => {
    setSaveStatus("Saqlanmoqda...");
    setTimeout(() => {
      setSaveStatus("Muvaffaqiyatli saqlandi!");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };
  const handleLogout = async () => {
    // Demo user uchun
    if (user?.uid === "demo-user-123") {
      setUser(null);
      localStorage.removeItem("demo-user");
      return;
    }

    // Google OAuth orqali kirgan foydalanuvchi uchun — tokenlarni tozalash
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    setUser(null);

    // Firebase orqali ham chiqish (agar Firebase bilan kirgan bo'lsa)
    try {
      await signOut(auth);
    } catch (error) {
      // Firebase'dan chiqishda xatolik bo'lsa ham davom etamiz
      console.error("Logout xatosi:", error);
    }
  };

  const handleGeneratePlan = async () => {
    if (!contentInput.trim() || !user) return;
    setLoading(true);
    try {
      if (user.uid === "demo-user-123") {
        const planText = await aiApi.generateContent(contentInput);
        let posts: ScheduledPost[] = [];
        try {
          const parsed = JSON.parse(planText);
          posts = (parsed.posts || []).map((p: any) => ({
            day: p.day || "",
            date: p.date || "",
            time: p.time || "10:00",
            title: p.title || "",
            type: p.type || "matn",
            content: p.content || "",
            hashtags: p.hashtags || [],
            status: "pending" as const,
          }));
        } catch {}
        const newPlan: ContentPlan = {
          id: Math.random().toString(36).substr(2, 9),
          title: "AI Reja: " + contentInput.substring(0, 20),
          rawText: contentInput,
          generatedPlan: planText,
          scheduledPosts: posts,
          status: "pending",
          createdAt: Timestamp.now(),
        };
        setContentPlans((prev) => [newPlan, ...prev]);
        setContentInput("");
        setLoading(false);
        return;
      }

      // Backend API orqali yaratish (MongoDB ga saqlanadi)
      const res = await fetch(`${CONTENT_API}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: contentInput }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);

      // MongoDB dan yangilab olish
      await fetchContentPlans();
      setContentInput("");
    } catch (error) {
      console.error("AI xatosi:", error);
      alert("Xatolik: " + (error instanceof Error ? error.message : error));
    } finally {
      setLoading(false);
    }
  };

  const fetchContentPlans = async () => {
    try {
      const res = await fetch(CONTENT_API, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.status && data.data) {
        setContentPlans(
          data.data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            createdAt: p.createdAt
              ? { toDate: () => new Date(p.createdAt) }
              : Timestamp.now(),
          })),
        );
      }
    } catch (error) {
      console.error("Content plans olishda xatolik:", error);
    }
  };

  const handleUpdatePostSchedule = (
    planId: string,
    postIdx: number,
    field: "date" | "time",
    value: string,
  ) => {
    setContentPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              scheduledPosts: plan.scheduledPosts.map((post, idx) =>
                idx === postIdx ? { ...post, [field]: value } : post,
              ),
            }
          : plan,
      ),
    );
  };

  const handleApprovePlan = async (planId: string) => {
    if (!telegramChannelId.trim()) {
      alert(
        "Telegram kanal ID ni kiriting! (masalan: @kanal_nomi yoki -100xxx)",
      );
      return;
    }
    try {
      setApprovingPlanId(planId);
      const plan = contentPlans.find((p) => p.id === planId);
      if (!plan) return;

      if (user?.uid === "demo-user-123") {
        setContentPlans((prev) =>
          prev.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  status: "approved" as const,
                  telegramChannelId,
                  scheduledPosts: p.scheduledPosts.map((post) => ({
                    ...post,
                    status: "scheduled" as const,
                  })),
                }
              : p,
          ),
        );
        setTelegramChannelId("");
        setApprovingPlanId(null);
        return;
      }

      // Backend API orqali tasdiqlash
      const res = await fetch(`${CONTENT_API}/${planId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramChannelId,
          scheduledPosts: plan.scheduledPosts,
        }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);

      await fetchContentPlans();
      setTelegramChannelId("");
    } catch (error) {
      console.error("Tasdiqlash xatosi:", error);
      alert("Xatolik: " + (error instanceof Error ? error.message : error));
    } finally {
      setApprovingPlanId(null);
    }
  };

  const handleBizChat = async (directInput?: string) => {
    const input = directInput || bizInput;
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", text: input };
    setBizChat((prev) => [...prev, userMsg]);
    if (!directInput) setBizInput("");
    setBizLoading(true);

    const systemPrompt = `
# SYSTEM PROMPT — BUSINESS COPILOT: Biznes Boshlash (AI Moliyaviy Maslahatchi)

Sen — O'zbek tilidagi professional AI moliyaviy maslahatchi. Sening vazifang foydalanuvchilarga biznes boshlash va rivojlantirish bo'yicha batafsil biznes-reja tuzishda yordam berishdir. Har doim o'zbek tilida javob ber.

## SENING ROLI:
Sen foydalanuvchi bilan suhbat orqali zarur ma'lumotlarni bosqichma-bosqich yig'asan va oxirida to'liq biznes-reja tuzib berasan.

## MA'LUMOT YIG'ISH TARTIBI:
Foydalanuvchidan quyidagi ma'lumotlarni **bosqichma-bosqich** so'ra. Barchasini birdaniga so'rama, har bir bosqichda 1-2 ta savol ber:

### 1-bosqich: Biznes g'oyasi
- "Qanday biznes boshlashni rejalashtirmoqdasiz? Biznes g'oyangiz haqida qisqacha gapirib bering."

### 2-bosqich: Biznes turi
- Foydalanuvchiga 3 ta variantdan birini tanlashni taklif qil:
  - **An'anaviy** (oflayn do'kon, ishlab chiqarish, xizmat ko'rsatish)
  - **Online** (internet-do'kon, raqamli mahsulotlar, SaaS, ijtimoiy tarmoq orqali savdo)
  - **Gibrid (Oflayn + Onlayn)** (ikkalasi aralash)

### 3-bosqich: Soha (Industriya)
- "Biznesingiz qaysi sohaga tegishli?" — quyidagilardan birini tanlash yoki o'zi yozish:
  - Oziq-ovqat va restoran, IT va texnologiya, Ta'lim, Qishloq xo'jaligi, Savdo, Xizmat ko'rsatish, Ishlab chiqarish, Sog'liqni saqlash, Qurilish, Transport va logistika.

### 4-bosqich: Hudud
- Mamlakat, Viloyat, Tuman/Shahar.

### 5-bosqich: Resurslar
- Pul (Boshlang'ich kapital), Jihozlar, Jamoa.

### 6-bosqich: Qo'shimcha ma'lumot
- Kredit, Raqobatchilar, Maqsadli mijoz.

## MUHIM QOIDALAR:
1. Har doim O'ZBEK TILIDA javob ber.
2. Samimiy va professional ohangda gapir.
3. Raqamlarni formatlashda vergul ishlat (masalan: 10,000,000 so'm).
4. Har bir javobda foydalanuvchini keyingi bosqichga yo'naltir.
5. Barcha ma'lumotlar yig'ilgach, to'liq strukturaviy BIZNES-REJA tuzib ber.
`;

    try {
      const text = await aiApi.bizChat(input, bizChat);
      setBizChat((prev) => [...prev, { role: "model", text }]);
    } catch (error) {
      console.error("Biz chat error:", error);
      setBizChat((prev) => [
        ...prev,
        {
          role: "model",
          text: "Kechirasiz, xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
        },
      ]);
    } finally {
      setBizLoading(false);
    }
  };

  const handleGenerateWebsite = async () => {
    if (!websiteInput.trim()) return;
    setWebsiteLoading(true);
    try {
      const result = await aiApi.generateWebsite(websiteInput);
      setWebsiteResult(result);
    } catch (error) {
      console.error("Website AI error:", error);
      setWebsiteResult("AI bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setWebsiteLoading(false);
    }
  };

  const calculateLoan = () => {
    const monthlyRate = loanRate / 100 / 12;
    const payment =
      (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
    return isFinite(payment) ? Math.round(payment) : 0;
  };

  const calculateTax = () => {
    if (taxType === "simplified") return Math.round(taxRevenue * 0.04);
    if (taxType === "fixed") return 1200000;
    return Math.round(taxRevenue * 0.12);
  };

  const handleGenerateBizPlan = async () => {
    setBizLoading(true);
    setShowBizPlanForm(false);

    const prompt = `
      Professional biznes-reja tuzib bering.
      Soha: ${bizPlanForm.industry}
      Biznes turi: ${bizPlanForm.type}
      Hudud: ${bizPlanForm.country}, ${bizPlanForm.region}, ${bizPlanForm.district}
      Resurslar:
      - Mablag': ${bizPlanForm.budget}
      - Jihozlar: ${bizPlanForm.equipment}
      - Jamoa: ${bizPlanForm.team}
      
      Iltimos, ushbu ma'lumotlar asosida O'zbekiston bozori uchun mukammal biznes-reja, SWOT tahlil va moliyaviy prognoz tayyorlang.
    `;

    const userMsg: Message = {
      role: "user",
      text: "Menga batafsil biznes-reja yaratib bering.",
    };
    setBizChat((prev) => [...prev, userMsg]);

    try {
      const text = await aiApi.generateBizPlan(bizPlanForm);
      setBizChat((prev) => [...prev, { role: "model", text }]);
    } catch (error) {
      console.error("Biz plan error:", error);
      setBizChat((prev) => [
        ...prev,
        { role: "model", text: "Xatolik yuz berdi." },
      ]);
    } finally {
      setBizLoading(false);
    }
  };

  const handleGenerateAds = async () => {
    if (!adsInput.trim()) return;
    setAdsLoading(true);
    // Reset previous results
    setTgTextVariants([]);
    setTgImageVariants([]);
    setTgSelectedText(null);
    setTgSelectedImage(null);
    setMetaImages([]);
    setMetaTexts(null);

    try {
      const result = await aiApi.generateAds(
        adsInput,
        adsPlatform,
        adsPlatform === "tg" ? tgAdsLang : undefined,
      );
      // Set legacy result for backward compat
      setAdsResult(result);

      if (adsPlatform === "tg") {
        /**
         * TG Ads: Backend should return { creative, hooks, ctas, textVariants?, imageVariants? }
         * If backend doesn't return multi-variant data yet, generate mock variants
         * from the existing creative/hooks response for UI demo.
         */
        const langLabel = tgAdsLang === "uz" ? "O'zbek" : tgAdsLang === "en" ? "English" : "Русский";
        const textVars: string[] = result.textVariants || [
          result.creative?.substring(0, 160) || `${langLabel}: ${adsInput.substring(0, 120)}... 🔥`,
          ...(result.hooks || []).slice(0, 4).map((h: string) => h.substring(0, 160)),
        ];
        // Ensure exactly 5
        while (textVars.length < 5) textVars.push(`${langLabel} variant ${textVars.length + 1}: ${adsInput.substring(0, 100)}`);
        setTgTextVariants(textVars.slice(0, 5).map((t: string) => t.substring(0, 160)));

        const imgVars: string[] = result.imageVariants || [
          `https://placehold.co/800x450/f97316/white?text=TG+Ad+1`,
          `https://placehold.co/800x450/1e293b/white?text=TG+Ad+2`,
          `https://placehold.co/800x450/3b82f6/white?text=TG+Ad+3`,
        ];
        setTgImageVariants(imgVars.slice(0, 3));
      } else {
        /**
         * Meta Ads: Backend should return { creative, hooks, ctas, metaImages?, metaTexts? }
         * Mock multi-format data if not present.
         */
        setMetaImages(result.metaImages || [
          { url: "https://placehold.co/600x600/f97316/white?text=1:1+Square", ratio: "1:1", label: "Kvadrat (1:1)" },
          { url: "https://placehold.co/800x450/1e293b/white?text=16:9+Landscape", ratio: "16:9", label: "Landshaft (16:9)" },
          { url: "https://placehold.co/450x800/8b5cf6/white?text=9:16+Story", ratio: "9:16", label: "Story (9:16)" },
        ]);
        setMetaTexts(result.metaTexts || {
          headline: result.hooks?.[0] || "Sarlavha matni",
          primary: result.creative || "Asosiy reklama matni",
          cta: result.ctas?.[0] || "Batafsil ma'lumot",
        });
      }
    } catch (error) {
      console.error("Ads AI error:", error);
    } finally {
      setAdsLoading(false);
    }
  };

  const handleMarketAnalysis = async () => {
    if (!marketAnalysisInput.trim()) return;
    setMarketAnalysisLoading(true);
    try {
      const text = await aiApi.marketAnalysis(marketAnalysisInput);
      setMarketAnalysisResult(text || "Tahlil natijasi topilmadi.");
    } catch (error) {
      console.error("Market Analysis AI error:", error);
      setMarketAnalysisResult("Bozor tahlilida xatolik yuz berdi.");
    } finally {
      setMarketAnalysisLoading(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Clock className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl text-center space-y-8 border border-slate-100">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform rotate-12">
            <TrendingUp className="text-white" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              BUSINESS COPILOT
            </h1>
            <p className="text-slate-500 font-medium">
              Marketingni avtomatlashtirish platformasiga xush kelibsiz
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200 active:scale-95"
            >
              <LogIn size={20} />
              Google orqali kirish
            </button>
            <button
              onClick={handleDemoLogin}
              className="w-full py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Users size={20} />
              Demo rejimida ko'rish
            </button>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
            Xavfsiz va tezkor kirish
          </p>
        </div>
      </div>
    );
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Boshqaruv Paneli";
      case "content":
        return "Kontent Markazi";
      case "website":
        return "Sayt Yaratish (AI)";
      case "crm":
        return "Lidlar Boshqaruvi";
      case "influencers":
        return "Influencerlar va Promokodlar";
      case "analytics":
        return "Kengaytirilgan Analitika";
      case "business":
        return "Biznes Boshlash (AI Maslahatchi)";
      case "ads":
        return "Reklama Avtomatizatsiyasi (AI)";
      case "automation":
        return "Avtomatizatsiya Sozlamalari";
      default:
        return "Platforma";
    }
  };

  return (
    <div className="app-container flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            {getHeaderTitle()}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">
                {user.displayName}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Chiqish"
            >
              <LogOut size={20} />
            </button>
            <img
              src={user.photoURL || ""}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnalyticsCard
                    title="Jami Lidlar"
                    value={leads.length}
                    change="+12.5%"
                    icon={Users}
                  />
                  <AnalyticsCard
                    title="Konversiyalar"
                    value={Math.round(leads.length * 0.2)}
                    change="+5.2%"
                    icon={CheckCircle}
                  />
                  <AnalyticsCard
                    title="Haftalik Daromad"
                    value="12,450,000 so'm"
                    change="+18.7%"
                    icon={DollarSign}
                  />
                  <AnalyticsCard
                    title="AI Xabarlar"
                    value="1,240"
                    change="+24.1%"
                    icon={MessageSquare}
                  />
                </div>

                {/* Reklama natijalari */}
                {(() => {
                  // --- Ad performance data (mock, filterable) ---
                  const adDataByRange: Record<string, { budget: number; impressions: number; leads: number; conversion: number; ctr: number; cpm: number; cps: number; chart: { name: string; impressions: number; leads: number }[] }> = {
                    "7": { budget: 450000, impressions: 18200, leads: 12, conversion: 2.8, ctr: 3.1, cpm: 24700, cps: 37500, chart: [
                      { name: "Dush", impressions: 2400, leads: 1 },
                      { name: "Sesh", impressions: 2800, leads: 2 },
                      { name: "Chor", impressions: 3100, leads: 2 },
                      { name: "Pay", impressions: 2600, leads: 1 },
                      { name: "Jum", impressions: 2900, leads: 3 },
                      { name: "Shan", impressions: 2200, leads: 2 },
                      { name: "Yak", impressions: 2200, leads: 1 },
                    ]},
                    "30": { budget: 1500000, impressions: 68400, leads: 42, conversion: 3.2, ctr: 2.5, cpm: 21900, cps: 35700, chart: [
                      { name: "1-hafta", impressions: 15200, leads: 8 },
                      { name: "2-hafta", impressions: 17800, leads: 11 },
                      { name: "3-hafta", impressions: 18600, leads: 12 },
                      { name: "4-hafta", impressions: 16800, leads: 11 },
                    ]},
                    "90": { budget: 4200000, impressions: 210000, leads: 135, conversion: 3.5, ctr: 2.8, cpm: 20000, cps: 31100, chart: [
                      { name: "Yanvar", impressions: 58000, leads: 35 },
                      { name: "Fevral", impressions: 72000, leads: 48 },
                      { name: "Mart", impressions: 80000, leads: 52 },
                    ]},
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
                    chart: base.chart.map(d => ({
                      name: d.name,
                      impressions: Math.round(d.impressions * mult),
                      leads: Math.max(1, Math.round(d.leads * mult)),
                    })),
                  };

                  // Insights
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
                      {/* Header + Filters */}
                      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">Reklama natijalari</h3>
                          <p className="text-sm text-slate-400 mt-0.5">So'nggi kampaniyalar bo'yicha asosiy ko'rsatkichlar</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(["7", "30", "90"] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => setAdDateRange(v)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                                adDateRange === v
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                              )}
                            >
                              {v === "7" ? "7 kun" : v === "30" ? "30 kun" : "90 kun"}
                            </button>
                          ))}
                          <select
                            value={adPlatform}
                            onChange={(e) => setAdPlatform(e.target.value as any)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="all">Barcha platformalar</option>
                            <option value="instagram">Instagram</option>
                            <option value="telegram">Telegram</option>
                            <option value="google">Google</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Grouped Metric Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Xarajat Group */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <DollarSign size={12} /> Xarajat
                            </p>
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

                          {/* Trafik Group */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Eye size={12} /> Trafik
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ko'rishlar</p>
                                <p className="text-xl font-bold text-slate-900 tabular-nums">{formatCompact(ad.impressions)}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{formatNumber(ad.impressions)}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CTR</p>
                                <p className={cn("text-xl font-bold tabular-nums", ad.ctr >= 3 ? "text-green-600" : ad.ctr < 2 ? "text-red-500" : "text-slate-900")}>
                                  {ad.ctr}%
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">bosish darajasi</p>
                              </div>
                            </div>
                          </div>

                          {/* Natija Group */}
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Target size={12} /> Natija
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Murojaatlar</p>
                                <p className="text-xl font-bold text-slate-900 tabular-nums">{ad.leads}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Konversiya</p>
                                <p className={cn("text-xl font-bold tabular-nums", ad.conversion >= 3 ? "text-green-600" : ad.conversion < 2 ? "text-red-500" : "text-slate-900")}>
                                  {ad.conversion}%
                                </p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CPS</p>
                                <p className="text-xl font-bold text-slate-900 tabular-nums">{formatCompact(ad.cps)}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">so'm/lid</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chart + Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Chart */}
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
                                <Tooltip
                                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                                  formatter={(value: number, name: string) => [formatNumber(value), name === "impressions" ? "Ko'rishlar" : "Murojaatlar"]}
                                />
                                <Area type="monotone" dataKey="impressions" stroke="#f97316" strokeWidth={2} fill="url(#gradImpr)" />
                                <Area type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} fill="url(#gradLeads)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Insights */}
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                              <Sparkles size={14} className="text-orange-400" /> Tezkor tavsiyalar
                            </p>
                            <div className="space-y-2">
                              {insights.map((ins, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "p-3 rounded-xl border text-sm",
                                    ins.type === "good" && "bg-green-50 border-green-100 text-green-700",
                                    ins.type === "warn" && "bg-orange-50 border-orange-100 text-orange-700",
                                    ins.type === "bad" && "bg-red-50 border-red-100 text-red-600",
                                  )}
                                >
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
                    <h3 className="font-bold text-slate-800">
                      Oxirgi Lidlar
                    </h3>
                    <button
                      onClick={() => setActiveTab("crm")}
                      className="text-sm text-orange-500 font-semibold hover:underline"
                    >
                      Hammasini ko'rish
                    </button>
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
                            <td
                              colSpan={5}
                              className="py-12 text-center text-slate-400 italic"
                            >
                              Hozircha lidlar mavjud emas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "crm" && (
              <motion.div
                key="crm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="relative flex-1 w-full">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Lidlarni qidirish (ism, telefon)..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Barcha statuslar</option>
                      <option value="hot">Issiq</option>
                      <option value="warm">Iliq</option>
                      <option value="cold">Sovuq</option>
                      <option value="appointment">Uchrashuv</option>
                    </select>
                    <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                      <Filter size={18} />
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                      onClick={() => setShowAddLeadModal(true)}
                    >
                      <Plus size={18} />
                      Yangi Lid
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        Mijozlar Bazasi (CRM)
                      </h3>
                      <p className="text-sm text-slate-500">
                        Jami: {leads.length} ta lid
                      </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                      <Download size={16} />
                      Eksport (Excel)
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                        <tr>
                          <th className="py-4 px-6">Mijoz</th>
                          <th className="py-4 px-6">Aloqa</th>
                          <th className="py-4 px-6">Manba</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads
                          .filter(
                            (l) =>
                              (statusFilter === "all" ||
                                l.status === statusFilter) &&
                              (l.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                                l.phone.includes(searchTerm)),
                          )
                          .map((lead) => (
                            <tr
                              key={lead.id}
                              className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                    {lead.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      {lead.name || "Noma'lum"}
                                    </div>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                                      ID: #LID-{lead.id.substring(0, 8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                                {lead.phone}
                              </td>
                              <td className="py-4 px-6 text-sm text-slate-500">
                                <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">
                                  {lead.source}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                    lead.status === "hot"
                                      ? "bg-orange-100 text-orange-600"
                                      : lead.status === "appointment"
                                        ? "bg-green-100 text-green-600"
                                        : lead.status === "warm"
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-slate-100 text-slate-600",
                                  )}
                                >
                                  {lead.status === "hot"
                                    ? "Issiq"
                                    : lead.status === "warm"
                                      ? "Iliq"
                                      : lead.status === "appointment"
                                        ? "Uchrashuv"
                                        : "Sovuq"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Suhbat"
                                  >
                                    <MessageSquare size={16} />
                                  </button>
                                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                    <MoreVertical size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {leads.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-12 text-center text-slate-400 italic"
                            >
                              Hozircha lidlar mavjud emas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "influencers" && (() => {
              // --- Mock Influencer Marketplace Data ---
              const MOCK_INFLUENCERS = [
                { id: "m1", name: "Munisa Rizayeva", username: "@munisa_rizayeva", avatar: "https://i.pravatar.cc/300?img=1", platform: ["instagram", "telegram", "youtube"], followers: 5200000, engagement: 4.8, price_per_post: 3500000, niche: "lifestyle", location: "Toshkent", contact: { telegram: "@munisa_agent", phone: "+998 90 123 45 67" }, verified: true, top: true, promoCode: "MUNISA10", conversions: 120, revenue: 15000000 },
                { id: "m2", name: "Shahzoda", username: "@shahzoda_official", avatar: "https://i.pravatar.cc/300?img=5", platform: ["instagram", "youtube", "tiktok"], followers: 4500000, engagement: 5.2, price_per_post: 4000000, niche: "lifestyle", location: "Toshkent", contact: { telegram: "@shahzoda_pr", agent: "Creative Agency UZ" }, verified: true, top: true, promoCode: "SHAHZODA15", conversions: 85, revenue: 9000000 },
                { id: "m3", name: "Dilshod Mirzamuratov", username: "@dilshod_tech", avatar: "https://i.pravatar.cc/300?img=12", platform: ["youtube", "telegram"], followers: 890000, engagement: 6.1, price_per_post: 1500000, niche: "tech", location: "Toshkent", contact: { telegram: "@dilshod_dm" }, verified: true, top: false, promoCode: "", conversions: 45, revenue: 3200000 },
                { id: "m4", name: "Nodira Karimova", username: "@nodira_food", avatar: "https://i.pravatar.cc/300?img=9", platform: ["instagram", "tiktok"], followers: 320000, engagement: 7.3, price_per_post: 800000, niche: "food", location: "Samarqand", contact: { phone: "+998 93 456 78 90" }, verified: false, top: false, promoCode: "", conversions: 30, revenue: 1500000 },
                { id: "m5", name: "Akbar Rakhimov", username: "@akbar_business", avatar: "https://i.pravatar.cc/300?img=15", platform: ["telegram", "youtube"], followers: 1100000, engagement: 3.9, price_per_post: 2000000, niche: "business", location: "Toshkent", contact: { telegram: "@akbar_biz", agent: "BizReach Agency" }, verified: true, top: false, promoCode: "", conversions: 60, revenue: 5500000 },
                { id: "m6", name: "Zulfiya Hamidova", username: "@zulfiya_edu", avatar: "https://i.pravatar.cc/300?img=25", platform: ["youtube", "telegram", "instagram"], followers: 750000, engagement: 5.8, price_per_post: 1200000, niche: "education", location: "Buxoro", contact: { telegram: "@zulfiya_contact", phone: "+998 97 111 22 33" }, verified: false, top: false, promoCode: "", conversions: 22, revenue: 1800000 },
              ];

              // Merge real DB influencers with mock data
              const dbInfluencers = influencers.map((inf: any) => ({
                id: inf.id,
                name: inf.name,
                username: `@${inf.name.toLowerCase().replace(/\s+/g, '_')}`,
                avatar: `https://i.pravatar.cc/300?u=${inf.id}`,
                platform: ["instagram", "telegram"] as string[],
                followers: typeof inf.followers === 'string' ? parseFloat(inf.followers.replace(/[^0-9.]/g, '')) * (inf.followers.includes('M') ? 1000000 : inf.followers.includes('K') ? 1000 : 1) : (inf.followers || 0),
                engagement: 4.5,
                price_per_post: 1500000,
                niche: "lifestyle",
                location: "Toshkent",
                contact: { telegram: `@${inf.name.toLowerCase().replace(/\s+/g, '_')}` },
                verified: false,
                top: false,
                promoCode: inf.promoCode || "",
                conversions: inf.conversions || 0,
                revenue: inf.revenue || 0,
              }));

              const allInfluencers = [
                ...MOCK_INFLUENCERS,
                ...dbInfluencers.filter((d: any) => !MOCK_INFLUENCERS.find(m => m.name === d.name)),
              ];

              // Filter logic
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
                if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
                if (n >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K';
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
              <motion.div
                key="influencers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* ── HEADER ── */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Influencer Marketplace</h3>
                    <p className="text-sm text-slate-500">O'zbekistonning eng yaxshi influencerlari bilan hamkorlik qiling</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <Users size={14} /> {allInfluencers.length} ta influencer
                    </span>
                    <button
                      onClick={() => setShowAddInfluencerModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-200 transition-colors hover:bg-orange-600 active:scale-95"
                    >
                      <Plus size={16} /> Yangi Hamkor
                    </button>
                  </div>
                </div>

                {/* ── FILTER BAR ── */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Ism, niche yoki username bo'yicha qidiring..."
                        value={infSearchTerm}
                        onChange={(e) => setInfSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                      />
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
                      {infSearchTerm && (
                        <button onClick={() => setInfSearchTerm("")} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                          "{infSearchTerm}" <X size={12} />
                        </button>
                      )}
                      {infPlatformFilter !== "all" && (
                        <button onClick={() => setInfPlatformFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100">
                          {infPlatformFilter} <X size={12} />
                        </button>
                      )}
                      {infNicheFilter !== "all" && (
                        <button onClick={() => setInfNicheFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100">
                          {nicheLabel[infNicheFilter] || infNicheFilter} <X size={12} />
                        </button>
                      )}
                      {infFollowersFilter !== "all" && (
                        <button onClick={() => setInfFollowersFilter("all")} className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-100">
                          {infFollowersFilter.toUpperCase()}+ <X size={12} />
                        </button>
                      )}
                      <button onClick={() => { setInfSearchTerm(""); setInfPlatformFilter("all"); setInfNicheFilter("all"); setInfFollowersFilter("all"); }} className="text-xs font-semibold text-red-500 hover:underline">
                        Tozalash
                      </button>
                    </div>
                  )}
                </div>

                {/* ── INFLUENCER GRID ── */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((inf) => (
                    <div
                      key={inf.id}
                      className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Top badge */}
                      {inf.top && (
                        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          <Star size={10} fill="currentColor" /> TOP
                        </div>
                      )}

                      {/* Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={inf.avatar}
                              alt={inf.name}
                              className="h-14 w-14 rounded-xl border border-slate-100 object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {inf.verified && (
                              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white">
                                <BadgeCheck size={12} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-slate-900">{inf.name}</h4>
                            <p className="text-xs text-slate-400">{inf.username}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {inf.platform.map((p: string) => (
                                <span key={p} className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold", platformColor(p))}>
                                  {platformIcon(p)} {p.charAt(0).toUpperCase() + p.slice(1)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
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

                      {/* Body */}
                      <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", nicheColor[inf.niche] || "bg-slate-50 text-slate-600")}>
                            {nicheLabel[inf.niche] || inf.niche}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                            <MapPin size={10} /> {inf.location}
                          </span>
                          {inf.promoCode && (
                            <span className="rounded-full bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-orange-600">
                              {inf.promoCode}
                            </span>
                          )}
                        </div>

                        {inf.revenue > 0 && (
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                            <span className="text-slate-500">
                              <CheckCircle size={12} className="mr-1 inline text-green-500" />{inf.conversions} konversiya
                            </span>
                            <span className="font-bold text-green-600">{(inf.revenue / 1000000).toFixed(1)}M so'm</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto flex items-center gap-2 pt-2">
                          <button
                            onClick={() => setInfContactModal(inf)}
                            className="flex-1 rounded-xl bg-orange-500 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]"
                          >
                            Bog'lanish
                          </button>
                          <button
                            onClick={() => setInfSaved(prev => { const next = new Set(prev); next.has(inf.id) ? next.delete(inf.id) : next.add(inf.id); return next; })}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                              infSaved.has(inf.id)
                                ? "border-orange-200 bg-orange-50 text-orange-500"
                                : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-orange-500"
                            )}
                            title="Saqlash"
                          >
                            <Bookmark size={16} fill={infSaved.has(inf.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── EMPTY STATE ── */}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-white py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200">
                      <Users size={32} />
                    </div>
                    <p className="text-lg font-bold text-slate-900">Mos influencer topilmadi</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Filtrlarni o'zgartiring yoki qidiruv so'zini tekshiring
                    </p>
                    <button
                      onClick={() => { setInfSearchTerm(""); setInfPlatformFilter("all"); setInfNicheFilter("all"); setInfFollowersFilter("all"); }}
                      className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-95"
                    >
                      <Filter size={16} /> Filtrlarni tozalash
                    </button>
                  </div>
                )}
              </motion.div>
              );
            })()}

            {activeTab === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-10"
              >
                {/* ── HERO / INPUT SECTION ── */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-orange-50/50 p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
                  {/* Decorative blurs */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-orange-400/10 to-amber-300/10 blur-3xl" />
                  <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-violet-400/5 to-blue-300/5 blur-2xl" />

                  <div className="relative space-y-8">
                    {/* Header */}
                    <div className="flex items-start gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10">
                        <Sparkles size={26} />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-black tracking-tight text-slate-900">
                          Yangi Kontent Reja
                        </h3>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          AI yordamida 1 haftalik professional marketing rejasini bir necha soniyada tuzing
                        </p>
                      </div>
                    </div>

                    {/* Input area */}
                    <div className="space-y-4">
                      <div className="relative group">
                        <textarea
                          className="w-full min-h-[160px] resize-none rounded-2xl border border-slate-200 bg-white/80 p-6 pb-10 text-base text-slate-800 placeholder:text-slate-300 outline-none transition-all duration-200 focus:border-orange-400/50 focus:bg-white focus:shadow-[0_0_0_4px_rgba(251,146,60,0.08)] focus:ring-0"
                          placeholder="Masalan: Yangi ochilgan milliy taomlar restorani uchun Instagram va Telegram postlari rejasi. Maqsadli auditoriya — 25-40 yosh, oilaviy odamlar..."
                          value={contentInput}
                          onChange={(e) => setContentInput(e.target.value)}
                          maxLength={500}
                        />
                        <div className="absolute bottom-3 right-4 flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-medium tabular-nums transition-colors",
                            contentInput.length > 450 ? "text-orange-500" : "text-slate-300"
                          )}>
                            {contentInput.length}/500
                          </span>
                        </div>
                      </div>

                      <p className="flex items-center gap-1.5 pl-1 text-xs text-slate-400">
                        <Sparkles size={12} className="text-orange-400" />
                        Soha, maqsadli auditoriya va platformalarni aniq yozing — AI yanada sifatli reja tuzadi
                      </p>

                      <button
                        onClick={handleGeneratePlan}
                        disabled={loading || !contentInput.trim()}
                        className={cn(
                          "group/btn relative w-full overflow-hidden rounded-2xl py-4.5 px-8 text-lg font-black text-white transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
                          "bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20",
                          "hover:shadow-xl hover:shadow-orange-500/25 hover:brightness-105",
                        )}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {loading ? (
                            <Loader2 className="animate-spin" size={22} />
                          ) : (
                            <Sparkles size={22} className="transition-transform duration-200 group-hover/btn:rotate-12" />
                          )}
                          {loading ? "Reja yaratilmoqda..." : "AI Rejani Generatsiya Qilish"}
                        </span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── STATS BAR ── */}
                {contentPlans.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
                      <FileText size={14} />
                      Jami: {contentPlans.length}
                    </span>
                    {contentPlans.filter(p => p.status === "completed").length > 0 && (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600">
                        <CheckCircle size={13} />
                        Tayyor: {contentPlans.filter(p => p.status === "completed").length}
                      </span>
                    )}
                    {contentPlans.filter(p => p.status === "approved").length > 0 && (
                      <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600">
                        <Calendar size={13} />
                        Rejalashtirilgan: {contentPlans.filter(p => p.status === "approved").length}
                      </span>
                    )}
                    {contentPlans.filter(p => p.status === "pending").length > 0 && (
                      <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-500">
                        <Clock size={13} />
                        Kutilmoqda: {contentPlans.filter(p => p.status === "pending").length}
                      </span>
                    )}
                  </div>
                )}

                {/* ── CONTENT PLANS LIST ── */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400">
                      <Calendar size={16} />
                      Mavjud Rejalar
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {contentPlans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-slate-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                      >
                        {/* Status accent bar */}
                        <div
                          className={cn(
                            "absolute left-0 top-0 h-full w-1 transition-all",
                            plan.status === "completed"
                              ? "bg-emerald-500"
                              : plan.status === "approved"
                                ? "bg-blue-500"
                                : plan.status === "rejected"
                                  ? "bg-red-400"
                                  : "bg-orange-400",
                          )}
                        />

                        <div className="p-6 pl-8 md:p-8 md:pl-10">
                          {/* Card header */}
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-3">
                                <h4 className="truncate text-lg font-extrabold text-slate-900">
                                  {plan.title}
                                </h4>
                                <span
                                  className={cn(
                                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                                    plan.status === "completed"
                                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10"
                                      : plan.status === "approved"
                                        ? "bg-blue-50 text-blue-600 ring-1 ring-blue-500/10"
                                        : plan.status === "rejected"
                                          ? "bg-red-50 text-red-500 ring-1 ring-red-500/10"
                                          : "bg-orange-50 text-orange-600 ring-1 ring-orange-500/10",
                                  )}
                                >
                                  <span className="h-1.5 w-1.5 rounded-full" style={{
                                    backgroundColor: plan.status === "completed" ? "#10b981" : plan.status === "approved" ? "#3b82f6" : plan.status === "rejected" ? "#ef4444" : "#f97316"
                                  }} />
                                  {plan.status === "completed"
                                    ? "Tayyor"
                                    : plan.status === "approved"
                                      ? "Rejalashtirilgan"
                                      : plan.status === "rejected"
                                        ? "Rad etilgan"
                                        : "Kutilmoqda"}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-sm text-slate-500">
                                {plan.rawText}
                              </p>

                              {/* Meta row */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                                {plan.scheduledPosts && plan.scheduledPosts.length > 0 && (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                                    <FileText size={13} />
                                    {plan.scheduledPosts.length} ta post
                                  </span>
                                )}
                                {plan.telegramChannelId && (
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                                    <Send size={13} />
                                    {plan.telegramChannelId}
                                  </span>
                                )}
                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                  <Calendar size={13} />
                                  {plan.createdAt?.toDate
                                    ? plan.createdAt.toDate().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })
                                    : "Hozir"}
                                </span>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex shrink-0 items-center gap-1.5 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100">
                              <button
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                title="Tahrirlash"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                title="Nusxa olish"
                              >
                                <Copy size={15} />
                              </button>
                              <button
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                title="O'chirish"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* ── Expand / Posts ── */}
                          {plan.scheduledPosts && plan.scheduledPosts.length > 0 ? (
                            <div className="mt-6 space-y-3">
                              <button
                                onClick={() =>
                                  setExpandedPlanId(
                                    expandedPlanId === plan.id ? null : plan.id,
                                  )
                                }
                                className="flex w-full items-center justify-between rounded-xl bg-slate-50/80 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-slate-100/80"
                              >
                                <span className="flex items-center gap-2.5 text-sm font-bold text-slate-700">
                                  <FileText size={15} className="text-slate-400" />
                                  {plan.scheduledPosts.length} ta post rejasi
                                </span>
                                {expandedPlanId === plan.id ? (
                                  <ChevronUp size={16} className="text-slate-400" />
                                ) : (
                                  <ChevronDown size={16} className="text-slate-400" />
                                )}
                              </button>

                              <AnimatePresence>
                                {expandedPlanId === plan.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="space-y-3 pt-2">
                                      {plan.scheduledPosts.map((post, idx) => (
                                        <div
                                          key={idx}
                                          className={cn(
                                            "rounded-xl border p-5 transition-all duration-150",
                                            post.status === "sent"
                                              ? "border-emerald-200/70 bg-emerald-50/50"
                                              : post.status === "scheduled"
                                                ? "border-blue-200/70 bg-blue-50/50"
                                                : post.status === "failed"
                                                  ? "border-red-200/70 bg-red-50/50"
                                                  : "border-slate-200/70 bg-slate-50/50",
                                          )}
                                        >
                                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="flex items-start gap-3">
                                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                                                {idx + 1}
                                              </div>
                                              <div>
                                                <h5 className="font-bold text-slate-900">
                                                  {post.title}
                                                </h5>
                                                <p className="text-xs text-slate-500">
                                                  {post.day}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                              {plan.status === "pending" ? (
                                                <>
                                                  <input
                                                    type="date"
                                                    value={post.date}
                                                    onChange={(e) =>
                                                      handleUpdatePostSchedule(plan.id, idx, "date", e.target.value)
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                                  />
                                                  <input
                                                    type="time"
                                                    value={post.time}
                                                    onChange={(e) =>
                                                      handleUpdatePostSchedule(plan.id, idx, "time", e.target.value)
                                                    }
                                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                                                  />
                                                </>
                                              ) : (
                                                <>
                                                  <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                    <Calendar size={11} className="text-slate-400" />
                                                    {post.date}
                                                  </span>
                                                  <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                    <Clock size={11} className="text-slate-400" />
                                                    {post.time}
                                                  </span>
                                                </>
                                              )}
                                              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                {post.type}
                                              </span>
                                              <span
                                                className={cn(
                                                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                                                  post.status === "sent"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : post.status === "scheduled"
                                                      ? "bg-blue-100 text-blue-700"
                                                      : post.status === "failed"
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-slate-100 text-slate-600",
                                                )}
                                              >
                                                <span className="h-1.5 w-1.5 rounded-full" style={{
                                                  backgroundColor: post.status === "sent" ? "#10b981" : post.status === "scheduled" ? "#3b82f6" : post.status === "failed" ? "#ef4444" : "#94a3b8"
                                                }} />
                                                {post.status === "sent"
                                                  ? "Yuborildi"
                                                  : post.status === "scheduled"
                                                    ? "Rejalashtirilgan"
                                                    : post.status === "failed"
                                                      ? "Xato"
                                                      : "Kutmoqda"}
                                              </span>
                                            </div>
                                          </div>

                                          <div className="mt-3 rounded-lg border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                            {post.content}
                                          </div>

                                          {post.hashtags && post.hashtags.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                              {post.hashtags.map((tag, i) => (
                                                <span
                                                  key={i}
                                                  className="inline-flex items-center gap-1 rounded-md bg-blue-50/80 px-2 py-0.5 text-xs font-medium text-blue-600"
                                                >
                                                  <Hash size={10} />
                                                  {tag.replace(/^#/, "")}
                                                </span>
                                              ))}
                                            </div>
                                          )}

                                          {post.sentAt && (
                                            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                              <CheckCircle size={12} />
                                              Yuborilgan: {new Date(post.sentAt).toLocaleString("uz-UZ")}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-5 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap transition-all duration-200 group-hover:border-orange-100/60 group-hover:bg-orange-50/20">
                              {plan.generatedPlan}
                            </div>
                          )}

                          {/* ── Approval / Telegram ── */}
                          <div className="mt-6">
                            {plan.status === "pending" && (
                              <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/40 p-5">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                  <input
                                    type="text"
                                    placeholder="Telegram kanal ID (masalan: @kanal_nomi yoki -100xxx)"
                                    value={telegramChannelId}
                                    onChange={(e) => setTelegramChannelId(e.target.value)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-150 placeholder:text-slate-300 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
                                  />
                                  <button
                                    onClick={() => handleApprovePlan(plan.id)}
                                    disabled={approvingPlanId === plan.id}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                                  >
                                    {approvingPlanId === plan.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <Send size={15} />
                                    )}
                                    Tasdiqlash va Rejalashtirish
                                  </button>
                                </div>
                                <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
                                  <Sparkles size={12} className="mt-0.5 shrink-0 text-orange-400" />
                                  Botni kanalga admin qilib qo'shing va kanal ID sini kiriting. Tasdiqlangandan so'ng postlar avtomatik chiqariladi.
                                </p>
                              </div>
                            )}
                            {plan.status === "approved" && (
                              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                                <Calendar size={16} className="mt-0.5 shrink-0 text-blue-500" />
                                <div>
                                  <p className="text-sm font-bold text-blue-700">
                                    Reja tasdiqlangan — postlar belgilangan vaqtda avtomatik yuboriladi
                                  </p>
                                  <p className="mt-1 text-xs text-blue-500">
                                    Yuborilgan: {plan.scheduledPosts.filter((p) => p.status === "sent").length}/{plan.scheduledPosts.length} ta post
                                  </p>
                                </div>
                              </div>
                            )}
                            {plan.status === "completed" && (
                              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                                <p className="text-sm font-bold text-emerald-700">
                                  Barcha postlar muvaffaqiyatli yuborildi!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* ── Empty State ── */}
                    {contentPlans.length === 0 && (
                      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200/80 bg-white/50 py-20 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                          <FileText size={36} strokeWidth={1.5} />
                        </div>
                        <p className="text-lg font-extrabold text-slate-800">
                          Rejalar hali mavjud emas
                        </p>
                        <p className="mt-1.5 max-w-xs text-sm text-slate-400">
                          Marketing rejasini tuzish uchun yuqoridagi formadan foydalaning — AI bir necha soniyada tayyor qiladi
                        </p>
                        <button
                          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
                        >
                          <Plus size={16} />
                          Birinchi rejani yaratish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "website" && (
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
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        AI Sayt Yaratuvchi
                      </h3>
                      <p className="text-sm text-slate-500">
                        Biznesingiz uchun mukammal veb-sayt konseptini yarating
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Sizga qanday sayt kerak?
                      </label>
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
                      {websiteLoading ? (
                        <Clock className="animate-spin" size={24} />
                      ) : (
                        <Zap size={24} />
                      )}
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
                            const blob = new Blob([websiteResult], {
                              type: "text/plain",
                            });
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
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                          <Code size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            Texnologiya
                          </p>
                          <p className="text-sm font-bold text-slate-700">
                            React + Tailwind
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                          <Layout size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            Sahifalar
                          </p>
                          <p className="text-sm font-bold text-slate-700">
                            5-7 ta sahifa
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            SEO
                          </p>
                          <p className="text-sm font-bold text-slate-700">
                            Optimallashgan
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "automation" && (
              <motion.div
                key="automation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                  <div className="border-b border-slate-50 pb-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Avtomatizatsiya Sozlamalari
                    </h3>
                    <p className="text-slate-500">
                      Ijtimoiy tarmoqlar va AI botlarni boshqarish
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                            <MessageSquare size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              Telegram Bot
                            </p>
                            <p className="text-xs text-slate-500">
                              Avtomatik javob berish
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setAutomationSettings((s) => ({
                              ...s,
                              telegramBot: !s.telegramBot,
                            }))
                          }
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            automationSettings.telegramBot
                              ? "bg-orange-500"
                              : "bg-slate-300",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              automationSettings.telegramBot
                                ? "left-7"
                                : "left-1",
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                            <Share2 size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              Auto-Posting
                            </p>
                            <p className="text-xs text-slate-500">
                              Rejali postlar
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setAutomationSettings((s) => ({
                              ...s,
                              autoPosting: !s.autoPosting,
                            }))
                          }
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            automationSettings.autoPosting
                              ? "bg-orange-500"
                              : "bg-slate-300",
                          )}
                        >
                          <div
                            className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              automationSettings.autoPosting
                                ? "left-7"
                                : "left-1",
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700">
                        Xush kelibsiz xabari
                      </label>
                      <textarea
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                        value={automationSettings.welcomeMessage}
                        onChange={(e) =>
                          setAutomationSettings((s) => ({
                            ...s,
                            welcomeMessage: e.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={handleSaveAutomation}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        {saveStatus === "Saqlanmoqda..." ? (
                          <Clock className="animate-spin" size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                        {saveStatus || "Sozlamalarni saqlash"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">
                      Lidlar O'sishi
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { name: "Dush", leads: 40 },
                          { name: "Sesh", leads: 30 },
                          { name: "Chor", leads: 65 },
                          { name: "Pay", leads: 45 },
                          { name: "Jum", leads: 90 },
                          { name: "Shan", leads: 70 },
                          { name: "Yak", leads: 110 },
                        ]}
                      >
                        <defs>
                          <linearGradient
                            id="colorLeads"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f97316"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f97316"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="leads"
                          stroke="#f97316"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorLeads)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">
                      Daromad Dinamikasi
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: "Yan", revenue: 4000000 },
                          { name: "Fev", revenue: 3000000 },
                          { name: "Mar", revenue: 5000000 },
                          { name: "Apr", revenue: 4500000 },
                          { name: "May", revenue: 9000000 },
                          { name: "Iyun", revenue: 12000000 },
                        ]}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          tickFormatter={(v) => `${v / 1000000}M`}
                        />
                        <Tooltip
                          formatter={(v: any) => `${v.toLocaleString()} so'm`}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{
                            r: 6,
                            fill: "#10b981",
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      ROI (O'rtacha)
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900">340%</h4>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      CAC (Mijoz jalb qilish narxi)
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900">
                      12,500 so'm
                    </h4>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">
                      LTV (Mijoz qiymati)
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900">
                      4,500,000 so'm
                    </h4>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "ads" && (
              <motion.div
                key="ads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                {/* Header + Platform Toggle */}
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        Reklama Avtomatizatsiyasi (AI)
                      </h3>
                      <p className="text-slate-500 text-sm">
                        TG Ads va Meta Ads uchun kreativlar yarating
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <a
                        href="https://adsshop.org/channels"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <Send size={16} />
                        Telegram Ads
                      </a>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setAdsPlatform("tg")}
                          className={cn(
                            "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
                            adsPlatform === "tg"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700",
                          )}
                        >
                          TG Ads (AI)
                        </button>
                        <button
                          onClick={() => setAdsPlatform("instagram")}
                          className={cn(
                            "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
                            adsPlatform === "instagram"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700",
                          )}
                        >
                          Meta Ads (AI)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TG Ads: Language Selector */}
                  {adsPlatform === "tg" && (
                    <div className="flex items-center gap-3">
                      <Languages size={16} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Til:</span>
                      <div className="flex bg-slate-100 p-1 rounded-lg">
                        {([
                          { key: "uz" as const, label: "O'zbek" },
                          { key: "en" as const, label: "Inglizcha" },
                          { key: "ru" as const, label: "Ruscha" },
                        ]).map((lang) => (
                          <button
                            key={lang.key}
                            onClick={() => setTgAdsLang(lang.key)}
                            className={cn(
                              "px-4 py-1.5 rounded-md text-xs font-bold transition-colors",
                              tgAdsLang === lang.key
                                ? "bg-white text-slate-900 shadow-sm"
                                : "text-slate-500 hover:text-slate-700",
                            )}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                      {tgAdsLang === "uz" && (
                        <span className="text-[10px] text-orange-500 font-semibold">Lotin yozuvida</span>
                      )}
                    </div>
                  )}

                  {/* Input + Character Counter + Generate */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Mahsulot yoki xizmat haqida qisqacha
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <textarea
                          value={adsInput}
                          onChange={(e) => {
                            if (adsPlatform === "tg" && e.target.value.length > 160) return;
                            setAdsInput(e.target.value);
                          }}
                          maxLength={adsPlatform === "tg" ? 160 : undefined}
                          placeholder={
                            adsPlatform === "tg"
                              ? "Masalan: Toshkentda yangi ochilgan milliy taomlar restorani uchun reklama... (max 160 belgi)"
                              : "Masalan: Toshkentda yangi ochilgan milliy taomlar restorani uchun reklama..."
                          }
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] text-sm"
                        />
                        {adsPlatform === "tg" && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                            <span className={cn(
                              "text-xs font-bold tabular-nums",
                              adsInput.length > 140 ? "text-red-500" : adsInput.length > 100 ? "text-orange-500" : "text-slate-400",
                            )}>
                              {adsInput.length}
                            </span>
                            <span className="text-xs text-slate-300">/160</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleGenerateAds}
                        disabled={adsLoading || !adsInput.trim()}
                        className="px-8 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-2"
                      >
                        {adsLoading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Sparkles size={24} />
                            <span className="text-sm">Yaratish</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ===== TG ADS RESULTS ===== */}
                {adsPlatform === "tg" && tgTextVariants.length > 0 && (
                  <div className="space-y-6">
                    {/* Legacy creative summary */}
                    {adsResult && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Layout size={14} /> Kreativ G'oya
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">{adsResult.creative}</p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                          <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap size={14} /> Hook'lar
                          </h4>
                          <ul className="space-y-2">
                            {adsResult.hooks.map((hook: string, i: number) => (
                              <li key={i} className="flex gap-2 text-slate-700 text-sm">
                                <span className="text-orange-500 font-bold">{i + 1}.</span>
                                {hook}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Send size={14} /> CTA
                          </h4>
                          <ul className="space-y-2">
                            {adsResult.ctas.map((cta: string, i: number) => (
                              <li key={i} className="flex gap-2 text-slate-700 text-sm">
                                <span className="text-blue-500 font-bold">{i + 1}.</span>
                                {cta}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Text Variants (5) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Type size={14} /> Matn variantlari — tanlang (1 ta)
                        </h4>
                        {tgSelectedText !== null && (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <Check size={12} /> Variant {tgSelectedText + 1} tanlandi
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tgTextVariants.map((text, i) => (
                          <button
                            key={i}
                            onClick={() => setTgSelectedText(i)}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left text-sm transition-all",
                              tgSelectedText === i
                                ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200"
                                : "border-slate-100 bg-slate-50 hover:border-slate-300",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Variant {i + 1}</span>
                              {tgSelectedText === i && (
                                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-slate-700 leading-relaxed">{text}</p>
                            <p className="text-[10px] text-slate-400 mt-2 tabular-nums">{text.length}/160 belgi</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Variants (3) — 16:9 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Image size={14} /> Rasm variantlari (16:9) — tanlang (1 ta)
                        </h4>
                        {tgSelectedImage !== null && (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <Check size={12} /> Rasm {tgSelectedImage + 1} tanlandi
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tgImageVariants.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setTgSelectedImage(i)}
                            className={cn(
                              "rounded-xl border-2 overflow-hidden transition-all group relative",
                              tgSelectedImage === i
                                ? "border-orange-500 ring-2 ring-orange-200"
                                : "border-slate-100 hover:border-slate-300",
                            )}
                          >
                            <div className="aspect-video bg-slate-100 relative">
                              <img
                                src={url}
                                alt={`TG reklama rasm ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {tgSelectedImage === i && (
                                <div className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Check size={14} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-white">
                              <p className="text-xs font-bold text-slate-500">Rasm {i + 1}</p>
                              <p className="text-[10px] text-slate-400">16:9 format</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selection Summary */}
                    <div className={cn(
                      "p-5 rounded-2xl border text-sm",
                      tgSelectedText !== null && tgSelectedImage !== null
                        ? "bg-green-50 border-green-200"
                        : "bg-slate-50 border-slate-100",
                    )}>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white",
                            tgSelectedText !== null ? "bg-green-500" : "bg-slate-300",
                          )}>
                            <Type size={14} />
                          </div>
                          <span className="text-slate-600 font-medium">
                            {tgSelectedText !== null ? `Matn variant ${tgSelectedText + 1} tanlandi` : "Matn tanlanmagan"}
                          </span>
                          <div className="w-px h-6 bg-slate-200" />
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white",
                            tgSelectedImage !== null ? "bg-green-500" : "bg-slate-300",
                          )}>
                            <Image size={14} />
                          </div>
                          <span className="text-slate-600 font-medium">
                            {tgSelectedImage !== null ? `Rasm variant ${tgSelectedImage + 1} tanlandi` : "Rasm tanlanmagan"}
                          </span>
                        </div>
                        {tgSelectedText !== null && tgSelectedImage !== null && (
                          <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                            <Check size={16} />
                            Tayyor — Davom etish
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== META ADS RESULTS ===== */}
                {adsPlatform === "instagram" && metaTexts && (
                  <div className="space-y-6">
                    {/* Legacy creative summary */}
                    {adsResult && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Layout size={14} /> Kreativ G'oya
                          </h4>
                          <p className="text-slate-700 text-sm leading-relaxed">{adsResult.creative}</p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                          <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap size={14} /> Hook'lar
                          </h4>
                          <ul className="space-y-2">
                            {adsResult.hooks.map((hook: string, i: number) => (
                              <li key={i} className="flex gap-2 text-slate-700 text-sm">
                                <span className="text-orange-500 font-bold">{i + 1}.</span>
                                {hook}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Send size={14} /> CTA
                          </h4>
                          <ul className="space-y-2">
                            {adsResult.ctas.map((cta: string, i: number) => (
                              <li key={i} className="flex gap-2 text-slate-700 text-sm">
                                <span className="text-blue-500 font-bold">{i + 1}.</span>
                                {cta}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Meta Text Fields: Headline, Primary, CTA */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Type size={14} /> Reklama matnlari
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
                          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Sarlavha (Headline)</p>
                          <p className="text-slate-900 font-bold text-lg leading-snug">{metaTexts.headline}</p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asosiy matn (Primary)</p>
                          <p className="text-slate-700 text-sm leading-relaxed">{metaTexts.primary}</p>
                        </div>
                        <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Harakatga chaqiriq (CTA)</p>
                          <p className="text-slate-900 font-bold">{metaTexts.cta}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meta Images: 1:1, 16:9, 9:16 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Image size={14} /> Reklama rasmlari (3 format)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                        {metaImages.map((img, i) => (
                          <div key={i} className="rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                            <div className={cn(
                              "relative bg-slate-200",
                              img.ratio === "1:1" && "aspect-square",
                              img.ratio === "16:9" && "aspect-video",
                              img.ratio === "9:16" && "aspect-[9/16]",
                            )}>
                              <img
                                src={img.url}
                                alt={img.label}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-md">
                                <span className="text-[10px] font-bold text-slate-600">{img.ratio}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-white flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-700">{img.label}</p>
                                <p className="text-[10px] text-slate-400">{img.ratio} nisbat</p>
                              </div>
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Check size={12} className="text-green-600" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Check size={12} className="text-green-500" />
                        Barcha formatlar avtomatik tanlangan — tayyor eksport qilishga
                      </p>
                    </div>

                    {/* Export Summary */}
                    <div className="p-5 bg-green-50 rounded-2xl border border-green-200 flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Meta Ads to'plami tayyor</p>
                          <p className="text-xs text-slate-500">3 rasm formati + 3 matn turi — to'liq kreativ to'plam</p>
                        </div>
                      </div>
                      <button className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                        <Download size={16} />
                        Eksport qilish
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "business" && (
              <motion.div
                key="business"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* AI Advisor Chat */}
                  <div className="xl:col-span-2 flex flex-col h-[600px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                      <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          AI Moliyaviy Maslahatchi
                        </h3>
                        <p className="text-xs text-slate-400">
                          Biznesingiz uchun aqlli yordamchi
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                      {bizChat.map((msg, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex",
                            msg.role === "user"
                              ? "justify-end"
                              : "justify-start",
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] p-4 rounded-2xl text-sm",
                              msg.role === "user"
                                ? "bg-slate-900 text-white rounded-tr-none"
                                : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm",
                            )}
                          >
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
                        <input
                          type="text"
                          placeholder="Savolingizni yozing (masalan: Biznes-reja qanday tuziladi?)..."
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                          value={bizInput}
                          onChange={(e) => setBizInput(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleBizChat()
                          }
                        />
                        <button
                          onClick={() => handleBizChat()}
                          disabled={bizLoading}
                          className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors active:scale-95 disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tools Sidebar */}
                  <div className="space-y-6">
                    {/* Loan Calculator */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                      <div className="flex items-center gap-3">
                        <Calculator size={18} className="text-orange-500" />
                        <h4 className="font-bold text-sm text-slate-900">
                          Kredit Kalkulyatori
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Summa (so'm)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 tabular-nums"
                            value={formatNumber(loanAmount)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              setLoanAmount(Number(raw) || 0);
                            }}
                          />
                          {loanAmount > 0 && (
                            <p className="text-[10px] text-slate-400 pl-1">
                              {formatCompact(loanAmount)} so'm
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">
                              Foiz (%)
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                              value={loanRate}
                              onChange={(e) =>
                                setLoanRate(Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">
                              Muddat (oy)
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                              value={loanTerm}
                              onChange={(e) =>
                                setLoanTerm(Number(e.target.value))
                              }
                            />
                          </div>
                        </div>
                        <StatCard
                          label="Oylik to'lov"
                          value={calculateLoan()}
                          icon={DollarSign}
                          color="orange"
                        />
                        {calculateLoan() > 0 && (
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                            <span className="text-slate-500">Jami to'lov</span>
                            <span className="font-bold text-slate-700 tabular-nums">
                              <FormattedNumber value={calculateLoan() * loanTerm} currency compact />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tax Calculator */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                      <div className="flex items-center gap-3">
                        <Landmark size={18} className="text-blue-500" />
                        <h4 className="font-bold text-sm text-slate-900">
                          Soliq Hisob-kitobi
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Yillik tushum (so'm)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 tabular-nums"
                            value={formatNumber(taxRevenue)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, "");
                              setTaxRevenue(Number(raw) || 0);
                            }}
                          />
                          {taxRevenue > 0 && (
                            <p className="text-[10px] text-slate-400 pl-1">
                              {formatCompact(taxRevenue)} so'm
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Soliq turi
                          </label>
                          <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                            value={taxType}
                            onChange={(e) => setTaxType(e.target.value)}
                          >
                            <option value="simplified">
                              Aylanmadan soliq (4%)
                            </option>
                            <option value="fixed">
                              Qat'iy belgilangan soliq
                            </option>
                            <option value="general">
                              Umumbelgilangan (12% QQS + foyda)
                            </option>
                          </select>
                        </div>
                        <StatCard
                          label="Taxminiy soliq"
                          value={calculateTax()}
                          icon={Landmark}
                          color="blue"
                        />
                        {taxRevenue > 0 && calculateTax() > 0 && (
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                            <span className="text-slate-500">Soliqdan keyin</span>
                            <span className="font-bold text-green-600 tabular-nums">
                              <FormattedNumber value={taxRevenue - calculateTax()} currency compact />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Market Analysis Tool */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                      <div className="flex items-center gap-3">
                        <PieChart size={18} className="text-orange-500" />
                        <h4 className="font-bold text-sm text-slate-900">
                          Bozor Tahlili (AI)
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Biznes g'oyasi
                          </label>
                          <input
                            type="text"
                            placeholder="Masalan: Toshkentda kofe do'koni..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                            value={marketAnalysisInput}
                            onChange={(e) =>
                              setMarketAnalysisInput(e.target.value)
                            }
                          />
                        </div>
                        <button
                          onClick={handleMarketAnalysis}
                          disabled={
                            marketAnalysisLoading || !marketAnalysisInput.trim()
                          }
                          className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {marketAnalysisLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Sparkles size={16} />
                              <span>Tahlil qilish</span>
                            </>
                          )}
                        </button>
                        {marketAnalysisResult && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto prose prose-sm prose-slate">
                            <Markdown>{marketAnalysisResult}</Markdown>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowBizPlanForm(true)}
                        className="p-4 bg-slate-900 text-white rounded-xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-colors"
                      >
                        <Rocket size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          Biznes-reja
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          handleBizChat(
                            "Mening biznesim uchun bozor tahlilini qilib bering. O'zbekiston bozoridagi raqobatchilar va imkoniyatlarni qanday aniqlasam bo'ladi?",
                          )
                        }
                        className="p-4 bg-white border border-slate-200 text-slate-900 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors"
                      >
                        <PieChart size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          Bozor tahlili
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Yangi Lid Qo'shish
                </h3>
                <button
                  onClick={() => setShowAddLeadModal(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Mijoz Ismi
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Aziz Rahimov"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Telefon Raqami
                  </label>
                  <input
                    type="tel"
                    placeholder="+998 90 123 45 67"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Manba
                    </label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500">
                      <option>Instagram</option>
                      <option>Telegram</option>
                      <option>Facebook</option>
                      <option>Veb-sayt</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="cold">Sovuq</option>
                      <option value="warm">Iliq</option>
                      <option value="hot">Issiq</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                  Lidni Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Contact Modal */}
        {infContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setInfContactModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-8">
                <div className="flex items-center gap-4">
                  <img src={infContactModal.avatar} alt={infContactModal.name} className="h-12 w-12 rounded-xl border border-slate-100 object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{infContactModal.name}</h3>
                      {infContactModal.verified && <BadgeCheck size={16} className="text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-400">{infContactModal.username}</p>
                  </div>
                </div>
                <button onClick={() => setInfContactModal(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bog'lanish usullari</p>

                {infContactModal.contact?.telegram && (
                  <a
                    href={`https://t.me/${infContactModal.contact.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-sky-50 hover:border-sky-200"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                      <Send size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Telegram</p>
                      <p className="text-xs text-slate-500">{infContactModal.contact.telegram}</p>
                    </div>
                    <ExternalLink size={16} className="text-slate-400" />
                  </a>
                )}

                {infContactModal.contact?.phone && (
                  <a
                    href={`tel:${infContactModal.contact.phone}`}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-green-50 hover:border-green-200"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                      <Phone size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Telefon</p>
                      <p className="text-xs text-slate-500">{infContactModal.contact.phone}</p>
                    </div>
                    <ExternalLink size={16} className="text-slate-400" />
                  </a>
                )}

                {infContactModal.contact?.agent && (
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <Users size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">Agent / Menejer</p>
                      <p className="text-xs text-slate-500">{infContactModal.contact.agent}</p>
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-xs text-orange-600">
                    <Sparkles size={12} className="mr-1 inline" />
                    Hamkorlik taklifi yuborishda biznesingiz haqida qisqacha yozing — javob olish ehtimolini oshiradi.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddInfluencerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAddInfluencerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Yangi Hamkor Qo'shish</h3>
                <button onClick={() => setShowAddInfluencerModal(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Influencer Ismi</label>
                  <input type="text" placeholder="Masalan: Munisa Rizayeva" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Obunachilar</label>
                    <input type="text" placeholder="Masalan: 5M" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Promokod</label>
                    <input type="text" placeholder="Masalan: MUNISA10" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>
                <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95">
                  Hamkorni Saqlash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showBizPlanForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <Rocket size={20} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Biznes-reja Ma'lumotlari
                  </h3>
                </div>
                <button
                  onClick={() => setShowBizPlanForm(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Soha (Yo'nalish)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Umumiy ovqatlanish"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                      value={bizPlanForm.industry}
                      onChange={(e) =>
                        setBizPlanForm({
                          ...bizPlanForm,
                          industry: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Biznes Turi
                    </label>
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                      value={bizPlanForm.type}
                      onChange={(e) =>
                        setBizPlanForm({ ...bizPlanForm, type: e.target.value })
                      }
                    >
                      <option value="an'anaviy">An'anaviy</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Resurslar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Pul (Kapital)
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: 50 mln so'm"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.budget}
                        onChange={(e) =>
                          setBizPlanForm({
                            ...bizPlanForm,
                            budget: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Jihozlar
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: Kompyuter, mebel"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.equipment}
                        onChange={(e) =>
                          setBizPlanForm({
                            ...bizPlanForm,
                            equipment: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Jamoa
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: 3 kishi"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.team}
                        onChange={(e) =>
                          setBizPlanForm({
                            ...bizPlanForm,
                            team: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">
                    Hudud
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Mamlakat
                      </label>
                      <input
                        type="text"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.country}
                        onChange={(e) =>
                          setBizPlanForm({
                            ...bizPlanForm,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Viloyat
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: Toshkent"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.region}
                        onChange={(e) =>
                          setBizPlanForm({
                            ...bizPlanForm,
                            region: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">
                        Tuman
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: Chilonzor"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.district}
                        onChange={(e) =>
                          setBizPlanForm({
                            ...bizPlanForm,
                            district: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateBizPlan}
                  className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Sparkles size={20} />
                  AI Biznes-rejani Yaratish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
