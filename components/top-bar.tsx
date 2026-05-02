"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TopBarProps {
  title: string;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  statusText: string;
  feedLabel?: string;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  completeLog?: string[];
}

export function TopBar({
  title,
  onBack,
  step,
  totalSteps,
  progress,
  statusText,
  feedLabel = "Command Feed",
  onNextStep,
  onPrevStep,
  completeLog = [],
}: TopBarProps) {
  const isViolation = feedLabel.toLowerCase().includes("violation");
  const isAlgoMode = feedLabel.toLowerCase().includes("execution") || feedLabel.toLowerCase().includes("command");
  
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current && step > 0) {
      const currentItem = logRef.current.children[step - 1] as HTMLElement;
      if (currentItem) {
        logRef.current.scrollTo({
          top: currentItem.offsetTop - logRef.current.offsetTop - 20,
          behavior: "smooth"
        });
      }
    }
  }, [step]);

  return (
    <div className="flex flex-col gap-4 relative z-50">
      <GlassCard className="p-3 border-white/5 shadow-2xl" glowColor="gold">
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

          {/* Center Section: Live Data Terminal */}
          <div className="flex-1 flex items-center gap-6 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-xl max-w-4xl min-w-0 h-[70px]">
            
            {/* Progress Section */}
            <div className="flex items-center gap-5 shrink-0">
              <div className="flex flex-col gap-1.5 w-24">
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

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center min-w-[30px]">
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1 font-sans">Step</span>
                  <span className="text-[11px] font-mono font-bold text-white/80">{step}</span>
                </div>
                <div className="flex flex-col items-center min-w-[30px]">
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1 font-sans">Goal</span>
                  <span className="text-[11px] font-mono font-bold text-gold/40">{totalSteps}</span>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-white/10 shrink-0" />

            {/* Command/Execution Section */}
            <div className="flex-1 min-w-0 flex items-center gap-4 h-full">
              {isAlgoMode && (
                <button 
                  onClick={onPrevStep}
                  disabled={step === 0}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}

              {/* Status Feed (Enhanced) */}
              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                <div className="flex items-center gap-2 mb-1">
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full animate-pulse",
                     (isViolation && statusText) ? "bg-neon-red shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-neon-green shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                   )} />
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">{feedLabel}</span>
                   {isAlgoMode && <span className="text-[8px] font-mono text-white/20 ml-auto">{step}/{totalSteps} OPS</span>}
                </div>
                
                <div className="bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 min-w-0">
                  <p className={cn(
                    "text-[12px] font-black truncate tracking-tight font-mono",
                    (isViolation && statusText) ? "text-neon-red" : "text-neon-green"
                  )}>
                    {statusText || (isViolation ? "SYSTEM SECURE" : "AWAITING COMMAND")}
                  </p>
                </div>
              </div>

              {isAlgoMode && (
                <button 
                  onClick={onNextStep}
                  disabled={step >= totalSteps}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all shrink-0"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {isAlgoMode && (
              <>
                <div className="w-px h-10 bg-white/10 shrink-0" />
                <div className="flex flex-col gap-1.5 min-w-[240px] border-l border-white/5 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-gold/80 uppercase tracking-widest font-sans">Operation Protocol</span>
                    <div className="flex-1 h-[1px] bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-[8px] font-mono leading-tight">
                    <div className="flex gap-2 items-start">
                      <span className="text-gold font-bold">R1</span>
                      <span className="text-white/40">S(n) toggles freely at any time.</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-gold font-bold">R2</span>
                      <span className="text-white/40">S(i) toggles iff S(i+1)=ON & S(i+2..n)=OFF.</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
