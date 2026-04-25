"use client";

import { ModeCard } from "./mode-card";

interface LandingScreenProps {
  onSelectMode: (mode: "play" | "bfs" | "divide") => void;
}

export function LandingScreen({ onSelectMode }: LandingScreenProps) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen p-6 overflow-hidden">
      {/* Hero section */}
      <div className="text-center mb-10 space-y-3">
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-neon-green/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,136,0.7)] animate-pulse" />
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-neon-green/60" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
          <span className="text-neon-green drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
            Security
          </span>{" "}
          <span className="text-foreground">Switch Simulator</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
          Optimize switch operations using advanced algorithms
        </p>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-neon-green/70 tracking-wider">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Mode selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full px-2">
        <ModeCard
          title="Play Game"
          description="Toggle switches manually to find the optimal solution."
          icon={<GamepadIcon />}
          glowColor="green"
          onClick={() => onSelectMode("play")}
        />
        <ModeCard
          title="BFS Algorithm"
          description="Visualize Breadth-First Search exploring all states."
          icon={<NetworkIcon />}
          glowColor="blue"
          onClick={() => onSelectMode("bfs")}
        />
        <ModeCard
          title="Divide & Conquer"
          description="Watch recursive problem decomposition in action."
          icon={<SplitIcon />}
          glowColor="red"
          onClick={() => onSelectMode("divide")}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
          Algorithm Visualization Demo
        </p>
      </div>
    </div>
  );
}

function GamepadIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 10v4M17 10v4M10 7h4M10 17h4" />
    </svg>
  );
}

function SplitIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
      />
    </svg>
  );
}
