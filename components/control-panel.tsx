"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface ControlPanelProps {
  step: number;
  totalSteps: number;
  statusText: string;
  algorithmInfo: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  progress: number;
}

export function ControlPanel({
  step,
  totalSteps,
  statusText,
  algorithmInfo,
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  progress,
}: ControlPanelProps) {
  return (
    <GlassCard className="p-8 space-y-10 border-white/10" glowColor="blue">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <h2 className="text-base font-bold tracking-[0.2em] uppercase text-white/90">
          Control Center
        </h2>
        <div className="w-3 h-3 rounded-full bg-neon-blue animate-pulse shadow-[0_0_10px_rgba(88,166,255,0.8)]" />
      </div>

      {/* Step counter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Mission Progress
          </span>
          <span className="text-neon-blue font-mono text-xl font-bold">
            {step} <span className="text-muted-foreground/50 mx-1">/</span> {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-neon-blue via-neon-green to-neon-blue bg-[length:200%_100%] animate-gradient transition-all duration-500 rounded-full shadow-[0_0_15px_rgba(88,166,255,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status text */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          System Status
        </span>
        <div className="p-5 bg-white/[0.03] rounded-xl border border-white/5 backdrop-blur-sm shadow-inner">
          <p className="text-base font-medium text-neon-green whitespace-pre-line leading-relaxed">
            {statusText}
          </p>
        </div>
      </div>

      {/* Algorithm info */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Operation Rules
        </span>
        <div className="p-6 bg-white/[0.03] rounded-xl border border-neon-blue/20 shadow-[0_0_20px_rgba(88,166,255,0.05)]">
          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line font-medium tracking-tight">
            {algorithmInfo}
          </p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <div className="flex flex-col items-center gap-3">
          <ControlButton
            icon={
              isPlaying ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )
            }
            onClick={isPlaying ? onPause : onPlay}
            active={isPlaying}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            {isPlaying ? "Pause" : "Auto Play"}
          </span>
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <ControlButton
            icon={<StepIcon className="w-6 h-6" />}
            onClick={onStep}
            disabled={isPlaying}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            Next Step
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <ControlButton
            icon={<ResetIcon className="w-6 h-6" />}
            onClick={onReset}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
            Reset Array
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

interface ControlButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

function ControlButton({ icon, onClick, active, disabled }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-3 rounded-xl border border-glass-border bg-secondary/50",
        "transition-all duration-200 flex items-center justify-center",
        "hover:bg-secondary hover:border-neon-blue/50 hover:shadow-[0_0_15px_rgba(88,166,255,0.2)]",
        "active:scale-95",
        active && "bg-neon-blue/20 border-neon-blue/50 text-neon-blue",
        disabled && "opacity-50 cursor-not-allowed hover:bg-secondary/50 hover:border-glass-border hover:shadow-none",
        !active && !disabled && "text-foreground"
      )}
    >
      {icon}
    </button>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function StepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
