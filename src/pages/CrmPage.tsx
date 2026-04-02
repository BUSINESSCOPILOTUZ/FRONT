import { motion } from "motion/react";
import {
  Search,
  Filter,
  Plus,
  Download,
  MessageSquare,
  MoreVertical,
} from "lucide-react";
import { cn } from "../components/CoreComponents";

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  createdAt?: any;
}

interface CrmPageProps {
  leads: Lead[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  setShowAddLeadModal: (v: boolean) => void;
}

export default function CrmPage({
  leads,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  setShowAddLeadModal,
}: CrmPageProps) {
  return (
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
                .filter(
                  (l) =>
                    (statusFilter === "all" || l.status === statusFilter) &&
                    (l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      l.phone.includes(searchTerm))
                )
                .map((lead) => (
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
                        lead.status === "hot" ? "bg-orange-100 text-orange-600"
                          : lead.status === "appointment" ? "bg-green-100 text-green-600"
                          : lead.status === "warm" ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {lead.status === "hot" ? "Issiq" : lead.status === "warm" ? "Iliq" : lead.status === "appointment" ? "Uchrashuv" : "Sovuq"}
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
