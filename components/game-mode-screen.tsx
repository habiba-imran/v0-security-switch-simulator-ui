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
    title: "Brute Force Visualization",
    algorithmInfo:
      "Brute Force using BFS explores all states level by level, guaranteed to find the shortest solution.",
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
  const [switchCount, setSwitchCount] = useState(3);
  const [switches, setSwitches] = useState<boolean[]>(() =>
    Array(3).fill(true)
  );
  const [solutionPath, setSolutionPath] = useState<SwitchBit[][]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [statusText, setStatusText] = useState("Click INITIALIZE to begin. You can adjust the array size in the control panel.");
  const [divideRecurrenceLines, setDivideRecurrenceLines] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [moveDescriptions, setMoveDescriptions] = useState<string[]>([]);
  const moveListRef = useRef<HTMLDivElement>(null);
  const [violationHistory, setViolationHistory] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [hasShownEfficiencyWarning, setHasShownEfficiencyWarning] = useState(false);

  // Auto-scroll logic for feeds
  useEffect(() => {
    if (moveListRef.current) {
      moveListRef.current.scrollTo({
        top: moveListRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [moveDescriptions, violationHistory]);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    visible: boolean;
    duration?: number;
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
      const algoPrefix = mode === "bfs" ? "[Brute Force Search]" : "[Recursive D&C]";
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
      message: "Brute Force completed with shortest path",
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
    setIsWon(false);
    setHasShownEfficiencyWarning(false);
    setStatusText("Click INITIALIZE to begin. You can adjust the array size in the control panel.");
  }, [clearPlaybackTimer]);

  const handleToggle = useCallback(
    (index: number) => {
      if (mode !== "play" || !isRunning || isWon) return;

      const n = switches.length;
      let canToggle = false;
      let errorMsg = "";

      if (index === n - 1) {
        canToggle = true; // Rule 1
      } else {
        // Rule 2 Check
        const nextOn = switches[index + 1];
        const othersOff = switches.slice(index + 2).every(s => !s);

        if (nextOn && othersOff) {
          canToggle = true;
        } else {
          errorMsg = `Violation: S${index + 2} must be ON and all switches to its right must be OFF.`;
        }
      }

      if (!canToggle) {
        setViolationHistory((prev) => [...prev, errorMsg]);

        setStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep > totalSteps && totalSteps > 0 && !hasShownEfficiencyWarning) {
            setHasShownEfficiencyWarning(true);
            setToast({
              message: "Efficiency Target Failed: You have exceeded the minimum moves required.",
              type: "error",
              visible: true,
            });
          }
          return nextStep;
        });

        return;
      }

      setSwitches((prev) => {
        const newSwitches = [...prev];
        newSwitches[index] = !newSwitches[index];

        if (newSwitches.every(s => !s)) {
          const isEfficient = (step + 1) <= totalSteps;
          setIsWon(true);
          setIsRunning(false);

          if (isEfficient) {
            setStatusText("MISSION SUCCESS: Security Array Secured. Optimal deactivation achieved.");
            setToast({
              message: "Mission Complete: System Fully Deactivated. Perfect Efficiency.",
              type: "success",
              visible: true,
              duration: 999999,
            });
          } else {
            setStatusText("CONGRATULATIONS: Puzzle Solved. System could not be fully deactivated due to efficiency target failure.");
            setToast({
              message: "Puzzle Solved. Note: Full deactivation failed (exceeded minimum goal).",
              type: "info",
              visible: true,
              duration: 999999,
            });
          }
        }

        return newSwitches;
      });

      setStep((prev) => {
        const nextStep = prev + 1;
        if (nextStep > totalSteps && totalSteps > 0 && !switches.every(s => !s) && !hasShownEfficiencyWarning) {
          setHasShownEfficiencyWarning(true);
          setToast({
            message: "Efficiency Target Failed: You have exceeded the minimum moves required.",
            type: "error",
            visible: true,
          });
        }
        return nextStep;
      });

      if (switches.some(s => s)) {
        setStatusText(`Toggled switch S${index + 1}`);
      }
    },
    [mode, isRunning, switches, totalSteps, isWon, hasShownEfficiencyWarning]
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
        message: `Brute Force solution found in ${result.minMoves} moves`,
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
    setStatusText(`Manual mode initialized. Target: ${minMoves} moves.`);
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
    setViolationHistory([]);
    setIsRunning(false);
    setIsPlaying(false);
    setIsWon(false);
    setHasShownEfficiencyWarning(false);
    setStep(0);
    setTotalSteps(0);
    setStatusText("Click INITIALIZE to begin. You can adjust the array size in the control panel.");
    setToast({ message: "Reset complete", type: "info", visible: true, duration: 800 });
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
        onBack={onBack}
        step={step}
        totalSteps={totalSteps}
        progress={progress}
        statusText={statusText}
      />

      {/* Dashboard Top Intelligence Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
        {/* Column 1: Rules & Protocol (Relocated) */}
        <GlassCard className="p-6 border-white/5 bg-white/[0.02]" glowColor="gold">
          <div className="flex flex-col gap-4 h-full">
            <span className="text-[10px] font-black text-neon-green/80 uppercase tracking-[0.2em] border-b border-white/5 pb-2 font-sans">Operational Protocol</span>

            <ul className="space-y-4 flex-1 mt-2">
              <li className="flex gap-3 text-[11px] text-white/50 leading-relaxed font-mono">
                <span className="text-neon-green font-bold">01.</span>
                <span>Rightmost switch toggles <span className="text-white/80 font-bold uppercase tracking-tighter">any time</span>.</span>
              </li>
              <li className="flex gap-3 text-[11px] text-white/50 leading-relaxed font-mono">
                <span className="text-neon-green font-bold">02.</span>
                <span>Toggle others <span className="text-white/80 font-bold uppercase tracking-tighter">ONLY</span> if right neighbor is ON and others to the right are OFF.</span>
              </li>
              <li className="flex gap-3 text-[11px] text-white/50 leading-relaxed font-mono">
                <span className="text-neon-green/60 font-bold uppercase tracking-widest">Goal.</span>
                <span>Transition from <span className="text-white/80 font-bold">111...</span> to <span className="text-white/80 font-bold">000...</span></span>
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Column 2: Execution Log / Violation Feed */}
        <GlassCard className="p-6 border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-[200px]" glowColor={mode === "play" ? "red" : config.glowColor}>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">
              {mode === "play" ? "Violation Feed" : "Execution Log"}
            </span>
            <span className={cn(
              "text-[9px] font-mono font-bold px-2 py-0.5 rounded border tracking-tight",
              mode === "play"
                ? "text-neon-red bg-neon-red/5 border-neon-red/20 shadow-[0_0_8px_rgba(255,88,88,0.1)]"
                : "text-neon-blue bg-neon-blue/5 border-neon-blue/20 shadow-[0_0_8px_rgba(88,166,255,0.1)]"
            )}>
              {mode === "play" ? violationHistory.length : moveDescriptions.length} OPS
            </span>
          </div>
          <div
            ref={moveListRef}
            className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2"
          >
            {mode === "play" ? (
              violationHistory.length > 0 ? (
                violationHistory.map((error, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl border border-neon-red/20 bg-neon-red/5">
                    <span className="text-[10px] font-mono font-bold text-neon-red shrink-0 mt-0.5">!</span>
                    <span className="text-[11px] font-bold text-neon-red/80 leading-tight font-mono tracking-tight">
                      {error}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] font-bold text-white/10 italic text-center mt-6 tracking-widest uppercase font-sans">Protocol Sync: Nominal</p>
              )
            ) : (
              moveDescriptions.length > 0 ? (
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
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <span className={cn("text-[11px] font-bold truncate font-mono", isCurrent ? "text-neon-blue" : "text-white/40")}>
                        {desc}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] font-bold text-white/10 italic text-center mt-6 tracking-widest uppercase font-sans">System Idle</p>
              )
            )}
          </div>
        </GlassCard>

        {/* Column 3: Array Control */}
        <GlassCard className="p-6 border-white/5 bg-white/[0.02]" glowColor={config.glowColor}>
          <div className="flex flex-col gap-5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">Hardware Config</span>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 rounded-xl border border-white/10 p-2.5 flex flex-col items-center justify-center">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1 font-sans">Array Size</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={switchCount}
                    onChange={(e) => handleSwitchCountChange(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    disabled={isRunning || isWon}
                    className="bg-transparent text-[14px] font-mono font-bold text-gold/80 focus:outline-none w-full text-center"
                  />
                </div>
                <button
                  onClick={handleStart}
                  disabled={isRunning || isWon}
                  className={cn(
                    "flex-[2] py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-300 font-sans",
                    (!isRunning && !isWon)
                      ? "bg-neon-green text-background shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:scale-[1.02] active:scale-95"
                      : "bg-white/5 text-white/10 grayscale cursor-not-allowed border border-white/5"
                  )}
                >
                  Initialize
                </button>
              </div>

              {/* Playback Controls - Hidden in Manual Mode */}
              {mode !== "play" && (
                <div className="flex items-center justify-between gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className={cn(
                      "flex-1 p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center",
                      isPlaying ? "bg-neon-red/10 text-neon-red hover:bg-neon-red/20 shadow-[0_0_15px_rgba(255,88,88,0.1)]" : "bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 shadow-[0_0_15px_rgba(88,166,255,0.1)]",
                    )}
                  >
                    {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleStep}
                    disabled={isPlaying}
                    className="flex-1 p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-10 transition-all duration-300 flex items-center justify-center border border-white/5"
                  >
                    <StepIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex-1 p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center border border-white/5"
                  >
                    <ResetIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Manual Mode Reset Only */}
              {mode === "play" && (
                <button
                  onClick={handleReset}
                  className="w-full py-4 rounded-xl bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] font-sans"
                >
                  <ResetIcon className="w-4 h-4" />
                  Reset System
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Compact Full Width Main Console */}
      <div className="flex flex-col gap-8 w-full">
        <GlassCard
          className="p-4 flex flex-col items-center justify-start border-white/5 shadow-2xl relative overflow-hidden h-fit py-8"
          glowColor={config.glowColor}
        >
          <div className="absolute top-4 left-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            <span className="text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">Array Active</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 w-full mt-4">
            {switches.map((isOn, index) => (
              <SecuritySwitch
                key={index}
                id={index + 1}
                isOn={isOn}
                onToggle={() => handleToggle(index)}
                disabled={mode !== "play" || !isRunning}
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
        duration={toast.duration}
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
