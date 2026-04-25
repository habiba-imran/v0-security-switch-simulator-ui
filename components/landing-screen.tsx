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
      color: "green",
      angle: -30,
    },
    {
      id: "bfs",
      label: "BFS",
      sublabel: "Breadth-First",
      description: "Explore all states",
      color: "blue",
      angle: 0,
    },
    {
      id: "divide",
      label: "D&C",
      sublabel: "Divide & Conquer",
      description: "Recursive decomposition",
      color: "red",
      angle: 30,
    },
  ] as const;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen overflow-hidden">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.8)_100%)]" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated switch display - the hero */}
        <div
          className={cn(
            "relative mb-8 transition-all duration-1000",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <HeroSwitches activeSwitch={activeSwitch} />
        </div>

        {/* Title with glitch effect */}
        <div
          className={cn(
            "text-center mb-12 transition-all duration-1000 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              <span className="relative inline-block">
                <span className="absolute inset-0 text-neon-green blur-sm opacity-50">
                  SWITCH
                </span>
                <span className="relative text-neon-green drop-shadow-[0_0_30px_rgba(0,255,136,0.6)]">
                  SWITCH
                </span>
              </span>
              <span className="text-foreground/90 ml-3">SIM</span>
            </h1>
            <p className="mt-3 text-muted-foreground/80 text-sm tracking-[0.3em] uppercase font-mono">
              Algorithm Visualization System
            </p>
          </div>
        </div>

        {/* Mode selection - floating cards */}
        <div
          className={cn(
            "flex items-center justify-center gap-6 md:gap-10 transition-all duration-1000 delay-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {modes.map((mode) => (
            <ModeButton
              key={mode.id}
              mode={mode}
              isHovered={hoveredMode === mode.id}
              onHover={() => setHoveredMode(mode.id)}
              onLeave={() => setHoveredMode(null)}
              onClick={() => onSelectMode(mode.id)}
            />
          ))}
        </div>

        {/* Hover info display */}
        <div className="h-12 mt-8 flex items-center justify-center">
          {hoveredMode && (
            <p className="text-muted-foreground text-sm font-mono animate-in fade-in slide-in-from-bottom-2 duration-200">
              {modes.find((m) => m.id === hoveredMode)?.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="w-16 h-px bg-gradient-to-r from-transparent to-border" />
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-muted-foreground/40"
            />
          ))}
        </div>
        <div className="w-16 h-px bg-gradient-to-l from-transparent to-border" />
      </div>
    </div>
  );
}

function HeroSwitches({ activeSwitch }: { activeSwitch: number }) {
  const switches = [false, true, false, true, false];

  return (
    <div className="relative">
      {/* Glow backdrop */}
      <div className="absolute inset-0 blur-3xl opacity-30 bg-neon-green rounded-full scale-150" />

      {/* Switch container */}
      <div className="relative flex items-center gap-3 md:gap-4 p-6 md:p-8 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/50">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-neon-green/50 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-neon-green/50 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-neon-green/50 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-neon-green/50 rounded-br-lg" />

        {switches.map((isOn, i) => {
          const isActive = i === activeSwitch;
          const currentState = isActive ? !isOn : isOn;

          return (
            <div
              key={i}
              className={cn(
                "relative w-10 h-10 md:w-12 md:h-12 rounded-full",
                "flex items-center justify-center",
                "transition-all duration-300",
                currentState
                  ? "bg-neon-green/20 shadow-[0_0_20px_rgba(0,255,136,0.5)]"
                  : "bg-neon-red/10",
                isActive && "scale-110"
              )}
            >
              {/* Ring */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-2 transition-colors duration-300",
                  currentState ? "border-neon-green" : "border-neon-red/50"
                )}
              />
              {/* Inner dot */}
              <div
                className={cn(
                  "w-4 h-4 md:w-5 md:h-5 rounded-full transition-all duration-300",
                  currentState
                    ? "bg-neon-green shadow-[0_0_12px_rgba(0,255,136,0.8)]"
                    : "bg-neon-red/60"
                )}
              />
              {/* Pulse effect for active */}
              {isActive && (
                <div className="absolute inset-0 rounded-full border-2 border-neon-green animate-ping opacity-50" />
              )}
            </div>
          );
        })}
      </div>

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground/60 tracking-widest">
        LIVE PREVIEW
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: {
  mode: {
    id: string;
    label: string;
    sublabel: string;
    color: string;
    angle: number;
  };
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const colorClasses = {
    green: {
      bg: "bg-neon-green/10",
      border: "border-neon-green/30",
      text: "text-neon-green",
      glow: "shadow-[0_0_30px_rgba(0,255,136,0.4)]",
      hoverBg: "hover:bg-neon-green/20",
    },
    blue: {
      bg: "bg-neon-blue/10",
      border: "border-neon-blue/30",
      text: "text-neon-blue",
      glow: "shadow-[0_0_30px_rgba(100,150,255,0.4)]",
      hoverBg: "hover:bg-neon-blue/20",
    },
    red: {
      bg: "bg-neon-red/10",
      border: "border-neon-red/30",
      text: "text-neon-red",
      glow: "shadow-[0_0_30px_rgba(255,100,100,0.4)]",
      hoverBg: "hover:bg-neon-red/20",
    },
  };

  const colors = colorClasses[mode.color as keyof typeof colorClasses];

  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "group relative flex flex-col items-center gap-2 p-5 md:p-6 rounded-xl",
        "border backdrop-blur-sm transition-all duration-300",
        colors.bg,
        colors.border,
        colors.hoverBg,
        isHovered && colors.glow,
        isHovered ? "scale-105 -translate-y-1" : "scale-100"
      )}
      style={{
        transform: `rotate(${isHovered ? 0 : mode.angle * 0.1}deg) ${
          isHovered ? "scale(1.05) translateY(-4px)" : ""
        }`,
      }}
    >
      {/* Main label */}
      <span
        className={cn(
          "text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300",
          colors.text,
          isHovered && "drop-shadow-[0_0_10px_currentColor]"
        )}
      >
        {mode.label}
      </span>

      {/* Sublabel */}
      <span className="text-[10px] md:text-xs font-mono text-muted-foreground tracking-wider uppercase">
        {mode.sublabel}
      </span>

      {/* Hover indicator */}
      <div
        className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-all duration-300",
          isHovered ? `${colors.bg} opacity-100` : "opacity-0"
        )}
        style={{
          background: isHovered
            ? mode.color === "green"
              ? "rgba(0,255,136,0.6)"
              : mode.color === "blue"
              ? "rgba(100,150,255,0.6)"
              : "rgba(255,100,100,0.6)"
            : "transparent",
        }}
      />
    </button>
  );
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-neon-green/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px) scale(1.5);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
