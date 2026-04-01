import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
declare var process: any;
import { Sidebar, AnalyticsCard, LeadRow, cn } from './components/CoreComponents';
import { TrendingUp, Users, DollarSign, MessageSquare, Plus, CheckCircle, Clock, AlertCircle, LogIn, LogOut, Share2, Filter, Download, Search, MoreVertical, Calendar, BarChart3, FileText, Rocket, Calculator, PieChart, Landmark, Send, Sparkles, Globe, Code, Layout, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Error Boundary ---
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: any; }

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
            <h2 className="text-xl font-bold text-slate-900 mb-2">Xatolik yuz berdi</h2>
            <p className="text-slate-500 text-sm mb-6">
              Ilovada kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.
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

// --- AI Setup ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// --- Types ---
interface Lead {
  id: string;
  name: string;
  phone: string;
  status: 'cold' | 'warm' | 'hot' | 'appointment';
  source: string;
  createdAt?: Timestamp;
}

interface Analytics {
  leads: number;
  conversions: number;
  revenue: string;
}

interface ContentPlan {
  id: string;
  title: string;
  rawText: string;
  generatedPlan: string;
  status: 'pending' | 'completed';
  createdAt: Timestamp;
}

interface Message {
  role: 'user' | 'model';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [automationSettings, setAutomationSettings] = useState({
    telegramBot: true,
    autoPosting: false,
    aiReply: true,
    welcomeMessage: "Assalomu alaykum! BUSINESS COPILOT ga xush kelibsiz."
  });
  const [loading, setLoading] = useState(true);
  const [contentInput, setContentInput] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddInfluencerModal, setShowAddInfluencerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Website Creation State
  const [websiteInput, setWebsiteInput] = useState('');
  const [websiteResult, setWebsiteResult] = useState<string | null>(null);
  const [websiteLoading, setWebsiteLoading] = useState(false);

  // Business Launch State
  const [bizChat, setBizChat] = useState<Message[]>([
    { role: 'model', text: "Assalomu alaykum! 👋 Men sizning moliyaviy maslahatchi AI yordamchingizman. Biznesingizni boshlash yoki rivojlantirish bo'yicha qanday savollaringiz bor? Keling, birga biznes-reja tuzamiz! 🚀\n\nBoshlash uchun, menga qanday biznes boshlashni rejalashtirmoqdasiz — shu haqida gapirib bering." }
  ]);
  const [bizInput, setBizInput] = useState('');
  const [loanAmount, setLoanAmount] = useState(10000000);
  const [loanRate, setLoanRate] = useState(24);
  const [loanTerm, setLoanTerm] = useState(12);
  const [taxRevenue, setTaxRevenue] = useState(50000000);
  const [taxType, setTaxType] = useState('simplified');
  const [bizLoading, setBizLoading] = useState(false);

