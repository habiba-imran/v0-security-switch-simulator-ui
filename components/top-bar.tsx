"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface TopBarProps {
  title: string;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  statusText: string;
}

export function TopBar({
  title,
  onBack,
  step,
  totalSteps,
  progress,
  statusText,
}: TopBarProps) {
  return (
    <GlassCard className="p-3 border-white/5 shadow-2xl relative z-50" glowColor="gold">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Navigation & Title */}
        <div className="flex items-center gap-5 shrink-0">
          <button
            onClick={onBack}
            className={cn(
              "p-2 rounded-xl border border-white/10 bg-white/5 shrink-0",
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

          <div className="flex flex-col justify-center">
            <h1 className="text-[13px] font-black tracking-tighter text-white/60 uppercase leading-none font-sans">
              {title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-[1px] bg-gold/40" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] leading-none font-sans">
                Mission Ops
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right Section: Live Data Terminal */}
        <div className="flex-1 flex items-center gap-6 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl max-w-4xl min-w-0">
          
          {/* Progress Section */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="flex flex-col gap-1.5 w-28">
              <div className="flex items-center justify-between">
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-sans">Progress</span>
                 <span className="text-[10px] font-mono font-bold text-gold/80">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold/40 to-gold transition-all duration-500 shadow-[0_0_8px_rgba(255,184,0,0.3)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="w-px h-6 bg-white/10" />

            <div className="flex items-center gap-5">
              <div className="flex flex-col items-center min-w-[36px]">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 font-sans">Step</span>
                <span className="text-[13px] font-mono font-bold text-white/80 leading-none">{step}</span>
              </div>
              <div className="flex flex-col items-center min-w-[36px]">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 font-sans">Goal</span>
                <span className="text-[13px] font-mono font-bold text-gold/40 leading-none">{totalSteps}</span>
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          {/* Command Section: Maximized Space */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] font-sans">Command Feed</span>
            </div>
            <p className="text-[11px] font-bold text-neon-green/90 italic truncate mt-1 tracking-tight font-mono">
              {statusText || "Initializing system protocols..."}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
