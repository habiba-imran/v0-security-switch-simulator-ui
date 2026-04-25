"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface TopBarProps {
  title: string;
  onBack: () => void;
  switchCount: number;
  onSwitchCountChange: (count: number) => void;
  onStart: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export function TopBar({
  title,
  onBack,
  switchCount,
  onSwitchCountChange,
  onStart,
  onReset,
  isRunning,
}: TopBarProps) {
  return (
    <GlassCard className="p-4" glowColor="blue">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Back button and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={cn(
              "p-2 rounded-xl border border-glass-border bg-secondary/50",
              "transition-all duration-200",
              "hover:bg-secondary hover:border-neon-blue/50 hover:shadow-[0_0_15px_rgba(88,166,255,0.2)]",
              "active:scale-95"
            )}
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          <h1 className="text-lg font-bold tracking-wide text-neon-blue drop-shadow-[0_0_10px_rgba(88,166,255,0.5)]">
            {title}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Switch count input */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="switch-count"
              className="text-xs font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap"
            >
              Switches (n ≤ 10)
            </label>
            <input
              id="switch-count"
              type="number"
              min={1}
              max={10}
              value={switchCount}
              onChange={(e) =>
                onSwitchCountChange(
                  Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              disabled={isRunning}
              className={cn(
                "w-16 px-3 py-2 rounded-xl bg-secondary/50 border border-glass-border",
                "text-center font-mono text-sm",
                "focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(88,166,255,0.2)]",
                "transition-all duration-200",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            />
          </div>

          {/* Start/Reset buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onStart}
              disabled={isRunning}
              className={cn(
                "px-4 py-2 rounded-xl font-mono text-sm font-bold uppercase tracking-wider",
                "bg-neon-green/20 border border-neon-green/50 text-neon-green",
                "transition-all duration-200",
                "hover:bg-neon-green/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]",
                "active:scale-95",
                isRunning && "opacity-50 cursor-not-allowed"
              )}
            >
              Start
            </button>
            <button
              onClick={onReset}
              className={cn(
                "px-4 py-2 rounded-xl font-mono text-sm font-bold uppercase tracking-wider",
                "bg-neon-red/20 border border-neon-red/50 text-neon-red",
                "transition-all duration-200",
                "hover:bg-neon-red/30 hover:shadow-[0_0_20px_rgba(255,88,88,0.3)]",
                "active:scale-95"
              )}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
