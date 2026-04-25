"use client";

import { ModeCard } from "./mode-card";

interface LandingScreenProps {
  onSelectMode: (mode: "play" | "bfs" | "divide") => void;
}

export function LandingScreen({ onSelectMode }: LandingScreenProps) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
      {/* Hero section */}
      <div className="text-center mb-16 space-y-6">
        {/* Decorative elements */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent to-neon-green" />
          <div className="w-3 h-3 rounded-full bg-neon-green shadow-[0_0_15px_rgba(0,255,136,0.8)] animate-pulse" />
          <div className="w-12 h-[2px] bg-gradient-to-l from-transparent to-neon-green" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-neon-green drop-shadow-[0_0_30px_rgba(0,255,136,0.5)]">
            Security
          </span>
          <br />
          <span className="text-foreground">Switch Simulator</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Optimize switch operations using advanced algorithms
        </p>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-neon-green/80">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Mode selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <ModeCard
          title="Play Game"
          description="Interactive puzzle mode. Toggle switches manually to find the optimal solution."
          icon={<GamepadIcon />}
          glowColor="green"
          onClick={() => onSelectMode("play")}
        />
        <ModeCard
          title="Brute Force (BFS)"
          description="Visualize the Breadth-First Search algorithm exploring all possible states."
          icon={<NetworkIcon />}
          glowColor="blue"
          onClick={() => onSelectMode("bfs")}
        />
        <ModeCard
          title="Divide & Conquer"
          description="Watch the divide and conquer approach break down the problem recursively."
          icon={<SplitIcon />}
          glowColor="red"
          onClick={() => onSelectMode("divide")}
        />
      </div>

      {/* Footer info */}
      <div className="mt-16 text-center space-y-2">
        <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
          Powered by Advanced Algorithm Visualization
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/40">
          <span>v1.0.0</span>
          <span>•</span>
          <span>University Demo</span>
        </div>
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
