"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  glowColor: "green" | "blue" | "red";
  onClick: () => void;
}

export function ModeCard({
  title,
  description,
  icon,
  glowColor,
  onClick,
}: ModeCardProps) {
  const iconColor = {
    green: "text-neon-green",
    blue: "text-neon-blue",
    red: "text-neon-red",
  };

  const iconGlow = {
    green: "drop-shadow-[0_0_10px_rgba(0,255,136,0.6)]",
    blue: "drop-shadow-[0_0_10px_rgba(88,166,255,0.6)]",
    red: "drop-shadow-[0_0_10px_rgba(255,88,88,0.6)]",
  };

  return (
    <GlassCard
      interactive
      glowColor={glowColor}
      onClick={onClick}
      className="p-5 flex flex-col items-center text-center gap-3"
    >
      {/* Icon container */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          "bg-secondary/50 border border-glass-border",
          "transition-transform duration-300 group-hover:scale-110"
        )}
      >
        <div className={cn("w-6 h-6", iconColor[glowColor], iconGlow[glowColor])}>
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-base font-semibold tracking-wide",
          iconColor[glowColor],
          iconGlow[glowColor]
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>

      {/* Enter indicator */}
      <div
        className={cn(
          "mt-auto pt-2 flex items-center gap-1.5 text-[10px] font-mono",
          iconColor[glowColor],
          "opacity-50 group-hover:opacity-100 transition-opacity"
        )}
      >
        <span>ENTER</span>
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </div>
    </GlassCard>
  );
}
