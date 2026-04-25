"use client";

import { useState } from "react";
import { AnimatedGrid } from "@/components/animated-grid";
import { LandingScreen } from "@/components/landing-screen";
import { GameModeScreen } from "@/components/game-mode-screen";

type GameMode = "play" | "bfs" | "divide" | null;

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(null);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Only show animated grid in game mode */}
      {selectedMode !== null && <AnimatedGrid />}

      {/* Gradient overlay for game mode depth */}
      {selectedMode !== null && (
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none z-0" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {selectedMode === null ? (
          <LandingScreen onSelectMode={setSelectedMode} />
        ) : (
          <GameModeScreen mode={selectedMode} onBack={() => setSelectedMode(null)} />
        )}
      </div>
    </main>
  );
}
