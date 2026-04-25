"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface TopBarProps {
  title: string;
  info: string;
  onBack: () => void;
  switchCount: number;
  onSwitchCountChange: (count: number) => void;
  onStart: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export function TopBar({
  title,
  info,
  onBack,
  switchCount,
  onSwitchCountChange,
  onStart,
  onReset,
  isRunning,
}: TopBarProps) {
  return (
    <GlassCard className="p-5 border-white/5 shadow-lg" glowColor="blue">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Back button and title */}
        <div className="flex items-center gap-8 flex-1">
          <button
            onClick={onBack}
            className={cn(
              "p-2.5 rounded-xl border border-white/10 bg-white/5 shrink-0",
              "transition-all duration-300",
              "hover:bg-white/10 hover:border-white/20 hover:scale-105",
              "active:scale-95"
            )}
            aria-label="Go back"
          >
            <svg
              className="w-4 h-4 text-white/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>

          <div className="flex items-center gap-8 flex-1 min-w-0">
            <div className="flex flex-col shrink-0">
              <h1 className="text-sm font-black tracking-tighter text-white/40 uppercase">
                {title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-4 h-0.5 bg-neon-blue/40 rounded-full" />
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  Mission Ops
                </span>
              </div>
            </div>

            <div className="w-px h-10 bg-white/5 shrink-0" />

            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1 block">Operation Protocol</span>
              <p className="text-[11px] text-white/60 leading-relaxed line-clamp-2 italic">
                {info}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          {/* Switch count input */}
          <div className="flex items-center gap-4 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5">
            <label
              htmlFor="switch-count"
              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
            >
              Array Size
            </label>
            <div className="relative group">
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
                  "w-14 pl-2 pr-1 py-1 rounded-lg bg-black/40 border border-white/10",
                  "text-center font-mono text-sm font-bold text-neon-blue",
                  "focus:outline-none focus:border-neon-blue/50 focus:shadow-[0_0_15px_rgba(88,166,255,0.2)]",
                  "transition-all duration-300",
                  isRunning && "opacity-30 cursor-not-allowed"
                )}
              />
              <div className="absolute inset-0 rounded-lg bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          {/* Start/Reset buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onStart}
              disabled={isRunning}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-[0.2em]",
                "bg-neon-green text-background shadow-[0_0_20px_rgba(0,255,136,0.3)]",
                "transition-all duration-300",
                "hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]",
                "active:scale-95 disabled:scale-100",
                isRunning && "opacity-20 cursor-not-allowed grayscale shadow-none"
              )}
            >
              Initialize
            </button>
            <button
              onClick={onReset}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-[0.2em]",
                "bg-white/5 border border-white/10 text-white/60",
                "transition-all duration-300",
                "hover:bg-white/10 hover:text-white hover:border-white/20",
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
