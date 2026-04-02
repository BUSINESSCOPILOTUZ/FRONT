// chan

import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
  Suspense,
} from "react";
declare var process: any;
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Sidebar, headerTitles } from "./components/CoreComponents";
import {
  DashboardPage,
  CrmPage,
  InfluencersPage,
  ContentPage,
  WebsitePage,
  AutomationPage,
  AnalyticsPage,
  BusinessPage,
  AdsPage,
  SalesBotPage,
} from "./pages";
import {
  TrendingUp,
  Users,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  LogIn,
  LogOut,
  Rocket,
  Send,
  Sparkles,
  Loader2,
  Eye,
  Trash2,
  BadgeCheck,
  ExternalLink,
  Phone,
  X,
  Instagram,
  Mail,
  Lock,
  EyeOff,
  UserPlus,
  ArrowLeft,
  Type,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// Firebase — hozircha o'chirilgan, backend API ishlatiladi
// import {
//   collection,
//   onSnapshot,
//   query,
//   orderBy,
//   limit,
//   Timestamp,
//   doc,
// } from "firebase/firestore";
// import { db, handleFirestoreError, OperationType } from "./firebase";

import {
  AUTH_API,
  API_BASE,
  CONTENT_API,
  BOT_API,
  LEADS_API,
  INFLUENCERS_API,
} from "./services/api";

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
  generateAds: async (
    description: string,
    platform: string,
    language?: string,
  ) => {
    // Extended: sends language for TG Ads (uz, en, ru)
    const res = await fetch(`${API_BASE}/generate-ads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        platform,
        ...(language && { language }),
      }),
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
  /**
   * Generate DALL-E 3 images for TG or Meta ads.
   * TG response:   { platform: "tg", images: [url, url, url] }
   * Meta response:  { platform: "instagram", images: [{ url, ratio, label }] }
   */
  generateAdImages: async (
    description: string,
    platform: string,
    language?: string,
  ) => {
    const res = await fetch(`${API_BASE}/generate-ad-images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        platform,
        ...(language && { language }),
      }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
};

// --- Bot API Client ---

const botApi = {
  validateToken: async (token: string) => {
    const res = await fetch(`${BOT_API}/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  getSettings: async (userId: string) => {
    const res = await fetch(`${BOT_API}/settings/${userId}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  updateSettings: async (userId: string, updates: any) => {
    const res = await fetch(`${BOT_API}/settings/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  uploadKnowledgeFile: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BOT_API}/knowledge/${userId}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  uploadKnowledgeText: async (userId: string, text: string) => {
    const res = await fetch(`${BOT_API}/knowledge/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  getKnowledge: async (userId: string) => {
    const res = await fetch(`${BOT_API}/knowledge/${userId}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  deleteKnowledge: async (userId: string, chunkId: string) => {
    const res = await fetch(`${BOT_API}/knowledge/${userId}/${chunkId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data;
  },
  clearKnowledge: async (userId: string) => {
    const res = await fetch(`${BOT_API}/knowledge/${userId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data;
  },
  testChat: async (userId: string, message: string) => {
    const res = await fetch(`${BOT_API}/chat/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  getAnalytics: async (userId: string, days?: number) => {
    const res = await fetch(`${BOT_API}/analytics/${userId}?days=${days || 7}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
  getLogs: async (userId: string, count?: number) => {
    const res = await fetch(`${BOT_API}/logs/${userId}?count=${count || 5}`);
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return data.data;
  },
};

// --- Types ---
interface Lead {
  id: string;
  name: string;
  phone: string;
  status: "cold" | "warm" | "hot" | "appointment";
  source: string;
  createdAt?: any;
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
  createdAt: any;
}

interface Message {
  role: "user" | "model";
  text: string;
}

// Foydalanuvchi interfeysi (Firebase o'rniga backend JWT dan keladigan ma'lumotlar)
interface AppUser {
  uid: string; // Backend'dagi user._id
  displayName: string; // Ism
  email: string; // Email
  phone?: string; // Telefon raqami
  photoURL: string; // Profil rasmi
  role?: string; // user | admin | manager
  phoneVerified?: boolean;
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
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

  // Market Analysis State
  const [marketAnalysisInput, setMarketAnalysisInput] = useState("");
  const [marketAnalysisResult, setMarketAnalysisResult] = useState<
    string | null
  >(null);
  const [marketAnalysisLoading, setMarketAnalysisLoading] = useState(false);

  // Dashboard Ad Performance State
  const [adDateRange, setAdDateRange] = useState<"7" | "30" | "90">("30");
  const [adPlatform, setAdPlatform] = useState<
    "all" | "instagram" | "telegram" | "google"
  >("all");

  // ============================================
  // LOGIN FORM STATE
  // ============================================
  const [loginTab, setLoginTab] = useState<"email" | "phone">("email");
  const [loginMode, setLoginMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Auth Listener — localStorage'dan foydalanuvchini tiklash
  useEffect(() => {
    // 1. localStorage'dan saqlangan auth-user ni tekshirish (sahifa yangilanganda)
    const savedAuthUser = localStorage.getItem("auth-user");
    const savedToken = localStorage.getItem("auth-token");
    if (savedAuthUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedAuthUser);
        setUser({
          uid: parsedUser.id || parsedUser.uid,
          displayName: parsedUser.name || parsedUser.displayName || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          photoURL: parsedUser.photoURL || "",
          role: parsedUser.role || "user",
          phoneVerified: parsedUser.phoneVerified || false,
        });
        setIsAuthReady(true);
        return;
      } catch (e) {
        localStorage.removeItem("auth-user");
        localStorage.removeItem("auth-token");
      }
    }

    // 2. Demo user ni tekshirish
    const savedDemo = localStorage.getItem("demo-user");
    if (savedDemo) {
      try {
        const mockUser = JSON.parse(savedDemo) as AppUser;
        setUser(mockUser);
      } catch (e) {
        localStorage.removeItem("demo-user");
      }
    }

    setIsAuthReady(true);
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
          createdAt: { toDate: () => new Date() },
        },
        {
          id: "2",
          name: "Malika Karimova",
          phone: "+998 93 765 43 21",
          status: "warm",
          source: "Telegram",
          createdAt: { toDate: () => new Date() },
        },
        {
          id: "3",
          name: "Jasur Olimov",
          phone: "+998 99 111 22 33",
          status: "appointment",
          source: "Facebook",
          createdAt: { toDate: () => new Date() },
        },
        {
          id: "4",
          name: "Dilnoza Ergasheva",
          phone: "+998 97 444 55 66",
          status: "cold",
          source: "Website",
          createdAt: { toDate: () => new Date() },
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
          createdAt: { toDate: () => new Date() },
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
          createdAt: { toDate: () => new Date() },
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Leads — Backend API dan olish (MongoDB)
    const loadLeads = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const res = await fetch(LEADS_API, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.status && data.data) {
          setLeads(
            data.data.map((l: any) => ({
              ...l,
              id: l._id || l.id,
              createdAt: l.createdAt
                ? { toDate: () => new Date(l.createdAt) }
                : { toDate: () => new Date() },
            })),
          );
        }
      } catch (error) {
        console.error("Leads olishda xatolik:", error);
      }
    };

    // Influencers — Backend API dan olish (MongoDB)
    const loadInfluencers = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const res = await fetch(INFLUENCERS_API, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.status && data.data) {
          setInfluencers(
            data.data.map((i: any) => ({
              ...i,
              id: i._id || i.id,
            })),
          );
        }
      } catch (error) {
        console.error("Influencers olishda xatolik:", error);
      }
    };

    // Content Plans — Backend API dan olish (MongoDB)
    const loadContentPlans = async () => {
      if (user?.uid === "demo-user-123") return;
      try {
        const token = localStorage.getItem("auth-token");
        const res = await fetch(CONTENT_API, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.status && data.data) {
          setContentPlans(
            data.data.map((p: any) => ({
              ...p,
              id: p._id || p.id,
              createdAt: p.createdAt
                ? { toDate: () => new Date(p.createdAt) }
                : { toDate: () => new Date() },
            })),
          );
        }
      } catch (error) {
        console.error("Content plans olishda xatolik:", error);
      }
    };

    // Barcha ma'lumotlarni parallel yuklash
    Promise.all([loadLeads(), loadInfluencers(), loadContentPlans()]).finally(
      () => {
        setLoading(false);
      },
    );
  }, [isAuthReady, user]);

  // ============================================
  // AUTH HANDLERS — Email/Parol va Telefon/OTP
  // ============================================

  /** Muvaffaqiyatli auth dan keyin — token va user ni saqlash */
  const handleAuthSuccess = (token: string, userData: any) => {
    localStorage.setItem("auth-token", token);
    localStorage.setItem("auth-user", JSON.stringify(userData));
    setUser({
      uid: userData.id,
      displayName: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      photoURL: userData.photoURL || "",
      role: userData.role || "user",
      phoneVerified: userData.phoneVerified || false,
    });
    setAuthError(null);
  };

  /** EMAIL + PAROL orqali kirish */
  const handleEmailLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError("Email va parolni kiriting.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);
      handleAuthSuccess(data.data.token, data.data.user);
    } catch (error: any) {
      setAuthError(error.message || "Kirishda xatolik yuz berdi.");
    } finally {
      setAuthLoading(false);
    }
  };

  /** EMAIL + PAROL orqali ro'yxatdan o'tish */
  const handleEmailRegister = async () => {
    if (!loginName.trim() || !loginEmail.trim() || !loginPassword.trim()) {
      setAuthError("Ism, email va parolni kiriting.");
      return;
    }
    if (loginPassword.length < 6) {
      setAuthError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: loginName,
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);
      handleAuthSuccess(data.data.token, data.data.user);
    } catch (error: any) {
      setAuthError(error.message || "Ro'yxatdan o'tishda xatolik.");
    } finally {
      setAuthLoading(false);
    }
  };

  /** TELEFON RAQAMIGA OTP KOD YUBORISH */
  const handleSendOTP = async () => {
    if (!loginPhone.trim()) {
      setAuthError("Telefon raqamini kiriting.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${AUTH_API}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);
      setOtpSent(true);
      setOtpCountdown(120); // 2 daqiqa kutish
      setAuthError(null);
    } catch (error: any) {
      setAuthError(error.message || "SMS yuborishda xatolik.");
    } finally {
      setAuthLoading(false);
    }
  };

  /** OTP KODNI TEKSHIRISH VA KIRISH */
  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      setAuthError("6 xonali tasdiqlash kodini kiriting.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${AUTH_API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, code: otpCode }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message);
      handleAuthSuccess(data.data.token, data.data.user);
    } catch (error: any) {
      setAuthError(error.message || "Kod tekshirishda xatolik.");
    } finally {
      setAuthLoading(false);
    }
  };

  /** DEMO REJIM */
  const handleDemoLogin = () => {
    const mockUser: AppUser = {
      uid: "demo-user-123",
      displayName: "Demo Foydalanuvchi",
      email: "demo@uzmarketing.ai",
      photoURL: "https://picsum.photos/seed/demo/200/200",
    };
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

  /** CHIQISH */
  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("auth-user");
    localStorage.removeItem("demo-user");
    setUser(null);
    // Login form ni tozalash
    setLoginEmail("");
    setLoginPassword("");
    setLoginName("");
    setLoginPhone("");
    setOtpCode("");
    setOtpSent(false);
    setAuthError(null);
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
          createdAt: { toDate: () => new Date() },
        };
        setContentPlans((prev) => [newPlan, ...prev]);
        setContentInput("");
        setLoading(false);
        return;
      }

      // Backend API orqali yaratish (MongoDB ga saqlanadi)
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`${CONTENT_API}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      const token = localStorage.getItem("auth-token");
      const res = await fetch(CONTENT_API, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.status && data.data) {
        setContentPlans(
          data.data.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            createdAt: p.createdAt
              ? { toDate: () => new Date(p.createdAt) }
              : { toDate: () => new Date() },
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
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`${CONTENT_API}/${planId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 p-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100">
          {/* Logo va sarlavha */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform rotate-12 mb-4">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              BUSINESS COPILOT
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Marketingni avtomatlashtirish platformasi
            </p>
          </div>

          {/* Tab switcher — Email yoki Telefon */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setLoginTab("email");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                loginTab === "email"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Mail size={16} />
              Email
            </button>
            <button
              onClick={() => {
                setLoginTab("phone");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                loginTab === "phone"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Phone size={16} />
              Telefon
            </button>
          </div>

          {/* Xatolik xabari */}
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* ========== EMAIL TAB ========== */}
          {loginTab === "email" && (
            <div className="space-y-4">
              {/* Login / Register toggle */}
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-slate-500">
                  {loginMode === "login"
                    ? "Hisobingiz yo'qmi?"
                    : "Hisobingiz bormi?"}
                </span>
                <button
                  onClick={() => {
                    setLoginMode(loginMode === "login" ? "register" : "login");
                    setAuthError(null);
                  }}
                  className="text-orange-500 font-bold hover:underline"
                >
                  {loginMode === "login" ? "Ro'yxatdan o'tish" : "Kirish"}
                </button>
              </div>

              {/* Ism (faqat register da) */}
              {loginMode === "register" && (
                <div className="relative">
                  <UserPlus
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Ismingiz"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  placeholder="Email manzilingiz"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (loginMode === "login"
                      ? handleEmailLogin()
                      : handleEmailRegister())
                  }
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Parol */}
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Parolingiz"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (loginMode === "login"
                      ? handleEmailLogin()
                      : handleEmailRegister())
                  }
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Kirish / Ro'yxatdan o'tish tugmasi */}
              <button
                onClick={
                  loginMode === "login" ? handleEmailLogin : handleEmailRegister
                }
                disabled={authLoading}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : loginMode === "login" ? (
                  <>
                    <LogIn size={18} /> Kirish
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Ro'yxatdan o'tish
                  </>
                )}
              </button>
            </div>
          )}

          {/* ========== PHONE TAB ========== */}
          {loginTab === "phone" && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  {/* Telefon raqami kiritish */}
                  <p className="text-center text-slate-500 text-sm">
                    Telefon raqamingizga tasdiqlash kodi yuboriladi
                  </p>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-600 text-sm font-medium">
                      +998
                    </span>
                    <input
                      type="tel"
                      placeholder="90 123 45 67"
                      value={loginPhone}
                      onChange={(e) =>
                        setLoginPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 9),
                        )
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                      className="w-full pl-[5.5rem] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      maxLength={9}
                    />
                  </div>

                  {/* OTP yuborish tugmasi */}
                  <button
                    onClick={handleSendOTP}
                    disabled={authLoading || loginPhone.length < 9}
                    className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg active:scale-[0.98] disabled:opacity-60"
                  >
                    {authLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} /> Kod yuborish
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* OTP kod kiritish */}
                  <div className="text-center space-y-1">
                    <p className="text-slate-600 text-sm">
                      <span className="font-bold text-slate-900">
                        +998{loginPhone}
                      </span>{" "}
                      raqamiga kod yuborildi
                    </p>
                    <p className="text-slate-400 text-xs">
                      {otpCountdown > 0
                        ? `Qayta yuborish: ${Math.floor(otpCountdown / 60)}:${(otpCountdown % 60).toString().padStart(2, "0")}`
                        : "Vaqt tugadi"}
                    </p>
                  </div>

                  {/* 6 xonali OTP input */}
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="6 xonali kod"
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center tracking-[0.5em] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  {/* Tasdiqlash tugmasi */}
                  <button
                    onClick={handleVerifyOTP}
                    disabled={authLoading || otpCode.length !== 6}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-60"
                  >
                    {authLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={18} /> Tasdiqlash
                      </>
                    )}
                  </button>

                  {/* Orqaga qaytish va qayta yuborish */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                        setAuthError(null);
                      }}
                      className="text-slate-500 text-sm flex items-center gap-1 hover:text-slate-700"
                    >
                      <ArrowLeft size={14} /> Orqaga
                    </button>
                    {otpCountdown <= 0 && (
                      <button
                        onClick={handleSendOTP}
                        disabled={authLoading}
                        className="text-orange-500 text-sm font-bold hover:underline"
                      >
                        Qayta yuborish
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Ajratuvchi chiziq */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">yoki</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Demo rejim tugmasi */}
          <button
            onClick={handleDemoLogin}
            className="w-full py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm active:scale-[0.98]"
          >
            <Users size={16} />
            Demo rejimida ko'rish
          </button>

          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center mt-4">
            Xavfsiz va tezkor kirish
          </p>
        </div>
      </div>
    );
  }

  const suspenseFallback = (
    <div className="flex items-center justify-center py-20">
      <Clock className="animate-spin text-orange-500" size={32} />
    </div>
  );

  return (
    <div className="app-container flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            {headerTitles[location.pathname] || "Platforma"}
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
          <Suspense fallback={suspenseFallback}>
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    leads={leads}
                    adDateRange={adDateRange}
                    setAdDateRange={setAdDateRange}
                    adPlatform={adPlatform}
                    setAdPlatform={setAdPlatform}
                    setActiveTab={(tab: string) =>
                      navigate(`/${tab === "dashboard" ? "" : tab}`)
                    }
                  />
                }
              />
              <Route
                path="/crm"
                element={
                  <CrmPage
                    leads={leads}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    setShowAddLeadModal={setShowAddLeadModal}
                  />
                }
              />
              <Route
                path="/influencers"
                element={
                  <InfluencersPage
                    influencers={influencers}
                    infSearchTerm={infSearchTerm}
                    setInfSearchTerm={setInfSearchTerm}
                    infPlatformFilter={infPlatformFilter}
                    setInfPlatformFilter={setInfPlatformFilter}
                    infNicheFilter={infNicheFilter}
                    setInfNicheFilter={setInfNicheFilter}
                    infFollowersFilter={infFollowersFilter}
                    setInfFollowersFilter={setInfFollowersFilter}
                    infSortBy={infSortBy}
                    setInfSortBy={setInfSortBy}
                    infSaved={infSaved}
                    setInfSaved={setInfSaved}
                    setInfContactModal={setInfContactModal}
                    setShowAddInfluencerModal={setShowAddInfluencerModal}
                  />
                }
              />
              <Route
                path="/content"
                element={
                  <ContentPage
                    contentPlans={contentPlans}
                    contentInput={contentInput}
                    setContentInput={setContentInput}
                    expandedPlanId={expandedPlanId}
                    setExpandedPlanId={setExpandedPlanId}
                    telegramChannelId={telegramChannelId}
                    setTelegramChannelId={setTelegramChannelId}
                    approvingPlanId={approvingPlanId}
                    loading={loading}
                    handleGeneratePlan={handleGeneratePlan}
                    handleApprovePlan={handleApprovePlan}
                    handleUpdatePostSchedule={handleUpdatePostSchedule}
                  />
                }
              />
              <Route
                path="/website"
                element={
                  <WebsitePage
                    websiteInput={websiteInput}
                    setWebsiteInput={setWebsiteInput}
                    websiteResult={websiteResult}
                    websiteLoading={websiteLoading}
                    handleGenerateWebsite={handleGenerateWebsite}
                  />
                }
              />
              <Route
                path="/automation"
                element={
                  <AutomationPage
                    automationSettings={automationSettings}
                    setAutomationSettings={setAutomationSettings}
                    saveStatus={saveStatus}
                    handleSaveAutomation={handleSaveAutomation}
                  />
                }
              />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/ads" element={<AdsPage />} />
              <Route
                path="/salesbot"
                element={<SalesBotPage userId={user?.uid || "demo-user-123"} />}
              />
              <Route
                path="/business"
                element={
                  <BusinessPage
                    bizChat={bizChat}
                    bizInput={bizInput}
                    setBizInput={setBizInput}
                    bizLoading={bizLoading}
                    handleBizChat={handleBizChat}
                    loanAmount={loanAmount}
                    setLoanAmount={setLoanAmount}
                    loanRate={loanRate}
                    setLoanRate={setLoanRate}
                    loanTerm={loanTerm}
                    setLoanTerm={setLoanTerm}
                    calculateLoan={calculateLoan}
                    taxRevenue={taxRevenue}
                    setTaxRevenue={setTaxRevenue}
                    taxType={taxType}
                    setTaxType={setTaxType}
                    calculateTax={calculateTax}
                    marketAnalysisInput={marketAnalysisInput}
                    setMarketAnalysisInput={setMarketAnalysisInput}
                    marketAnalysisResult={marketAnalysisResult}
                    marketAnalysisLoading={marketAnalysisLoading}
                    handleMarketAnalysis={handleMarketAnalysis}
                    setShowBizPlanForm={setShowBizPlanForm}
                  />
                }
              />
            </Routes>
          </Suspense>
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
                  <img
                    src={infContactModal.avatar}
                    alt={infContactModal.name}
                    className="h-12 w-12 rounded-xl border border-slate-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {infContactModal.name}
                      </h3>
                      {infContactModal.verified && (
                        <BadgeCheck size={16} className="text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {infContactModal.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInfContactModal(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Bog'lanish usullari
                </p>

                {infContactModal.contact?.telegram && (
                  <a
                    href={`https://t.me/${infContactModal.contact.telegram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-sky-50 hover:border-sky-200"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                      <Send size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">
                        Telegram
                      </p>
                      <p className="text-xs text-slate-500">
                        {infContactModal.contact.telegram}
                      </p>
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
                      <p className="text-sm font-bold text-slate-900">
                        Telefon
                      </p>
                      <p className="text-xs text-slate-500">
                        {infContactModal.contact.phone}
                      </p>
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
                      <p className="text-sm font-bold text-slate-900">
                        Agent / Menejer
                      </p>
                      <p className="text-xs text-slate-500">
                        {infContactModal.contact.agent}
                      </p>
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-orange-50 p-3">
                  <p className="text-xs text-orange-600">
                    <Sparkles size={12} className="mr-1 inline" />
                    Hamkorlik taklifi yuborishda biznesingiz haqida qisqacha
                    yozing — javob olish ehtimolini oshiradi.
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
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Yangi Hamkor Qo'shish
                </h3>
                <button
                  onClick={() => setShowAddInfluencerModal(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Influencer Ismi
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: Munisa Rizayeva"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Obunachilar
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: 5M"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Promokod
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: MUNISA10"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                    />
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
