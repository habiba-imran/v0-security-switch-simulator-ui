"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const modes = [
    {
      id: "play",
      label: "MANUAL",
      sublabel: "Play Game",
      description: "Toggle switches yourself",
    },
    {
      id: "bfs",
      label: "BFS",
      sublabel: "Breadth-First",
      description: "Explore all states",
    },
    {
      id: "divide",
      label: "D&C",
      sublabel: "Divide & Conquer",
      description: "Recursive decomposition",
    },
  ] as const;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen overflow-hidden">
      {/* Warm radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(180,130,60,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.5)_80%)]" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated switch display - the hero */}
        <div
          className={cn(
            "relative mb-10 transition-all duration-1000",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <HeroSwitches activeSwitch={activeSwitch} />
        </div>

        {/* Title */}
        <div
          className={cn(
            "text-center mb-14 transition-all duration-1000 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="relative inline-block">
                <span className="absolute inset-0 text-gold blur-md opacity-40">
                  SWITCH
                </span>
                <span className="relative text-gold drop-shadow-[0_0_25px_rgba(210,170,90,0.5)]">
                  SWITCH
                </span>
              </span>
              <span className="text-foreground/80 ml-3 font-light">SIM</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-xs tracking-[0.35em] uppercase font-mono">
              Algorithm Visualization System
            </p>
          </div>
        </div>

        {/* Mode selection - elegant buttons */}
        <div
          className={cn(
            "flex items-center justify-center gap-4 md:gap-6 transition-all duration-1000 delay-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
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

        {/* Hover info display */}
        <div className="h-10 mt-8 flex items-center justify-center">
          {hoveredMode && (
            <p className="text-amber/70 text-sm font-mono animate-in fade-in slide-in-from-bottom-2 duration-200">
              {modes.find((m) => m.id === hoveredMode)?.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-dim/30 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold-dim/30 to-transparent" />
      </div>
    </div>
  );
}

function HeroSwitches({ activeSwitch }: { activeSwitch: number }) {
  const switches = [false, true, false, true, false];

  return (
    <div className="relative">
      {/* Warm glow backdrop */}
      <div className="absolute inset-0 blur-3xl opacity-20 bg-gold rounded-full scale-150" />

      {/* Switch container */}
      <div className="relative flex items-center gap-4 md:gap-5 p-8 md:p-10 rounded-2xl bg-card/40 backdrop-blur-xl border border-gold/10">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-5 h-5 border-l border-t border-gold/30 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-5 h-5 border-r border-t border-gold/30 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-gold/30 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-gold/30 rounded-br-xl" />

        {switches.map((isOn, i) => {
          const isActive = i === activeSwitch;
          const currentState = isActive ? !isOn : isOn;

          return (
            <div
              key={i}
              className={cn(
                "relative w-11 h-11 md:w-14 md:h-14 rounded-full",
                "flex items-center justify-center",
                "transition-all duration-500 ease-out",
                currentState
                  ? "bg-gold/15 shadow-[0_0_25px_rgba(210,170,90,0.35)]"
                  : "bg-gold-dim/5",
                isActive && "scale-110"
              )}
            >
              {/* Ring */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full border transition-all duration-500",
                  currentState ? "border-gold/60" : "border-gold-dim/20"
                )}
              />
              {/* Inner dot */}
              <div
                className={cn(
                  "w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-500",
                  currentState
                    ? "bg-gold shadow-[0_0_15px_rgba(210,170,90,0.7)]"
                    : "bg-gold-dim/30"
                )}
              />
              {/* Pulse effect for active */}
              {isActive && currentState && (
                <div className="absolute inset-0 rounded-full border border-gold/50 animate-ping opacity-40" />
              )}
            </div>
          );
        })}
      </div>

      {/* Label */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gold-dim/50 tracking-[0.3em]">
        LIVE PREVIEW
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
        "group relative flex flex-col items-center gap-2 px-6 py-5 md:px-8 md:py-6 rounded-xl",
        "border border-gold/10 backdrop-blur-sm transition-all duration-400 ease-out",
        "bg-card/30",
        isHovered && "bg-gold/10 border-gold/30 shadow-[0_0_40px_rgba(210,170,90,0.2)]",
        isHovered ? "scale-105 -translate-y-1" : "scale-100"
      )}
      style={{
        transitionDelay: `${index * 30}ms`,
      }}
    >
      {/* Main label */}
      <span
        className={cn(
          "text-xl md:text-2xl font-semibold tracking-wide transition-all duration-300",
          isHovered ? "text-gold drop-shadow-[0_0_12px_rgba(210,170,90,0.6)]" : "text-foreground/80"
        )}
      >
        {mode.label}
      </span>

      {/* Sublabel */}
      <span className={cn(
        "text-[10px] md:text-xs font-mono tracking-wider uppercase transition-colors duration-300",
        isHovered ? "text-amber/60" : "text-muted-foreground/50"
      )}>
        {mode.sublabel}
      </span>

      {/* Hover line indicator */}
      <div
        className={cn(
          "absolute -bottom-px left-1/2 -translate-x-1/2 h-px rounded-full transition-all duration-400",
          isHovered ? "w-12 bg-gold/60" : "w-0 bg-transparent"
        )}
      />
    </button>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-gold/20"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animation: `floatGold ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes floatGold {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-15px) translateX(8px) scale(1.3);
            opacity: 0.35;
          }
        }
      `}</style>
    </div>
  );
}