  const [bizPlanForm, setBizPlanForm] = useState({
    industry: '',
    budget: '',
    equipment: '',
    team: '',
    country: "O'zbekiston",
    region: '',
    district: '',
    type: 'online'
  });
  const [showBizPlanForm, setShowBizPlanForm] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthReady || !user) return;

    if (user.uid === 'demo-user-123') {
      // Set mock data for demo
      setLeads([
        { id: '1', name: 'Aziz Rahimov', phone: '+998 90 123 45 67', status: 'hot', source: 'Instagram', createdAt: Timestamp.now() },
        { id: '2', name: 'Malika Karimova', phone: '+998 93 765 43 21', status: 'warm', source: 'Telegram', createdAt: Timestamp.now() },
        { id: '3', name: 'Jasur Olimov', phone: '+998 99 111 22 33', status: 'appointment', source: 'Facebook', createdAt: Timestamp.now() },
        { id: '4', name: 'Dilnoza Ergasheva', phone: '+998 97 444 55 66', status: 'cold', source: 'Website', createdAt: Timestamp.now() },
      ]);
      setInfluencers([
        { id: '1', name: 'Munisa Rizayeva', followers: '5M', promoCode: 'MUNISA10', conversions: 120, revenue: 15000000 },
        { id: '2', name: 'Shahzoda', followers: '4.5M', promoCode: 'SHAHZODA15', conversions: 85, revenue: 9000000 },
      ]);
      setContentPlans([
        { id: '1', title: 'AI Reja: Restoran marketingi', rawText: 'Milliy taomlar restorani uchun marketing', generatedPlan: '1. Dushanba: Milliy taomlar tarixi haqida post...', status: 'completed', createdAt: Timestamp.now() },
        { id: '2', title: 'AI Reja: Oquv markazi', rawText: 'Ingliz tili kursi uchun', generatedPlan: '1. Seshanba: Bepul darsga taklif...', status: 'pending', createdAt: Timestamp.now() },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Leads Listener
    const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    // Influencers Listener
    const unsubscribeInfluencers = onSnapshot(collection(db, 'influencers'), (snapshot) => {
      const influencersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInfluencers(influencersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'influencers');
    });

    // Content Plans Listener
    const unsubscribeContent = onSnapshot(query(collection(db, 'contentPlans'), orderBy('createdAt', 'desc')), (snapshot) => {
      const contentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentPlan));
      setContentPlans(contentData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'contentPlans');
    });

    return () => {
      unsubscribeLeads();
      unsubscribeInfluencers();
      unsubscribeContent();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login xatosi:", error);
    }
  };

  const handleDemoLogin = () => {
    const mockUser = {
      uid: 'demo-user-123',
      displayName: 'Demo Foydalanuvchi',
      email: 'demo@uzmarketing.ai',
      photoURL: 'https://picsum.photos/seed/demo/200/200',
    } as FirebaseUser;
    setUser(mockUser);
    setIsAuthReady(true);
  };

  const handleSaveAutomation = () => {
    setSaveStatus('Saqlanmoqda...');
    setTimeout(() => {
      setSaveStatus('Muvaffaqiyatli saqlandi!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };
  const handleLogout = async () => {
    if (user?.uid === 'demo-user-123') {
      setUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout xatosi:", error);
    }
  };

  const handleGeneratePlan = async () => {
    if (!contentInput.trim() || !user) return;
    setLoading(true);
    try {
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Siz professional marketing mutaxassisiz. Quyidagi mavzu uchun O'zbek tilida 1 haftalik ijtimoiy tarmoqlar (Telegram, Instagram) uchun kontent reja tuzing. Faqat rejaning o'zini qaytaring: ${contentInput}`,
        config: {
          systemInstruction: "Siz O'zbekiston bozori uchun marketing strategiyasini tuzuvchi AI yordamchisiz. Javoblaringiz faqat O'zbek tilida bo'lishi shart.",
        }
      });
      
      const response = await model;
      const planText = response.text || "Reja yaratib bo'lmadi.";
      setGeneratedPlan(planText);

      if (user.uid === 'demo-user-123') {
        const newPlan: ContentPlan = {
          id: Math.random().toString(36).substr(2, 9),
          title: "AI Reja: " + contentInput.substring(0, 20),
          rawText: contentInput,
          generatedPlan: planText,
          status: 'pending',
          createdAt: Timestamp.now()
        };
        setContentPlans(prev => [newPlan, ...prev]);
        setLoading(false);
        return;
      }

      // Save to Firestore
      await addDoc(collection(db, 'contentPlans'), {
        title: "AI Reja: " + contentInput.substring(0, 20),
        rawText: contentInput,
        generatedPlan: planText,
        status: 'pending',
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("AI xatosi:", error);
      handleFirestoreError(error, OperationType.CREATE, 'contentPlans');
    } finally {
      setLoading(false);
    }
  };

  const handleBizChat = async (directInput?: string) => {
    const input = directInput || bizInput;
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', text: input };
    setBizChat(prev => [...prev, userMsg]);
    if (!directInput) setBizInput('');
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
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...bizChat.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: input }] }
        ],
      });
      
      const text = response.text || "Kechirasiz, javob olishda xatolik yuz berdi.";
      setBizChat(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Biz chat error:", error);
      setBizChat(prev => [...prev, { role: 'model', text: "Kechirasiz, xatolik yuz berdi. Iltimos qaytadan urinib ko'ring." }]);
    } finally {
      setBizLoading(false);
    }
  };

  const handleGenerateWebsite = async () => {
    if (!websiteInput.trim()) return;
    setWebsiteLoading(true);
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `Siz professional veb-dizayner va dasturchisiz. Foydalanuvchi uchun quyidagi tavsif asosida veb-sayt strukturasi, dizayn konsepti, kerakli sahifalar ro'yxati va texnologik stekni (tech stack) tavsiya qiling. Javobni O'zbek tilida, chiroyli formatlangan holda yozing.\n\nTavsif: ${websiteInput}` }] }
        ],
      });
      setWebsiteResult(response.text || "Xatolik yuz berdi.");
    } catch (error) {
      console.error("Website AI error:", error);
      setWebsiteResult("AI bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setWebsiteLoading(false);
    }
  };

  const calculateLoan = () => {
    const monthlyRate = (loanRate / 100) / 12;
    const payment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
    return isFinite(payment) ? Math.round(payment) : 0;
  };

  const calculateTax = () => {
    if (taxType === 'simplified') return Math.round(taxRevenue * 0.04);
    if (taxType === 'fixed') return 1200000;
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

    const userMsg: Message = { role: 'user', text: "Menga batafsil biznes-reja yaratib bering." };
    setBizChat(prev => [...prev, userMsg]);
    
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: "Siz professional biznes maslahatchisiz. Berilgan ma'lumotlar asosida batafsil biznes-reja tuzing." }] },
          { role: 'user', parts: [{ text: prompt }] }
        ],
      });
      
      const text = response.text || "Reja yaratib bo'lmadi.";
      setBizChat(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Biz plan error:", error);
      setBizChat(prev => [...prev, { role: 'model', text: "Xatolik yuz berdi." }]);
    } finally {
      setBizLoading(false);
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">BUSINESS COPILOT</h1>
            <p className="text-slate-500 font-medium">Marketingni avtomatlashtirish platformasiga xush kelibsiz</p>
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
      case 'dashboard': return 'Boshqaruv Paneli';
      case 'content': return 'Kontent Markazi';
      case 'website': return 'Sayt Yaratish (AI)';
      case 'crm': return 'Lidlar Boshqaruvi';
      case 'influencers': return 'Influencerlar va Promokodlar';
      case 'analytics': return 'Kengaytirilgan Analitika';
      case 'business': return 'Biznes Boshlash (AI Maslahatchi)';
      default: return 'Platforma';
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
              <p className="text-sm font-bold text-slate-900">{user.displayName}</p>
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
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnalyticsCard title="Jami Lidlar" value={leads.length} change="+12.5%" icon={Users} />
                  <AnalyticsCard title="Konversiyalar" value={Math.round(leads.length * 0.2)} change="+5.2%" icon={CheckCircle} />
                  <AnalyticsCard title="Haftalik Daromad" value="12,450,000 so'm" change="+18.7%" icon={DollarSign} />
                  <AnalyticsCard title="AI Xabarlar" value="1,240" change="+24.1%" icon={MessageSquare} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Oxirgi Lidlar</h3>
                      <button onClick={() => setActiveTab('crm')} className="text-sm text-orange-500 font-semibold hover:underline">Hammasini ko'rish</button>
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
                          {leads.slice(0, 5).map(lead => (
                            <LeadRow key={lead.id} lead={lead} />
                          ))}
                          {leads.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                                Hozircha lidlar mavjud emas
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-bold text-slate-800">AI Kontent Rejasi</h3>
                    <div className="space-y-4">
                      <textarea 
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                        placeholder="Mavzu haqida yozing..."
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                      />
                      <button 
                        onClick={handleGeneratePlan}
                        disabled={loading}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {loading ? <Clock className="animate-spin" size={18} /> : <Plus size={18} />}
                        Reja Yaratish
                      </button>
                    </div>
                    {generatedPlan && (
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <p className="text-sm text-slate-700 italic leading-relaxed">{generatedPlan}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'crm' && (
              <motion.div 
                key="crm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95" onClick={() => setShowAddLeadModal(true)}>
                      <Plus size={18} />
                      Yangi Lid
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">Mijozlar Bazasi (CRM)</h3>
                      <p className="text-sm text-slate-500">Jami: {leads.length} ta lid</p>
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
                          .filter(l => 
                            (statusFilter === 'all' || l.status === statusFilter) &&
                            (l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm))
                          )
                          .map(lead => (
                          <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                  {lead.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{lead.name || "Noma'lum"}</div>
                                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">ID: #LID-{lead.id.substring(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-600 font-mono">{lead.phone}</td>
                            <td className="py-4 px-6 text-sm text-slate-500">
                              <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">{lead.source}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                lead.status === 'hot' ? "bg-orange-100 text-orange-600" : 
                                lead.status === 'appointment' ? "bg-green-100 text-green-600" : 
                                lead.status === 'warm' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                              )}>
                                {lead.status === 'hot' ? 'Issiq' : lead.status === 'warm' ? 'Iliq' : lead.status === 'appointment' ? 'Uchrashuv' : 'Sovuq'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Suhbat">
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
                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">
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

            {activeTab === 'influencers' && (
              <motion.div 
                key="influencers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Influencerlar va Hamkorlar</h3>
                    <p className="text-sm text-slate-500">Promokodlar orqali sotuvlarni kuzatish</p>
                  </div>
                  <button 
                    onClick={() => setShowAddInfluencerModal(true)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Yangi Hamkor
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {influencers.map(inf => (
                    <div key={inf.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:bg-orange-500/10" />
                      
                      <div className="flex justify-between items-start relative">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl">
                            {inf.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900">{inf.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Users size={12} />
                              {inf.followers} obunachi
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-orange-500 text-white rounded-lg font-mono font-black text-xs shadow-sm">
                          {inf.promoCode}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 relative">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Konversiyalar</p>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-500" />
                            <p className="text-xl font-black text-slate-900">{inf.conversions || 0}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Daromad</p>
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-green-500" />
                            <p className="text-xl font-black text-green-600">{(inf.revenue || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">
                        Batafsil tahlil
                      </button>
                    </div>
                  ))}
                  {influencers.length === 0 && (
                    <div className="col-span-full py-16 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Users size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-900 font-bold">Hamkorlar topilmadi</p>
                        <p className="text-slate-400 text-sm">Hali hech qanday influencer qo'shilmagan</p>
                      </div>
                      <button 
                        onClick={() => setShowAddInfluencerModal(true)}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                      >
                        Birinchisini qo'shish
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'content' && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                      <Plus size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Yangi Kontent Reja</h3>
                      <p className="text-sm text-slate-500">AI yordamida 1 haftalik marketing rejasini tuzing</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea 
                      className="w-full h-40 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-base outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
                      placeholder="Masalan: Yangi ochilgan milliy taomlar restorani uchun Instagram va Telegram postlari rejasi..."
                      value={contentInput}
                      onChange={(e) => setContentInput(e.target.value)}
                    />
                    <button 
                      onClick={handleGeneratePlan}
                      disabled={loading}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? <Clock className="animate-spin" size={24} /> : <TrendingUp size={24} />}
                      AI Rejani Generatsiya Qilish
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                    <Calendar size={20} className="text-orange-500" />
                    Mavjud Rejalar
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {contentPlans.map(plan => (
                      <div key={plan.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-black text-xl text-slate-900">{plan.title}</h4>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                plan.status === 'completed' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                              )}>
                                {plan.status === 'completed' ? 'Tayyor' : 'Kutilmoqda'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">{plan.rawText}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Yaratilgan sana</p>
                            <p className="text-sm font-bold text-slate-700">
                              {plan.createdAt?.toDate ? plan.createdAt.toDate().toLocaleDateString('uz-UZ') : 'Hozir'}
                            </p>
                          </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all">
                          {plan.generatedPlan}
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                          <button className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-lg transition-colors">Tahrirlash</button>
                          <button className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-100">Tasdiqlash</button>
                        </div>
                      </div>
                    ))}
                    {contentPlans.length === 0 && (
                      <div className="py-20 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <FileText size={40} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-900 font-black text-lg">Rejalar mavjud emas</p>
                          <p className="text-slate-400 font-medium">Marketing rejasini tuzish uchun yuqoridagi formadan foydalaning</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'website' && (
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
                            const blob = new Blob([websiteResult], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'sayt_konsepti.txt';
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
                          <p className="text-[10px] font-black text-slate-400 uppercase">Texnologiya</p>
                          <p className="text-sm font-bold text-slate-700">React + Tailwind</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                          <Layout size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Sahifalar</p>
                          <p className="text-sm font-bold text-slate-700">5-7 ta sahifa</p>
                        </div>
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">SEO</p>
                          <p className="text-sm font-bold text-slate-700">Optimallashgan</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'automation' && (
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
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                            <MessageSquare size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Telegram Bot</p>
                            <p className="text-xs text-slate-500">Avtomatik javob berish</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setAutomationSettings(s => ({...s, telegramBot: !s.telegramBot}))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            automationSettings.telegramBot ? "bg-orange-500" : "bg-slate-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            automationSettings.telegramBot ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                            <Share2 size={24} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Auto-Posting</p>
                            <p className="text-xs text-slate-500">Rejali postlar</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setAutomationSettings(s => ({...s, autoPosting: !s.autoPosting}))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            automationSettings.autoPosting ? "bg-orange-500" : "bg-slate-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            automationSettings.autoPosting ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-slate-700">Xush kelibsiz xabari</label>
                      <textarea 
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                        value={automationSettings.welcomeMessage}
                        onChange={(e) => setAutomationSettings(s => ({...s, welcomeMessage: e.target.value}))}
                      />
                      <button 
                        onClick={handleSaveAutomation}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                      >
                        {saveStatus === 'Saqlanmoqda...' ? <Clock className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                        {saveStatus || 'Sozlamalarni saqlash'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">Lidlar O'sishi</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Dush', leads: 40 },
                        { name: 'Sesh', leads: 30 },
                        { name: 'Chor', leads: 65 },
                        { name: 'Pay', leads: 45 },
                        { name: 'Jum', leads: 90 },
                        { name: 'Shan', leads: 70 },
                        { name: 'Yak', leads: 110 },
                      ]}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area type="monotone" dataKey="leads" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6">Daromad Dinamikasi</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'Yan', revenue: 4000000 },
                        { name: 'Fev', revenue: 3000000 },
                        { name: 'Mar', revenue: 5000000 },
                        { name: 'Apr', revenue: 4500000 },
                        { name: 'May', revenue: 9000000 },
                        { name: 'Iyun', revenue: 12000000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `${v/1000000}M`} />
                        <Tooltip 
                          formatter={(v: any) => `${v.toLocaleString()} so'm`}
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">ROI (O'rtacha)</p>
                    <h4 className="text-2xl font-bold text-slate-900">340%</h4>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">CAC (Mijoz jalb qilish narxi)</p>
                    <h4 className="text-2xl font-bold text-slate-900">12,500 so'm</h4>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium mb-1">LTV (Mijoz qiymati)</p>
                    <h4 className="text-2xl font-bold text-slate-900">4,500,000 so'm</h4>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'business' && (
              <motion.div 
                key="business"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* AI Advisor Chat */}
                  <div className="xl:col-span-2 flex flex-col h-[600px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 tracking-tight">AI Moliyaviy Maslahatchi</h3>
                        <p className="text-xs text-slate-500">Biznesingiz uchun aqlli yordamchi</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                      {bizChat.map((msg, idx) => (
                        <div key={idx} className={cn(
                          "flex",
                          msg.role === 'user' ? "justify-end" : "justify-start"
                        )}>
                          <div className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
                            msg.role === 'user' 
                              ? "bg-slate-900 text-white rounded-tr-none" 
                              : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                          )}>
                            {msg.text}
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

                    <div className="p-4 border-t border-slate-50 bg-white">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Savolingizni yozing (masalan: Biznes-reja qanday tuziladi?)..."
                          className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                          value={bizInput}
                          onChange={(e) => setBizInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleBizChat()}
                        />
                        <button 
                          onClick={() => handleBizChat()}
                          disabled={bizLoading}
                          className="p-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 active:scale-95 disabled:opacity-50"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tools Sidebar */}
                  <div className="space-y-6">
                    {/* Loan Calculator */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 text-orange-500">
                        <Calculator size={20} />
                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Kredit Kalkulyatori</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Summa (so'm)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Foiz (%)</label>
                            <input 
                              type="number" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                              value={loanRate}
                              onChange={(e) => setLoanRate(Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Muddat (oy)</label>
                            <input 
                              type="number" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                              value={loanTerm}
                              onChange={(e) => setLoanTerm(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                          <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mb-1">Oylik to'lov</p>
                          <p className="text-2xl font-black text-slate-900">{calculateLoan().toLocaleString()} so'm</p>
                        </div>
                      </div>
                    </div>

                    {/* Tax Calculator */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 text-blue-500">
                        <Landmark size={20} />
                        <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Soliq Hisob-kitobi</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Yillik tushum (so'm)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                            value={taxRevenue}
                            onChange={(e) => setTaxRevenue(Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Soliq turi</label>
                          <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                            value={taxType}
                            onChange={(e) => setTaxType(e.target.value)}
                          >
                            <option value="simplified">Aylanmadan soliq (4%)</option>
                            <option value="fixed">Qat'iy belgilangan soliq</option>
                            <option value="general">Umumbelgilangan (12% QQS + foyda)</option>
                          </select>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">Taxminiy soliq</p>
                          <p className="text-2xl font-black text-slate-900">{calculateTax().toLocaleString()} so'm</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setShowBizPlanForm(true)}
                        className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-800 transition-all group"
                      >
                        <Rocket size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Biznes-reja</span>
                      </button>
                      <button 
                        onClick={() => handleBizChat("Mening biznesim uchun bozor tahlilini qilib bering. O'zbekiston bozoridagi raqobatchilar va imkoniyatlarni qanday aniqlasam bo'ladi?")}
                        className="p-4 bg-white border border-slate-200 text-slate-900 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-all group"
                      >
                        <PieChart size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Bozor tahlili</span>
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
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Yangi Lid Qo'shish</h3>
                <button onClick={() => setShowAddLeadModal(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mijoz Ismi</label>
                  <input type="text" placeholder="Masalan: Aziz Rahimov" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefon Raqami</label>
                  <input type="tel" placeholder="+998 90 123 45 67" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Manba</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500">
                      <option>Instagram</option>
                      <option>Telegram</option>
                      <option>Facebook</option>
                      <option>Veb-sayt</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
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

        {showAddInfluencerModal && (
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
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all active:scale-95">
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
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Biznes-reja Ma'lumotlari</h3>
                </div>
                <button onClick={() => setShowBizPlanForm(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <Plus size={24} className="rotate-45 text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Soha (Yo'nalish)</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: Umumiy ovqatlanish" 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                      value={bizPlanForm.industry}
                      onChange={(e) => setBizPlanForm({...bizPlanForm, industry: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Biznes Turi</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500"
                      value={bizPlanForm.type}
                      onChange={(e) => setBizPlanForm({...bizPlanForm, type: e.target.value})}
                    >
                      <option value="an'anaviy">An'anaviy</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Resurslar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Pul (Kapital)</label>
                      <input 
                        type="text" 
                        placeholder="Masalan: 50 mln so'm" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.budget}
                        onChange={(e) => setBizPlanForm({...bizPlanForm, budget: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Jihozlar</label>
                      <input 
                        type="text" 
                        placeholder="Masalan: Kompyuter, mebel" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.equipment}
                        onChange={(e) => setBizPlanForm({...bizPlanForm, equipment: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Jamoa</label>
                      <input 
                        type="text" 
                        placeholder="Masalan: 3 kishi" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.team}
                        onChange={(e) => setBizPlanForm({...bizPlanForm, team: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Hudud</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Mamlakat</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.country}
                        onChange={(e) => setBizPlanForm({...bizPlanForm, country: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Viloyat</label>
                      <input 
                        type="text" 
                        placeholder="Masalan: Toshkent" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.region}
                        onChange={(e) => setBizPlanForm({...bizPlanForm, region: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Tuman</label>
                      <input 
                        type="text" 
                        placeholder="Masalan: Chilonzor" 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        value={bizPlanForm.district}
                        onChange={(e) => setBizPlanForm({...bizPlanForm, district: e.target.value})}
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

