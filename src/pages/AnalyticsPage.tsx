import { motion } from "motion/react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  return (
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
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
              <Area type="monotone" dataKey="leads" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6">Daromad Dinamikasi</h3>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip
                formatter={(v: number) => `${v.toLocaleString()} so'm`}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
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
  );
}
