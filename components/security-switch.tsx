"use client";

import { cn } from "@/lib/utils";

interface SecuritySwitchProps {
  id: number;
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SecuritySwitch({
  id,
  isOn,
  onToggle,
  disabled = false,
  size = "md",
}: SecuritySwitchProps) {
  const sizeStyles = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-18 h-18",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "relative rounded-2xl flex items-center justify-center",
          "transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          "border-2 backdrop-blur-md",
          sizeStyles[size],
          isOn
            ? [
                "bg-neon-green/10 border-neon-green/40",
                "shadow-[0_0_40px_rgba(0,255,136,0.25),inset_0_0_20px_rgba(0,255,136,0.1)]",
                "ring-4 ring-neon-green/5",
              ]
            : [
                "bg-neon-red/10 border-neon-red/40",
                "shadow-[0_0_40px_rgba(255,88,88,0.25),inset_0_0_20px_rgba(255,88,88,0.1)]",
                "ring-4 ring-neon-red/5",
              ],
          !disabled && "hover:scale-105 hover:-translate-y-1 active:scale-95 cursor-pointer",
          disabled && "opacity-40 cursor-not-allowed"
        )}
        aria-label={`Switch ${id}: ${isOn ? "ON" : "OFF"}`}
      >
        {/* Glow Layer */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl opacity-40 blur-xl transition-all duration-700",
            isOn ? "bg-neon-green/20" : "bg-neon-red/20"
          )}
        />

        {/* Inner switch body */}
        <div
          className={cn(
            "relative w-4/5 h-4/5 rounded-xl flex items-center justify-center",
            "transition-all duration-500",
            "border border-white/5 shadow-inner",
            isOn
              ? "bg-gradient-to-br from-neon-green/30 to-neon-green/10"
              : "bg-gradient-to-br from-neon-red/30 to-neon-red/10"
          )}
        >
          {/* LED Indicator */}
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              "transition-all duration-500",
              isOn
                ? "bg-neon-green shadow-[0_0_15px_rgba(0,255,136,1)] scale-110"
                : "bg-neon-red shadow-[0_0_15px_rgba(255,88,88,1)]"
            )}
          />
          
          {/* Subtle reflection */}
          <div className="absolute top-1 left-1 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-xl" />
        </div>
      </button>

      {/* Label */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "text-xs font-bold tracking-[0.2em] uppercase transition-all duration-500",
            isOn ? "text-neon-green drop-shadow-[0_0_8px_rgba(0,255,136,0.4)]" : "text-neon-red/70"
          )}
        >
          S{id}
        </span>
      </div>
    </div>
  );
}
