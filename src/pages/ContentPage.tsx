import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Send,
  Loader2,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Hash,
} from "lucide-react";
import { cn } from "../components/CoreComponents";
import { Timestamp } from "firebase/firestore";

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

interface ContentPageProps {
  contentPlans: ContentPlan[];
  contentInput: string;
  setContentInput: (v: string) => void;
  expandedPlanId: string | null;
  setExpandedPlanId: (v: string | null) => void;
  telegramChannelId: string;
  setTelegramChannelId: (v: string) => void;
  approvingPlanId: string | null;
  loading: boolean;
  handleGeneratePlan: () => void;
  handleApprovePlan: (planId: string) => void;
  handleUpdatePostSchedule: (planId: string, postIdx: number, field: string, value: string) => void;
}

export default function ContentPage({
  contentPlans,
  contentInput,
  setContentInput,
  expandedPlanId,
  setExpandedPlanId,
  telegramChannelId,
  setTelegramChannelId,
  approvingPlanId,
  loading,
  handleGeneratePlan,
  handleApprovePlan,
  handleUpdatePostSchedule,
}: ContentPageProps) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* HERO / INPUT SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-orange-50/50 p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-orange-400/10 to-amber-300/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-violet-400/5 to-blue-300/5 blur-2xl" />
        <div className="relative space-y-8">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/10">
              <Sparkles size={26} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Yangi Kontent Reja</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">AI yordamida 1 haftalik professional marketing rejasini bir necha soniyada tuzing</p>
            </div>
          </div>
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
                <span className={cn("text-xs font-medium tabular-nums transition-colors", contentInput.length > 450 ? "text-orange-500" : "text-slate-300")}>{contentInput.length}/500</span>
              </div>
            </div>
            <p className="flex items-center gap-1.5 pl-1 text-xs text-slate-400"><Sparkles size={12} className="text-orange-400" />Soha, maqsadli auditoriya va platformalarni aniq yozing — AI yanada sifatli reja tuzadi</p>
            <button
              onClick={handleGeneratePlan}
              disabled={loading || !contentInput.trim()}
              className={cn("group/btn relative w-full overflow-hidden rounded-2xl py-4.5 px-8 text-lg font-black text-white transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40", "bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20", "hover:shadow-xl hover:shadow-orange-500/25 hover:brightness-105")}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={22} /> : <Sparkles size={22} className="transition-transform duration-200 group-hover/btn:rotate-12" />}
                {loading ? "Reja yaratilmoqda..." : "AI Rejani Generatsiya Qilish"}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      {contentPlans.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600"><FileText size={14} />Jami: {contentPlans.length}</span>
          {contentPlans.filter((p) => p.status === "completed").length > 0 && <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600"><CheckCircle size={13} />Tayyor: {contentPlans.filter((p) => p.status === "completed").length}</span>}
          {contentPlans.filter((p) => p.status === "approved").length > 0 && <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600"><Calendar size={13} />Rejalashtirilgan: {contentPlans.filter((p) => p.status === "approved").length}</span>}
          {contentPlans.filter((p) => p.status === "pending").length > 0 && <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-500"><Clock size={13} />Kutilmoqda: {contentPlans.filter((p) => p.status === "pending").length}</span>}
        </div>
      )}

      {/* CONTENT PLANS LIST */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400"><Calendar size={16} />Mavjud Rejalar</h3>
        </div>
        <div className="grid grid-cols-1 gap-5">
          {contentPlans.map((plan) => (
            <motion.div key={plan.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-slate-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className={cn("absolute left-0 top-0 h-full w-1 transition-all", plan.status === "completed" ? "bg-emerald-500" : plan.status === "approved" ? "bg-blue-500" : plan.status === "rejected" ? "bg-red-400" : "bg-orange-400")} />
              <div className="p-6 pl-8 md:p-8 md:pl-10">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="truncate text-lg font-extrabold text-slate-900">{plan.title}</h4>
                      <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide", plan.status === "completed" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10" : plan.status === "approved" ? "bg-blue-50 text-blue-600 ring-1 ring-blue-500/10" : plan.status === "rejected" ? "bg-red-50 text-red-500 ring-1 ring-red-500/10" : "bg-orange-50 text-orange-600 ring-1 ring-orange-500/10")}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: plan.status === "completed" ? "#10b981" : plan.status === "approved" ? "#3b82f6" : plan.status === "rejected" ? "#ef4444" : "#f97316" }} />
                        {plan.status === "completed" ? "Tayyor" : plan.status === "approved" ? "Rejalashtirilgan" : plan.status === "rejected" ? "Rad etilgan" : "Kutilmoqda"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-500">{plan.rawText}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                      {plan.scheduledPosts && plan.scheduledPosts.length > 0 && <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><FileText size={13} />{plan.scheduledPosts.length} ta post</span>}
                      {plan.telegramChannelId && <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-500"><Send size={13} />{plan.telegramChannelId}</span>}
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><Calendar size={13} />{plan.createdAt?.toDate ? plan.createdAt.toDate().toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "Hozir"}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100">
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" title="Tahrirlash"><Pencil size={15} /></button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" title="Nusxa olish"><Copy size={15} /></button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" title="O'chirish"><Trash2 size={15} /></button>
                  </div>
                </div>

                {plan.scheduledPosts && plan.scheduledPosts.length > 0 ? (
                  <div className="mt-6 space-y-3">
                    <button onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)} className="flex w-full items-center justify-between rounded-xl bg-slate-50/80 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-slate-100/80">
                      <span className="flex items-center gap-2.5 text-sm font-bold text-slate-700"><FileText size={15} className="text-slate-400" />{plan.scheduledPosts.length} ta post rejasi</span>
                      {expandedPlanId === plan.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    <AnimatePresence>
                      {expandedPlanId === plan.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                          <div className="space-y-3 pt-2">
                            {plan.scheduledPosts.map((post, idx) => (
                              <div key={idx} className={cn("rounded-xl border p-5 transition-all duration-150", post.status === "sent" ? "border-emerald-200/70 bg-emerald-50/50" : post.status === "scheduled" ? "border-blue-200/70 bg-blue-50/50" : post.status === "failed" ? "border-red-200/70 bg-red-50/50" : "border-slate-200/70 bg-slate-50/50")}>
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">{idx + 1}</div>
                                    <div>
                                      <h5 className="font-bold text-slate-900">{post.title}</h5>
                                      <p className="text-xs text-slate-500">{post.day}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {plan.status === "pending" ? (
                                      <>
                                        <input type="date" value={post.date} onChange={(e) => handleUpdatePostSchedule(plan.id, idx, "date", e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
                                        <input type="time" value={post.time} onChange={(e) => handleUpdatePostSchedule(plan.id, idx, "time", e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition-all focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
                                      </>
                                    ) : (
                                      <>
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"><Calendar size={11} className="text-slate-400" />{post.date}</span>
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600"><Clock size={11} className="text-slate-400" />{post.time}</span>
                                      </>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">{post.type}</span>
                                    <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold", post.status === "sent" ? "bg-emerald-100 text-emerald-700" : post.status === "scheduled" ? "bg-blue-100 text-blue-700" : post.status === "failed" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600")}>
                                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: post.status === "sent" ? "#10b981" : post.status === "scheduled" ? "#3b82f6" : post.status === "failed" ? "#ef4444" : "#94a3b8" }} />
                                      {post.status === "sent" ? "Yuborildi" : post.status === "scheduled" ? "Rejalashtirilgan" : post.status === "failed" ? "Xato" : "Kutmoqda"}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3 rounded-lg border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{post.content}</div>
                                {post.hashtags && post.hashtags.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {post.hashtags.map((tag, i) => <span key={i} className="inline-flex items-center gap-1 rounded-md bg-blue-50/80 px-2 py-0.5 text-xs font-medium text-blue-600"><Hash size={10} />{tag.replace(/^#/, "")}</span>)}
                                  </div>
                                )}
                                {post.sentAt && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600"><CheckCircle size={12} />Yuborilgan: {new Date(post.sentAt).toLocaleString("uz-UZ")}</p>}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/60 p-5 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap transition-all duration-200 group-hover:border-orange-100/60 group-hover:bg-orange-50/20">{plan.generatedPlan}</div>
                )}

                <div className="mt-6">
                  {plan.status === "pending" && (
                    <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/40 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input type="text" placeholder="Telegram kanal ID (masalan: @kanal_nomi yoki -100xxx)" value={telegramChannelId} onChange={(e) => setTelegramChannelId(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-150 placeholder:text-slate-300 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]" />
                        <button onClick={() => handleApprovePlan(plan.id)} disabled={approvingPlanId === plan.id} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50">
                          {approvingPlanId === plan.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                          Tasdiqlash va Rejalashtirish
                        </button>
                      </div>
                      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-400"><Sparkles size={12} className="mt-0.5 shrink-0 text-orange-400" />Botni kanalga admin qilib qo'shing va kanal ID sini kiriting. Tasdiqlangandan so'ng postlar avtomatik chiqariladi.</p>
                    </div>
                  )}
                  {plan.status === "approved" && (
                    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <Calendar size={16} className="mt-0.5 shrink-0 text-blue-500" />
                      <div>
                        <p className="text-sm font-bold text-blue-700">Reja tasdiqlangan — postlar belgilangan vaqtda avtomatik yuboriladi</p>
                        <p className="mt-1 text-xs text-blue-500">Yuborilgan: {plan.scheduledPosts.filter((p) => p.status === "sent").length}/{plan.scheduledPosts.length} ta post</p>
                      </div>
                    </div>
                  )}
                  {plan.status === "completed" && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <CheckCircle size={16} className="shrink-0 text-emerald-500" />
                      <p className="text-sm font-bold text-emerald-700">Barcha postlar muvaffaqiyatli yuborildi!</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {contentPlans.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200/80 bg-white/50 py-20 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"><FileText size={36} strokeWidth={1.5} /></div>
              <p className="text-lg font-extrabold text-slate-800">Rejalar hali mavjud emas</p>
              <p className="mt-1.5 max-w-xs text-sm text-slate-400">Marketing rejasini tuzish uchun yuqoridagi formadan foydalaning — AI bir necha soniyada tayyor qiladi</p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95"><Plus size={16} />Birinchi rejani yaratish</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
