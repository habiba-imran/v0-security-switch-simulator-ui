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
    <GlassCard className="p-6 space-y-6" glowColor="blue">
      {/* Step counter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Step Counter
          </span>
          <span className="text-neon-blue font-mono text-sm">
            {step} / {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status text */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Status
        </span>
        <div className="p-3 bg-secondary/50 rounded-lg border border-glass-border">
          <p className="text-sm font-mono text-neon-green">{statusText}</p>
        </div>
      </div>

      {/* Algorithm info */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Algorithm
        </span>
        <div className="p-3 bg-secondary/50 rounded-lg border border-glass-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {algorithmInfo}
          </p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-4 gap-2">
        <ControlButton
          icon={
            isPlaying ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4" />
            )
          }
          onClick={isPlaying ? onPause : onPlay}
          active={isPlaying}
        />
        <ControlButton
          icon={<StepIcon className="w-4 h-4" />}
          onClick={onStep}
          disabled={isPlaying}
        />
        <ControlButton
          icon={<ResetIcon className="w-4 h-4" />}
          onClick={onReset}
        />
        <ControlButton
          icon={<SettingsIcon className="w-4 h-4" />}
          onClick={() => {}}
        />
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
