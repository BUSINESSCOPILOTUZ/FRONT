import React from "react";
import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-orange-500 text-white shadow-lg shadow-orange-100 hover:bg-orange-600 active:scale-[0.98]",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200",
  ghost:
    "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
  danger:
    "bg-red-50 text-red-500 hover:bg-red-100",
  dark:
    "bg-slate-900 text-white hover:bg-slate-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-sm rounded-xl gap-2",
  xl: "px-8 py-4 text-lg rounded-2xl gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={size === "sm" ? 12 : 14} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
