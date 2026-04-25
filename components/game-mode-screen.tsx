"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TopBar } from "./top-bar";
import { ControlPanel } from "./control-panel";
import { SecuritySwitch } from "./security-switch";
import { ToastNotification } from "./toast-notification";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { solveSwitchesBruteforce, type SwitchBit } from "@/lib/bruteforce-bfs";
import { solveDivideConquer, divideConquerSwitches, recurrenceSteps } from "@/lib/divide-conquer";

type GameMode = "play" | "bfs" | "divide";

interface GameModeScreenProps {
  mode: GameMode;
  onBack: () => void;
}

const modeConfig = {
  play: {
    title: "Play Mode",
    algorithmInfo:
      "RULES OF THE GAME:\n\n• Rule 1: The RIGHTMOST switch can be toggled ON or OFF at any time.\n\n• Rule 2: Any other switch can be toggled ONLY if its IMMEDIATE RIGHT neighbor is ON and ALL switches further to the right are OFF.\n\nGOAL: Start with all switches ON (111...) and turn them all OFF (000...).",
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
    Array(5).fill(true)
  );
  const [solutionPath, setSolutionPath] = useState<SwitchBit[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [statusText, setStatusText] = useState("Ready to start");
  const [divideRecurrenceLines, setDivideRecurrenceLines] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [moveDescriptions, setMoveDescriptions] = useState<string[]>([]);
  const moveListRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ message: "", type: "info", visible: false });

  const config = modeConfig[mode];

  const clearPlaybackTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPlaybackTimer();
    };
  }, [clearPlaybackTimer]);

  useEffect(() => {
    if (moveListRef.current && step > 0) {
      const currentMoveElement = moveListRef.current.children[step - 1] as HTMLElement;
      if (currentMoveElement) {
        moveListRef.current.scrollTo({
          top: currentMoveElement.offsetTop - moveListRef.current.offsetTop - 10,
          behavior: "smooth",
        });
      }
    }
  }, [step]);

  const updateStateFromPath = useCallback((moveIndex: number, path: SwitchBit[][]) => {
    const state = path[moveIndex];
    if (!state) {
      return;
    }

    setSwitches(state.map((bit) => bit === 1));

    if (moveIndex === 0) {
      setStatusText("Initial state: All switches are ON. Goal: Turn them all OFF.");
      return;
    }

    const previous = path[moveIndex - 1];
    const toggledIndex = state.findIndex((bit, index) => bit !== previous[index]);

    if (toggledIndex >= 0) {
      const n = state.length;
      let reason = "";
      
      // Calculate switch number from index (S1 is rightmost in our internal logic for D&C)
      // but in the UI we use 1-indexed from left. 
      // The rules are:
      // Rule 1: Rightmost (index n-1) can always toggle.
      // Rule 2: Switch i can toggle if i+1 is ON and i+2...n-1 are OFF.
      
      if (toggledIndex === n - 1) {
        reason = "Rule 1: The rightmost switch is always accessible.";
      } else {
        const nextOn = previous[toggledIndex + 1] === 1;
        const othersOff = previous.slice(toggledIndex + 2).every(b => b === 0);
        
        if (nextOn && othersOff) {
          reason = `Rule 2: S${toggledIndex + 2} is ON and all switches to its right are OFF.`;
        } else if (!nextOn) {
          reason = `NOTE: S${toggledIndex + 2} must be ON for this move.`;
        } else {
          reason = `NOTE: All switches to the right of S${toggledIndex + 2} must be OFF.`;
        }
      }
      
      const action = state[toggledIndex] === 1 ? "ON" : "OFF";
      const algoPrefix = mode === "bfs" ? "[BFS Search]" : "[Recursive D&C]";
      setStatusText(`${algoPrefix} Move ${moveIndex}: Turned S${toggledIndex + 1} ${action}. ${reason}`);
    } else {
      setStatusText(`Move ${moveIndex}: state updated`);
    }
  }, [mode]);

  const completeBfsRun = useCallback(() => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setIsRunning(false);
    setStatusText("Shortest path complete");
    setToast({
      message: "BFS completed with shortest path",
      type: "success",
      visible: true,
    });
  }, [clearPlaybackTimer]);

  const advanceBfsStep = useCallback(() => {
    setStep((prev) => {
      if (prev >= totalSteps) {
        completeBfsRun();
        return prev;
      }

      const nextStep = prev + 1;
      updateStateFromPath(nextStep, solutionPath);

      if (nextStep >= totalSteps) {
        completeBfsRun();
      }

      return nextStep;
    });
  }, [completeBfsRun, solutionPath, totalSteps, updateStateFromPath]);

  const completeDivideRun = useCallback((moves: number) => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setIsRunning(false);
    setStatusText(`Divide & Conquer complete: T(${switchCount}) = ${moves}`);
    setToast({
      message: `Divide & Conquer solved in ${moves} moves`,
      type: "success",
      visible: true,
    });
  }, [clearPlaybackTimer, switchCount]);

  const advanceDivideStep = useCallback(() => {
    setStep((prev) => {
      if (prev >= totalSteps) {
        completeDivideRun(totalSteps);
        return prev;
      }

      const nextStep = prev + 1;
      updateStateFromPath(nextStep, solutionPath);

      if (nextStep >= totalSteps) {
        completeDivideRun(totalSteps);
      }

      return nextStep;
    });
  }, [completeDivideRun, solutionPath, totalSteps, updateStateFromPath]);

  const startDividePlayback = useCallback(() => {
    if (timerRef.current || step >= totalSteps) {
      return;
    }

    timerRef.current = setInterval(() => {
      advanceDivideStep();
    }, 650);
  }, [advanceDivideStep, step, totalSteps]);

  const startBfsPlayback = useCallback(() => {
    if (timerRef.current || step >= totalSteps) {
      return;
    }

    timerRef.current = setInterval(() => {
      advanceBfsStep();
    }, 650);
  }, [advanceBfsStep, step, totalSteps]);

  const handleSwitchCountChange = useCallback((count: number) => {
    clearPlaybackTimer();
    setSwitchCount(count);
    setSwitches(Array(count).fill(true));
    setSolutionPath([]);
    setMoveDescriptions([]);
    setDivideRecurrenceLines([]);
    setIsRunning(false);
    setIsPlaying(false);
    setStep(0);
    setTotalSteps(0);
    setStatusText("Ready to start");
  }, [clearPlaybackTimer]);

  const handleToggle = useCallback(
    (index: number) => {
      if (mode !== "play" || isRunning) return;

      let canToggle = false;
      const n = switches.length;

      if (index === n - 1) {
        canToggle = true;
      } else if (switches[index + 1]) {
        canToggle = true;
        for (let j = index + 2; j < n; j++) {
          if (switches[j]) {
            canToggle = false;
            break;
          }
        }
      }

      if (!canToggle) {
        setToast({
          message: `Cannot toggle S${index + 1}. Switch S${index + 2} must be ON and all switches to its right must be OFF.`,
          type: "error",
          visible: true,
        });
        return;
      }

      setSwitches((prev) => {
        const newSwitches = [...prev];
        newSwitches[index] = !newSwitches[index];
        return newSwitches;
      });

      setStep((prev) => prev + 1);
      setStatusText(`Toggled switch S${index + 1}`);

      // Check win condition
      setTimeout(() => {
        setSwitches((current) => {
          if (current.every((s) => !s)) {
            setToast({
              message: "Security breach successful! All switches are OFF!",
              type: "success",
              visible: true,
            });
          }
          return current;
        });
      }, 100);
    },
    [mode, isRunning, switches]
  );

  const handleStart = useCallback(() => {
    clearPlaybackTimer();

    if (mode === "bfs") {
      const result = solveSwitchesBruteforce(switchCount);
      setSolutionPath(result.path);
      setStep(0);
      setTotalSteps(result.minMoves);
      
      // Derive move descriptions
      const descriptions = result.path.slice(1).map((state, i) => {
        const prev = result.path[i];
        const toggledIdx = state.findIndex((bit, j) => bit !== prev[j]);
        const action = state[toggledIdx] === 1 ? "ON" : "OFF";
        return `Turn S${toggledIdx + 1} ${action}`;
      });
      setMoveDescriptions(descriptions);

      setIsRunning(true);
      setIsPlaying(false);
      updateStateFromPath(0, result.path);
      setStatusText(`Shortest path found: ${result.minMoves} moves. Click 'Play' for auto or 'Next' to step.`);
      setToast({
        message: `BFS solution found in ${result.minMoves} moves`,
        type: "info",
        visible: true,
      });

      if (result.minMoves === 0) {
        completeBfsRun();
        return;
      }
      return;
    }

    if (mode === "divide") {
      const result = solveDivideConquer(switchCount);
      const recurrence = recurrenceSteps(switchCount);
      
      setSolutionPath(result.path as SwitchBit[][]);
      setDivideRecurrenceLines(recurrence);
      setStep(0);
      setTotalSteps(result.moves);
      
      setMoveDescriptions(result.descriptions);

      setIsRunning(true);
      setIsPlaying(false);
      updateStateFromPath(0, result.path as SwitchBit[][]);
      setStatusText(`Recursive solution found: ${result.moves} moves. T(${switchCount}) recurrence initialized.`);
      setToast({
        message: `Divide & Conquer logic loaded (${result.moves} moves)`,
        type: "info",
        visible: true,
      });

      if (result.moves === 0) {
        completeDivideRun(0);
        return;
      }
      return;
    }

    setIsRunning(true);
    setIsPlaying(false);
    setStep(0);
    setSolutionPath([]);
    const minMoves = Math.floor(Math.pow(2, switchCount + 1) / 3);
    setTotalSteps(minMoves);
    setStatusText(`Manual mode initialized. Target: ${minMoves} moves. Use 'Next' to proceed.`);
    setToast({
      message: `${config.title} initialized`,
      type: "info",
      visible: true,
    });
  }, [
    advanceBfsStep,
    clearPlaybackTimer,
    completeBfsRun,
    mode,
    switchCount,
    config.title,
    updateStateFromPath,
  ]);

  const handleReset = useCallback(() => {
    clearPlaybackTimer();
    setSwitches(Array(switchCount).fill(true));
    setSolutionPath([]);
    setMoveDescriptions([]);
    setDivideRecurrenceLines([]);
    setIsRunning(false);
    setIsPlaying(false);
    setStep(0);
    setTotalSteps(0);
    setStatusText("Ready to start");
    setToast({ message: "Reset complete", type: "info", visible: true });
  }, [clearPlaybackTimer, switchCount]);

  const handlePlay = useCallback(() => {
    if (mode === "bfs" && solutionPath.length > 0 && step < totalSteps) {
      setIsRunning(true);
      setIsPlaying(true);
      setStatusText("Running shortest-path playback...");
      startBfsPlayback();
      return;
    }

    if (mode === "divide" && solutionPath.length > 0 && step < totalSteps) {
      setIsRunning(true);
      setIsPlaying(true);
      setStatusText("Running divide-and-conquer recurrence...");
      startDividePlayback();
      return;
    }

    setIsPlaying(true);
  }, [
    mode,
    solutionPath.length,
    startBfsPlayback,
    step,
    totalSteps,
    divideRecurrenceLines.length,
    startDividePlayback,
  ]);

  const handlePause = useCallback(() => {
    if (mode === "bfs" || mode === "divide") {
      clearPlaybackTimer();
    }

    setIsPlaying(false);
    setStatusText("Paused");
  }, [clearPlaybackTimer, mode]);

  const handleStep = useCallback(() => {
    if ((mode === "bfs" || mode === "divide") && solutionPath.length > 0 && step < totalSteps) {
      clearPlaybackTimer();
      setIsPlaying(false);
      setIsRunning(true);
      if (mode === "bfs") advanceBfsStep();
      else advanceDivideStep();
      return;
    }

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
      setStatusText(`Step ${step + 1}: Processing...`);
    }
  }, [
    advanceBfsStep,
    advanceDivideStep,
    clearPlaybackTimer,
    divideRecurrenceLines.length,
    mode,
    solutionPath.length,
    step,
    totalSteps,
  ]);

  const progress = totalSteps > 0 ? (step / totalSteps) * 100 : 0;

  return (
    <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col gap-6 bg-background/50 overflow-y-auto">
      <TopBar
        title={config.title}
        info={config.algorithmInfo}
        onBack={onBack}
        switchCount={switchCount}
        onSwitchCountChange={handleSwitchCountChange}
        onStart={handleStart}
        onReset={handleReset}
        isRunning={isRunning}
      />

      {/* Dashboard Top Intelligence Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
        {/* Column 1: Mission Stats */}
        <GlassCard className="p-6 border-white/5 bg-white/[0.02]" glowColor={config.glowColor}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mission Progress</span>
              <span className="text-xl font-mono font-bold text-neon-blue">{step} <span className="text-white/20">/</span> {totalSteps}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-green transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-col mt-2">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">System Status</span>
              <p className="mt-1.5 text-sm font-medium text-neon-green line-clamp-2 min-h-[40px] leading-relaxed">
                {statusText}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Column 2: Execution Log - Relocated for better visibility */}
        <GlassCard className="p-6 border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-[200px]" glowColor={config.glowColor}>
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Execution Log</span>
            <span className="text-[9px] font-mono text-neon-blue bg-neon-blue/5 px-2 py-0.5 rounded border border-neon-blue/20">
              {moveDescriptions.length} OPS
            </span>
          </div>
          <div 
            ref={moveListRef}
            className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2"
          >
            {moveDescriptions.length > 0 ? (
              moveDescriptions.map((desc, i) => {
                const isCurrent = i === step - 1;
                const isPast = i < step - 1;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border transition-all duration-300",
                    isCurrent ? "bg-neon-blue/10 border-neon-blue/40" : "bg-white/[0.01] border-white/5",
                    isPast && "opacity-20"
                  )}>
                    <span className={cn("text-[9px] font-mono font-bold shrink-0 w-4", isCurrent ? "text-neon-blue" : "text-white/20")}>
                      {i + 1}
                    </span>
                    <span className={cn("text-[10px] font-bold truncate", isCurrent ? "text-neon-blue" : "text-white/40")}>
                      {desc}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] text-white/20 italic text-center mt-4">System Idle: Awaiting Mission Initialization</p>
            )}
          </div>
        </GlassCard>

        {/* Column 3: System Controls */}
        <GlassCard className="p-6 border-white/5 bg-white/[0.02]" glowColor={config.glowColor}>
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Operation Control</span>
            <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/10 shadow-inner">
              <button 
                onClick={isPlaying ? handlePause : handlePlay}
                className={cn(
                  "p-3 rounded-xl transition-all duration-300 group relative",
                  isPlaying ? "bg-neon-red/10 text-neon-red hover:bg-neon-red/20" : "bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20",
                )}
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {isPlaying ? "Pause" : "Auto Play"}
                </span>
              </button>
              
              <div className="w-px h-8 bg-white/5 mx-1" />
              
              <button 
                onClick={handleStep}
                disabled={isPlaying}
                className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all duration-300 group relative"
              >
                <StepIcon className="w-6 h-6" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Next Step
                </span>
              </button>

              <button 
                onClick={handleReset}
                className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 group relative"
              >
                <ResetIcon className="w-6 h-6" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Reset System
                </span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Compact Full Width Main Console */}
      <div className="flex flex-col gap-8 w-full">
        <GlassCard
          className="p-6 flex flex-col items-center justify-start border-white/5 shadow-2xl relative overflow-hidden h-fit py-12"
          glowColor={config.glowColor}
        >
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">Array Active</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 w-full mt-6">
            {switches.map((isOn, index) => (
              <SecuritySwitch
                key={index}
                id={index + 1}
                isOn={isOn}
                onToggle={() => handleToggle(index)}
                disabled={mode !== "play" || isRunning}
                size={switchCount > 8 ? "sm" : switchCount > 5 ? "md" : "lg"}
              />
            ))}
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-4 text-[10px] font-mono text-white/10 uppercase tracking-widest">
            <span>Security Level: Alpha</span>
            <div className="w-px h-3 bg-white/10" />
            <span>v1.0.7-stable</span>
          </div>
        </GlassCard>

        {/* Recurrence Model (D&C only) - Now at the bottom */}
        {mode === "divide" && divideRecurrenceLines.length > 0 && (
          <GlassCard className="p-6 bg-white/[0.02] border-white/5 w-full" glowColor="red">
            <div className="flex flex-col md:flex-row items-start gap-12">
              <div className="shrink-0">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-4">Recurrence Logic</span>
                <div className="px-4 py-2 rounded-lg bg-neon-red/5 border border-neon-red/20">
                  <p className="text-[10px] font-mono text-neon-red italic">T(n) = T(n-1) + 2T(n-2) + 1</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {divideRecurrenceLines.map((line, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.01] border border-white/5">
                    <p className="text-[11px] font-mono text-white/50">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
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
