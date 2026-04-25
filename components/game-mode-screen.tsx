"use client";

import { useState, useCallback } from "react";
import { TopBar } from "./top-bar";
import { ControlPanel } from "./control-panel";
import { SecuritySwitch } from "./security-switch";
import { ToastNotification } from "./toast-notification";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

type GameMode = "play" | "bfs" | "divide";

interface GameModeScreenProps {
  mode: GameMode;
  onBack: () => void;
}

const modeConfig = {
  play: {
    title: "Play Mode",
    algorithmInfo:
      "Manual puzzle mode. Toggle switches to turn all to ON state. Each toggle affects adjacent switches.",
    glowColor: "green" as const,
  },
  bfs: {
    title: "BFS Visualization",
    algorithmInfo:
      "Breadth-First Search explores all states level by level, guaranteed to find the shortest solution.",
    glowColor: "blue" as const,
  },
  divide: {
    title: "Divide & Conquer",
    algorithmInfo:
      "Recursively divides the problem into smaller subproblems, solving each independently before combining.",
    glowColor: "red" as const,
  },
};

export function GameModeScreen({ mode, onBack }: GameModeScreenProps) {
  const [switchCount, setSwitchCount] = useState(5);
  const [switches, setSwitches] = useState<boolean[]>(() =>
    Array(5).fill(false)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [statusText, setStatusText] = useState("Ready to start");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "info", visible: false });

  const config = modeConfig[mode];

  const handleSwitchCountChange = useCallback((count: number) => {
    setSwitchCount(count);
    setSwitches(Array(count).fill(false));
    setStep(0);
    setTotalSteps(0);
    setStatusText("Ready to start");
  }, []);

  const handleToggle = useCallback(
    (index: number) => {
      if (mode !== "play" || isRunning) return;

      setSwitches((prev) => {
        const newSwitches = [...prev];
        // Toggle current switch and adjacent switches
        newSwitches[index] = !newSwitches[index];
        if (index > 0) newSwitches[index - 1] = !newSwitches[index - 1];
        if (index < prev.length - 1)
          newSwitches[index + 1] = !newSwitches[index + 1];
        return newSwitches;
      });

      setStep((prev) => prev + 1);
      setStatusText(`Toggled switch S${index + 1}`);

      // Check win condition
      setTimeout(() => {
        setSwitches((current) => {
          if (current.every((s) => s)) {
            setToast({
              message: "Puzzle solved! All switches are ON!",
              type: "success",
              visible: true,
            });
          }
          return current;
        });
      }, 100);
    },
    [mode, isRunning]
  );

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsPlaying(true);
    setStep(0);
    setTotalSteps(Math.pow(2, switchCount));
    setStatusText("Algorithm started...");
    setToast({
      message: `${config.title} started`,
      type: "info",
      visible: true,
    });

    // Simulate algorithm steps
    if (mode !== "play") {
      let currentStep = 0;
      const total = Math.min(Math.pow(2, switchCount), 20);
      setTotalSteps(total);

      const interval = setInterval(() => {
        currentStep++;
        setStep(currentStep);
        setStatusText(`Step ${currentStep}: Exploring state...`);

        // Randomly toggle some switches for visualization
        setSwitches((prev) => {
          const newSwitches = [...prev];
          const randomIndex = Math.floor(Math.random() * prev.length);
          newSwitches[randomIndex] = !newSwitches[randomIndex];
          return newSwitches;
        });

        if (currentStep >= total) {
          clearInterval(interval);
          setIsPlaying(false);
          setIsRunning(false);
          setSwitches(Array(switchCount).fill(true));
          setStatusText("Solution found!");
          setToast({
            message: "Algorithm completed successfully!",
            type: "success",
            visible: true,
          });
        }
      }, 500);
    }
  }, [mode, switchCount, config.title]);

  const handleReset = useCallback(() => {
    setSwitches(Array(switchCount).fill(false));
    setIsRunning(false);
    setIsPlaying(false);
    setStep(0);
    setTotalSteps(0);
    setStatusText("Ready to start");
    setToast({ message: "Reset complete", type: "info", visible: true });
  }, [switchCount]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setStatusText("Paused");
  }, []);

  const handleStep = useCallback(() => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      setStatusText(`Step ${step + 1}: Processing...`);
    }
  }, [step, totalSteps]);

  const progress = totalSteps > 0 ? (step / totalSteps) * 100 : 0;

  return (
    <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col gap-6">
      <TopBar
        title={config.title}
        onBack={onBack}
        switchCount={switchCount}
        onSwitchCountChange={handleSwitchCountChange}
        onStart={handleStart}
        onReset={handleReset}
        isRunning={isRunning}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Main switch area */}
        <GlassCard
          className="flex-1 p-8 flex items-center justify-center"
          glowColor={config.glowColor}
        >
          <div className="flex flex-wrap justify-center items-center gap-10 p-8">
            {switches.map((isOn, index) => (
              <SecuritySwitch
                key={index}
                id={index + 1}
                isOn={isOn}
                onToggle={() => handleToggle(index)}
                disabled={mode !== "play" || isRunning}
                size="lg"
              />
            ))}
          </div>
        </GlassCard>

        {/* Side panel */}
        <div className="lg:w-80 space-y-6">
          <ControlPanel
            step={step}
            totalSteps={totalSteps || switchCount * 2}
            statusText={statusText}
            algorithmInfo={config.algorithmInfo}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onStep={handleStep}
            onReset={handleReset}
            progress={progress}
          />

          {/* Mode-specific info */}
          <GlassCard className="p-4" glowColor={config.glowColor}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  isRunning
                    ? config.glowColor === "green"
                      ? "bg-neon-green"
                      : config.glowColor === "blue"
                      ? "bg-neon-blue"
                      : "bg-neon-red"
                    : "bg-muted-foreground"
                )}
              />
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {isRunning
                  ? isPlaying
                    ? "Running"
                    : "Paused"
                  : "Idle"}
              </span>
            </div>
          </GlassCard>
        </div>
      </div>

      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
