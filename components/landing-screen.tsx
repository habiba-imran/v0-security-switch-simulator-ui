"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type GameMode = "play" | "bfs" | "divide";

interface LandingScreenProps {
  onSelectMode: (mode: GameMode) => void;
}

export function LandingScreen({ onSelectMode }: LandingScreenProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<GameMode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const modes: { key: GameMode; label: string; number: string; desc: string }[] = [
    { key: "play", label: "Manual", number: "01", desc: "Toggle switches yourself and find the optimal solution" },
    { key: "bfs", label: "BFS", number: "02", desc: "Watch breadth-first search find the shortest path" },
    { key: "divide", label: "Divide & Conquer", number: "03", desc: "See divide and conquer break down the problem" },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Soft gradient blobs that follow mouse */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-lavender/30 transition-all duration-[1500ms] ease-out"
          style={{
            left: `calc(15% + ${mousePos.x * 0.02}px)`,
            top: `calc(5% + ${mousePos.y * 0.02}px)`,
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] bg-rose/20 transition-all duration-[1500ms] ease-out"
          style={{
            right: `calc(5% + ${mousePos.x * -0.015}px)`,
            bottom: `calc(15% + ${mousePos.y * -0.015}px)`,
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] bg-mint/25 transition-all duration-[1500ms] ease-out"
          style={{
            left: `calc(45% + ${mousePos.x * 0.01}px)`,
            bottom: `calc(5% + ${mousePos.y * 0.01}px)`,
          }}
        />
      </div>

      {/* Main content - Split layout */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row">
        {/* Left side - Title */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-20 py-12 lg:py-0">
          <div
            className={cn(
              "transition-all duration-1000 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Small label */}
            <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase mb-6 font-mono">
              Algorithm Visualizer
            </p>

            {/* Main title with Syne font */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">Switch</span>
              <br />
              <span className="text-lavender">Simulator</span>
            </h1>

            {/* Description */}
            <p className="mt-8 text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
              Explore different algorithms to optimize switch operations.
              Choose your approach and watch the magic unfold.
            </p>

            {/* Decorative line */}
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px w-12 bg-lavender/40" />
              <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-mono">
                Select Mode
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Mode selection as vertical list */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:pr-20 lg:pl-0 pb-12 lg:py-0">
          <div className="space-y-3">
            {modes.map((mode, index) => (
              <button
                key={mode.key}
                onClick={() => onSelectMode(mode.key)}
                onMouseEnter={() => setHoveredMode(mode.key)}
                onMouseLeave={() => setHoveredMode(null)}
                className={cn(
                  "group w-full text-left py-5 md:py-6 px-6 md:px-8 rounded-2xl transition-all duration-500 ease-out",
                  "border border-transparent",
                  "hover:bg-white/60 hover:border-lavender/20 hover:shadow-xl hover:shadow-lavender/10",
                  mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                )}
                style={{
                  transitionDelay: mounted ? `${index * 100 + 300}ms` : "0ms",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span
                      className={cn(
                        "text-xs md:text-sm font-mono transition-colors duration-300",
                        hoveredMode === mode.key ? "text-lavender" : "text-muted-foreground/50"
                      )}
                    >
                      {mode.number}
                    </span>
                    <span
                      className={cn(
                        "text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight transition-colors duration-300",
                        hoveredMode === mode.key ? "text-foreground" : "text-foreground/60"
                      )}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {mode.label}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300",
                      hoveredMode === mode.key
                        ? "bg-lavender text-white scale-100"
                        : "bg-transparent text-muted-foreground/30 scale-90"
                    )}
                  >
                    <svg
                      className={cn(
                        "w-4 h-4 md:w-5 md:h-5 transition-transform duration-300",
                        hoveredMode === mode.key ? "translate-x-0.5" : ""
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Hover description */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    hoveredMode === mode.key
                      ? "max-h-12 opacity-100 mt-3"
                      : "max-h-0 opacity-0 mt-0"
                  )}
                >
                  <p className="text-sm text-muted-foreground pl-10 md:pl-12">
                    {mode.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-6 left-8 md:left-12 lg:left-20 flex items-center gap-6">
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-500",
                i < 3 ? "bg-lavender/60" : "bg-border"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/50 tracking-wider font-mono">
          v1.0
        </span>
      </div>

      {/* Corner accent */}
      <div className="absolute top-6 right-8 md:right-12 lg:right-20">
        <div
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 border border-lavender/20 rounded-full flex items-center justify-center",
            "transition-all duration-700 ease-out",
            mounted ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
          )}
        >
          <div className="w-2 h-2 rounded-full bg-lavender/60" />
        </div>
      </div>
    </div>
  );
}
