"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "green" | "blue" | "red";
  onClick?: () => void;
  interactive?: boolean;
}

export function GlassCard({
  children,
  className,
  glowColor = "green",
  onClick,
  interactive = false,
}: GlassCardProps) {
  const glowStyles = {
    green: "hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] hover:border-neon-green/50",
    blue: "hover:shadow-[0_0_30px_rgba(88,166,255,0.3)] hover:border-neon-blue/50",
    red: "hover:shadow-[0_0_30px_rgba(255,88,88,0.3)] hover:border-neon-red/50",
  };

  const activeGlow = {
    green: "shadow-[0_0_20px_rgba(0,255,136,0.2)]",
    blue: "shadow-[0_0_20px_rgba(88,166,255,0.2)]",
    red: "shadow-[0_0_20px_rgba(255,88,88,0.2)]",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border border-glass-border bg-glass backdrop-blur-xl",
        "transition-all duration-300 ease-out",
        activeGlow[glowColor],
        interactive && [
          "cursor-pointer",
          glowStyles[glowColor],
          "hover:scale-[1.02] hover:-translate-y-1",
          "active:scale-[0.98]",
        ],
        className
      )}
    >
      {children}
    </div>
  );
}
