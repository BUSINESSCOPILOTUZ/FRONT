// ─── Number Formatting Utilities ──────────────────────

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("uz-UZ").format(value).replace(/\s/g, ",");
};

export const formatCompact = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000)
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " mlrd";
  if (Math.abs(value) >= 1_000_000)
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + " mln";
  if (Math.abs(value) >= 1_000)
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + " ming";
  return value.toString();
};

export const formatCurrency = (value: number, compact = false): string => {
  if (compact && Math.abs(value) >= 1_000_000) {
    return `${formatCompact(value)} so'm`;
  }
  return `${formatNumber(value)} so'm`;
};

export const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "short",
  });
