import { formatNumber, formatCurrency } from "../lib/format";

export function FormattedNumber({
  value,
  currency,
  compact,
  className,
}: {
  value: number;
  currency?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const display = currency ? formatCurrency(value, compact) : formatNumber(value);
  const tooltip =
    currency && compact && Math.abs(value) >= 1_000_000
      ? formatCurrency(value, false)
      : undefined;
  return (
    <span className={className} title={tooltip}>
      {display}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "slate",
}: {
  label: string;
  value: number;
  icon?: React.ElementType;
  color?: "orange" | "green" | "red" | "blue" | "slate";
}) {
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
      <p className="text-[10px] text-slate-400 mt-0.5 tabular-nums">{formatNumber(value)} so'm</p>
    </div>
  );
}
