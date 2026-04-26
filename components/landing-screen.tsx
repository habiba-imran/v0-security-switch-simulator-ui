"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./glass-card";

interface LandingScreenProps {
  onSelectMode: (mode: "play" | "bfs" | "divide") => void;
}

export function LandingScreen({ onSelectMode }: LandingScreenProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeSwitch, setActiveSwitch] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveSwitch((prev) => (prev + 1) % 5);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const modes = [
    {
      id: "play",
      label: "MANUAL OVERRIDE",
      sublabel: "Physical switch manipulation",
      description: "Direct manual control over the security array.",
    },
    {
      id: "bfs",
      label: "BRUTE FORCE ANALYSIS",
      sublabel: "Exhaustive state exploration",
      description: "Automated brute force using BFS logic.",
    },
    {
      id: "divide",
      label: "D&C RECURSION",
      sublabel: "Divide & Conquer protocol",
      description: "Recursive decomposition algorithm.",
    },
  ] as const;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background elements removed to show AnimatedGrid */}

      <FloatingParticles />

      {/* Main Dashboard Container */}
      <div className={cn(
        "relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-start gap-12 lg:gap-24 transition-all duration-700 ease-out",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}>
        
        {/* LEFT PANEL: Controls & Navigation */}
        <div className="flex flex-col gap-10 w-full lg:w-[380px] shrink-0">
          {/* Hardware Preview Section - Elevated */}
          <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-6 backdrop-blur-md">
            <HeroSwitches activeSwitch={activeSwitch} />
          </div>

          {/* Mode Selection Section */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-2">
              <div className="w-1.5 h-3 bg-gold rounded-full" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Operational Modes</span>
            </div>
            <div className="flex flex-col gap-3">
              {modes.map((mode, index) => (
                <ModeButton
                  key={mode.id}
                  mode={mode}
                  index={index}
                  isHovered={hoveredMode === mode.id}
                  onHover={() => setHoveredMode(mode.id)}
                  onLeave={() => setHoveredMode(null)}
                  onClick={() => onSelectMode(mode.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Branding & Intelligence */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {/* High-Contrast Branding Header */}
          <div className="border-b border-white/[0.05] pb-10">
            <h1 className="text-6xl md:text-7xl tracking-tighter leading-none group">
              <span className="font-black text-white/10 uppercase italic group-hover:text-white/20 transition-all duration-700">Switch</span>
              <span className="font-bold text-gold/30 ml-2 group-hover:text-gold transition-all duration-700">Sim</span>
            </h1>
          </div>

          {/* Intelligence Briefing Card */}
          <GlassCard className="p-8 md:p-12 border-white/[0.05] bg-white/[0.02] shadow-2xl relative overflow-hidden" glowColor="gold">
            <div className="absolute -top-20 -right-20 text-[180px] font-black text-white/[0.01] pointer-events-none select-none uppercase tracking-tighter italic">
              Brief
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Mission Goal</h3>
                <p className="text-xs md:text-sm text-white/40 leading-relaxed font-mono tracking-tight max-w-2xl">
                  Start with all switches <span className="text-neon-green/60 font-bold uppercase mx-1">ON (111...)</span> and 
                  turn them all <span className="text-neon-red/60 font-bold uppercase mx-1">OFF (000...)</span> in the minimum number of moves.
                </p>
              </div>



              <div className="pt-6 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-gold/30 transition-colors duration-300">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">Mathematical Model</span>
                  <p className="text-sm text-white/80 font-mono font-bold tracking-tight">T(n) = T(n-1) + 2T(n-2) + 1</p>
                </div>
                <div className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-neon-green/30 transition-colors duration-300">
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block mb-2">Complexity Target</span>
                  <p className="text-sm text-white/80 font-mono font-bold tracking-tight">O(2^n) Recursive Depth</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Subtle Bottom Accent */}
      <div className="absolute bottom-8 w-full px-12 flex items-center justify-between opacity-20">
        <span className="text-[8px] font-mono text-white/40 tracking-[0.5em] uppercase">Secure Connection Established</span>
        <div className="flex gap-2">
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

function HeroSwitches({ activeSwitch }: { activeSwitch: number }) {
  const switches = [true, true, true, true, true];

  return (
    <div className="relative py-2">
      <div className="flex items-center justify-between gap-3 md:gap-4">
        {switches.map((isOn, i) => {
          const isActive = i === activeSwitch;
          const currentState = isActive ? !isOn : isOn;
          
          return (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div
                className={cn(
                  "relative w-10 h-10 md:w-12 md:h-12 rounded-xl transition-all duration-300 ease-out flex items-center justify-center",
                  "border-[1.5px]",
                  currentState 
                    ? "bg-neon-green/10 border-neon-green/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                    : "bg-neon-red/5 border-neon-red/20",
                  isActive && "scale-110",
                )}
              >
                {/* Core Dot */}
                <div className={cn(
                  "w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300",
                  currentState 
                    ? "bg-neon-green shadow-[0_0_10px_rgba(34,197,94,0.6)]" 
                    : "bg-white/10"
                )} />
                
                {/* Active Indicator Ring */}
                {isActive && (
                  <div className={cn(
                    "absolute -inset-1 rounded-2xl border transition-colors duration-300",
                    currentState ? "border-neon-green/30 animate-pulse" : "border-neon-red/30"
                  )} />
                )}
              </div>
              <span className="text-[8px] font-mono text-white/20">S-0{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  index,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  mode: {
    id: string;
    label: string;
    sublabel: string;
    description: string;
  };
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group relative w-full p-4 rounded-xl text-left transition-all duration-300 ease-out",
        "bg-white/[0.02] border border-white/[0.05] overflow-hidden",
        isHovered && "bg-white/[0.05] border-gold/40 -translate-y-1 shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
      )}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      {/* Selection Glow Effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-transparent opacity-0 transition-opacity duration-300",
        isHovered && "opacity-100"
      )} />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className={cn(
            "text-sm md:text-base font-bold tracking-wider transition-colors duration-300",
            isHovered ? "text-gold" : "text-white/60"
          )}>
            {mode.label}
          </h3>
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest group-hover:text-white/40 transition-colors">
            {mode.sublabel}
          </p>
        </div>
        
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300",
          isHovered ? "bg-gold/20 border-gold/40" : "bg-white/5 border-white/10"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-all duration-300",
            isHovered ? "bg-gold shadow-[0_0_8px_rgba(210,170,90,0.8)] scale-125" : "bg-white/20"
          )} />
        </div>
      </div>
      
      {/* Bottom Indicator Line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-500 ease-out",
        isHovered ? "w-full opacity-60" : "w-0 opacity-0"
      )} />
    </button>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `pulseFloat ${10 + Math.random() * 15}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulseFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          33% { transform: translate(20px, -30px) scale(1.5); opacity: 0.2; }
          66% { transform: translate(-20px, -15px) scale(1.2); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
