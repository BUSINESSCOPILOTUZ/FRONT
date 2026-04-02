// ─── Shared Types ─────────────────────────────────────
// Used by both frontend features and API services

import type { Timestamp } from "firebase/firestore";

// ─── Auth ─────────────────────────────────────────────
export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL: string;
  role?: string;
  phoneVerified?: boolean;
}

// ─── Leads / CRM ─────────────────────────────────────
export type LeadStatus = "cold" | "warm" | "hot" | "appointment";
export type LeadSource = "Instagram" | "Telegram" | "Facebook" | "Website" | "Referral" | "Other";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  source: string;
  createdAt?: Timestamp;
}

// ─── Analytics ────────────────────────────────────────
export interface AnalyticsSummary {
  leads: number;
  conversions: number;
  revenue: string;
}

// ─── Content Planning ─────────────────────────────────
export type PostStatus = "pending" | "scheduled" | "sent" | "failed";
export type PlanStatus = "pending" | "approved" | "completed" | "rejected";

export interface ScheduledPost {
  day: string;
  date: string;
  time: string;
  title: string;
  type: string;
  content: string;
  hashtags: string[];
  status: PostStatus;
  sentAt?: string;
}

export interface ContentPlan {
  id: string;
  title: string;
  rawText: string;
  generatedPlan: string;
  scheduledPosts: ScheduledPost[];
  telegramChannelId?: string;
  status: PlanStatus;
  createdAt: Timestamp;
}

// ─── Chat / AI ────────────────────────────────────────
export interface Message {
  role: "user" | "model";
  text: string;
}

// ─── Ads ──────────────────────────────────────────────
export type AdsPlatform = "tg" | "instagram";
export type TgAdsLang = "uz" | "en" | "ru";

export interface AdsResult {
  creative: string;
  hooks: string[];
  ctas: string[];
  textVariants?: string[];
  metaTexts?: MetaTexts;
}

export interface MetaTexts {
  headline: string;
  primary: string;
  cta: string;
}

export interface MetaImage {
  url: string | null;
  ratio: string;
  label: string;
}

// ─── Sales Bot ────────────────────────────────────────
export interface BotInfo {
  id?: number;
  username?: string;
  first_name?: string;
  is_bot?: boolean;
}

export interface BotSettings {
  botToken: string;
  botUsername: string;
  isConnected: boolean;
  systemPrompt: string;
  retargetEnabled: boolean;
  retargetDays: number;
  retargetMessage: string;
  loyaltyEnabled: boolean;
  loyaltyDiscountPercent: number;
  loyaltyMessage: string;
  webhookUrl?: string;
}

export interface KnowledgeChunk {
  _id: string;
  userId: string;
  source: "file" | "text";
  fileName: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  createdAt: string;
}

export interface BotAnalytics {
  totalInteractions: number;
  uniqueCustomers: number;
  retargets: number;
  conversionRate: number;
  activity: ActivityEntry[];
}

export interface ActivityEntry {
  day: string;
  date: string;
  count: number;
}

export type InteractionType = "message" | "faq" | "purchase" | "retarget" | "loyalty" | "error";

export interface BotLog {
  _id: string;
  type: InteractionType;
  username: string;
  userMessage: string;
  botResponse: string;
  chatId: number;
  createdAt: string;
}

// ─── Business Plan ────────────────────────────────────
export interface BizPlanForm {
  industry: string;
  budget: string;
  equipment: string;
  team: string;
  country: string;
  region: string;
  district: string;
  type: string;
}

// ─── Automation ───────────────────────────────────────
export interface AutomationSettings {
  telegramBot: boolean;
  autoPosting: boolean;
  aiReply: boolean;
  welcomeMessage: string;
}

// ─── Dashboard ────────────────────────────────────────
export type DateRange = "7" | "30" | "90";
export type PlatformFilter = "all" | "instagram" | "telegram" | "google";

// ─── API Response ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data: T;
}
