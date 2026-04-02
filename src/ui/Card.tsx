import React from "react";
import { cn } from "../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export function Card({ className, noPadding, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow",
        !noPadding && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Glassmorphism card for premium feel */
export function GlassCard({ className, noPadding, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow",
        !noPadding && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Section header inside a card */
export function CardHeader({
  icon,
  iconBg = "bg-slate-50",
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl", iconBg)}>{icon}</div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
