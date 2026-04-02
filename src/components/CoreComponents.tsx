import { LayoutDashboard, FileText, Users, Share2, TrendingUp, UserCheck, Settings, LogOut, MessageSquare, BarChart3, Rocket, Calculator, PieChart, Landmark, Globe, Megaphone, Zap, Bot } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Utility for Tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Boshqaruv Paneli' },
  { id: 'business', path: '/business', icon: Rocket, label: 'Biznes Boshlash' },
  { id: 'ads', path: '/ads', icon: Megaphone, label: 'Reklama (AI)' },
  { id: 'content', path: '/content', icon: FileText, label: 'Kontent Markazi' },
  { id: 'automation', path: '/automation', icon: Zap, label: 'Avtomatizatsiya' },
  { id: 'influencers', path: '/influencers', icon: UserCheck, label: 'Influencerlar' },
  { id: 'website', path: '/website', icon: Globe, label: 'Sayt Yaratish' },
  { id: 'salesbot', path: '/salesbot', icon: Bot, label: 'Sotuvchi Robot' },
  { id: 'crm', path: '/crm', icon: Users, label: 'Lidlar (CRM)' },
  { id: 'analytics', path: '/analytics', icon: TrendingUp, label: 'Analitika' },
];

export const headerTitles: Record<string, string> = {
  '/': 'Boshqaruv Paneli',
  '/business': 'Biznes Boshlash (AI Maslahatchi)',
  '/ads': 'Reklama Avtomatizatsiyasi (AI)',
  '/content': 'Kontent Markazi',
  '/automation': 'Avtomatizatsiya Sozlamalari',
  '/influencers': 'Influencerlar va Promokodlar',
  '/website': 'Sayt Yaratish (AI)',
  '/salesbot': 'Sotuvchi Robot (AI)',
  '/crm': 'Lidlar Boshqaruvi',
  '/analytics': 'Kengaytirilgan Analitika',
};

/**
 * Sidebar Component (BEM Style + Tailwind)
 */
export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar w-64 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
      <div className="sidebar__logo p-6 border-bottom border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-orange-500 italic">BUSINESS COPILOT</h1>
      </div>
      
      <nav className="sidebar__nav flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          return (
            <div 
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "sidebar__item flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200",
                isActive ? "sidebar__item--active bg-orange-500 text-white" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar__footer p-6 border-t border-slate-800 space-y-4">
        <div className="sidebar__item flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white cursor-pointer">
          <Settings size={20} />
          <span className="text-sm">Sozlamalar</span>
        </div>
        <div className="sidebar__item flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 cursor-pointer">
          <LogOut size={20} />
          <span className="text-sm">Chiqish</span>
        </div>
      </div>
    </aside>
  );
};

/**
 * AnalyticsCard Component
 */
export const AnalyticsCard = ({ title, value, change, icon: Icon }: any) => {
  const isPositive = change.startsWith('+');

  return (
    <div className="analytics-card p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="analytics-card__header flex justify-between items-start mb-4">
        <div className="analytics-card__icon-wrapper p-3 bg-slate-50 rounded-xl text-slate-600">
          <Icon size={24} />
        </div>
        <span className={cn(
          "analytics-card__badge text-xs font-semibold px-2 py-1 rounded-full",
          isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {change}
        </span>
      </div>
      <div className="analytics-card__body">
        <p className="analytics-card__title text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="analytics-card__value text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
};

/**
 * LeadRow Component
 */
export const LeadRow = ({ lead }: any) => {
  const statusColors: any = {
    hot: "bg-orange-100 text-orange-600",
    warm: "bg-blue-100 text-blue-600",
    cold: "bg-slate-100 text-slate-600",
    appointment: "bg-green-100 text-green-600"
  };

  const statusLabels: any = {
    hot: "Issiq",
    warm: "Iliq",
    cold: "Sovuq",
    appointment: "Uchrashuv"
  };

  return (
    <tr className="lead-row border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="lead-row__cell py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            {lead.name.charAt(0)}
          </div>
          <span className="font-medium text-slate-900">{lead.name}</span>
        </div>
      </td>
      <td className="lead-row__cell py-4 px-4 text-sm text-slate-600">{lead.phone}</td>
      <td className="lead-row__cell py-4 px-4 text-sm text-slate-500 italic">{lead.source}</td>
      <td className="lead-row__cell py-4 px-4">
        <span className={cn(
          "lead-row__status px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
          statusColors[lead.status]
        )}>
          {statusLabels[lead.status]}
        </span>
      </td>
      <td className="lead-row__cell py-4 px-4 text-right">
        <button className="lead-row__action text-orange-500 hover:text-orange-600 font-semibold text-sm">
          Bog'lanish
        </button>
      </td>
    </tr>
  );
};
