import { lazy } from "react";

export const DashboardPage = lazy(() => import("./DashboardPage"));
export const CrmPage = lazy(() => import("./CrmPage"));
export const InfluencersPage = lazy(() => import("./InfluencersPage"));
export const ContentPage = lazy(() => import("./ContentPage"));
export const WebsitePage = lazy(() => import("./WebsitePage"));
export const AutomationPage = lazy(() => import("./AutomationPage"));
export const AnalyticsPage = lazy(() => import("./AnalyticsPage"));
export const BusinessPage = lazy(() => import("./BusinessPage"));
export const AdsPage = lazy(() => import("../features/ads/AdsPage"));
export const SalesBotPage = lazy(() => import("../features/salesbot/SalesBotPage"));
