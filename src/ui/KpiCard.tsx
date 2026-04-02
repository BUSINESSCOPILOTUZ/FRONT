import React from "react";
import { cn } from "../lib/utils";
import { formatNumber } from "../lib/format";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

export function KpiCard({ label, value, icon: Icon, colorClass }: KpiCardProps) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("inline-flex p-2.5 rounded-xl border mb-3", colorClass)}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}
