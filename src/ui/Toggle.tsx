import { cn } from "../lib/utils";

interface ToggleProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ enabled, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      className={cn(
        "relative w-12 h-7 rounded-full transition-colors duration-200",
        enabled ? "bg-orange-500" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
          enabled ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}
