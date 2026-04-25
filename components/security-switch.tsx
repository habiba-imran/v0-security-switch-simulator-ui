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
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const innerSizeStyles = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative rounded-full flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "border-2 backdrop-blur-sm",
        sizeStyles[size],
        isOn
          ? [
              "bg-neon-green/10 border-neon-green/60",
              "shadow-[0_0_25px_rgba(0,255,136,0.4),inset_0_0_20px_rgba(0,255,136,0.1)]",
            ]
          : [
              "bg-neon-red/10 border-neon-red/60",
              "shadow-[0_0_25px_rgba(255,88,88,0.4),inset_0_0_20px_rgba(255,88,88,0.1)]",
            ],
        !disabled && "hover:scale-110 active:scale-95 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-label={`Switch ${id}: ${isOn ? "ON" : "OFF"}`}
    >
      {/* Outer ring animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          "animate-pulse",
          isOn ? "bg-neon-green/5" : "bg-neon-red/5"
        )}
      />

      {/* Inner circle */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "transition-all duration-300",
          innerSizeStyles[size],
          isOn
            ? "bg-neon-green/30 shadow-[0_0_15px_rgba(0,255,136,0.5)]"
            : "bg-neon-red/30 shadow-[0_0_15px_rgba(255,88,88,0.5)]"
        )}
      >
        {/* Status indicator */}
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            "transition-all duration-300",
            isOn
              ? "bg-neon-green shadow-[0_0_10px_rgba(0,255,136,0.8)]"
              : "bg-neon-red shadow-[0_0_10px_rgba(255,88,88,0.8)]"
          )}
        />
      </div>

      {/* Switch ID label */}
      <span
        className={cn(
          "absolute -bottom-6 left-1/2 -translate-x-1/2",
          "text-xs font-mono tracking-wider",
          isOn ? "text-neon-green" : "text-neon-red"
        )}
      >
        S{id}
      </span>
    </button>
  );
}
