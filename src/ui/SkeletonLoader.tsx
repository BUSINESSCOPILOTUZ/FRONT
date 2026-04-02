import { cn } from "../lib/utils";

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 bg-slate-200 rounded-lg animate-pulse",
        className,
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 p-6 space-y-4 animate-pulse", className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-1/3 bg-slate-200 rounded-lg" />
          <div className="h-3 w-1/2 bg-slate-100 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded-lg w-full" />
        <div className="h-3 bg-slate-100 rounded-lg w-4/5" />
        <div className="h-3 bg-slate-100 rounded-lg w-3/5" />
      </div>
    </div>
  );
}

/** Inline loader for images / charts */
export function SkeletonLoader({
  className,
  aspectRatio,
}: {
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <div
      className={cn(
        "bg-slate-100 rounded-xl animate-pulse flex items-center justify-center",
        className,
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <div className="w-8 h-8 border-2 border-slate-300 border-t-orange-400 rounded-full animate-spin" />
    </div>
  );
}
