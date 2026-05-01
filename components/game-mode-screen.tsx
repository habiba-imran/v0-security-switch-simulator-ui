"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TopBar } from "./top-bar";
import { ControlPanel } from "./control-panel";
import { SecuritySwitch } from "./security-switch";
import { ToastNotification } from "./toast-notification";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Activity, Network } from "lucide-react";
import { solveSwitchesBruteforce, type SwitchBit, type BruteForceResult, type SearchNode } from "@/lib/bruteforce-bfs";
import { solveDivideConquer, divideConquerSwitches, recurrenceSteps, type DivideConquerResult } from "@/lib/divide-conquer";
import { TheoryPanel } from "./theory-panel";
import { BFS_PSEUDOCODE, DC_PSEUDOCODE } from "@/lib/pseudocode";
import { ComplexityGraph } from "./complexity-graph";
import { RecursiveTreeView } from "./recursive-tree-view";
import { StateSpaceTree } from "./state-space-tree";

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
  const [currentLine, setCurrentLine] = useState(-1);
  const [algoStats, setAlgoStats] = useState<{label: string, value: string | number, description: string}[]>([]);
  const [dcStepIndices, setDcStepIndices] = useState<number[]>([]);
  const [searchTree, setSearchTree] = useState<SearchNode[]>([]);
  const [efficiencySummary, setEfficiencySummary] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isTreeOpen, setIsTreeOpen] = useState(false);

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

  // Auto-initialize on mount removed per user request for manual control

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
      
      if (nextStep === totalSteps) {
        setCurrentLine(6);
      } else {
        setCurrentLine(2);
        setTimeout(() => setCurrentLine(5), 300);
      }

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

      if (dcStepIndices[nextStep - 1] !== undefined) {
        setCurrentLine(dcStepIndices[nextStep - 1]);
      }

      if (nextStep >= totalSteps) {
        completeDivideRun(totalSteps);
      }

      return nextStep;
    });
  }, [completeDivideRun, solutionPath, totalSteps, updateStateFromPath, dcStepIndices]);

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
    
    if (mode === "bfs") {
      const result = solveSwitchesBruteforce(count);
      setSearchTree(result.searchTree);
    } else {
      setSearchTree([]);
    }

    setIsRunning(false);
    setIsPlaying(false);
    setStep(0);
    setTotalSteps(0);
    setIsWon(false);
    setHasShownEfficiencyWarning(false);
    setStatusText("");
  }, [clearPlaybackTimer, mode]);

  useEffect(() => {
    if (mode === "bfs" && searchTree.length === 0) {
      const result = solveSwitchesBruteforce(switchCount);
      setSearchTree(result.searchTree);
    }
  }, [mode, switchCount, searchTree.length]);

  const handleToggle = useCallback(
    (index: number) => {
      if (mode !== "play" || !isRunning || isWon) return;

      const n = switches.length;
      let canToggle = false;
      let errorMsg = "";

      if (index === n - 1) {
        canToggle = true;
      } else {
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

    const bfsTest = solveSwitchesBruteforce(switchCount);
    const dcTest = solveDivideConquer(switchCount);
    const cfTest = Math.floor((Math.pow(2, switchCount + 1) - (1 + Math.pow(-1, switchCount))) / 3);
    
    const mismatch = bfsTest.minMoves !== dcTest.moves || dcTest.moves !== cfTest;
    
    if (mismatch) {
      console.error(`ALGORITHM MISMATCH for n=${switchCount}:`, { BFS: bfsTest.minMoves, DC: dcTest.moves, CF: cfTest });
      setToast({
        message: `LOGIC ERROR: Results mismatch! BFS:${bfsTest.minMoves}, DC:${dcTest.moves}, CF:${cfTest}`,
        type: "error",
        visible: true,
      });
      return;
    }

    setIsWon(false);
    setHasShownEfficiencyWarning(false);
    setViolationHistory([]);
    setHasInitialized(true);

    if (mode === "bfs") {
      const result = solveSwitchesBruteforce(switchCount) as BruteForceResult;
      setSolutionPath(result.path);
      setSearchTree(result.searchTree);
      setStep(0);
      setTotalSteps(result.minMoves);
      setCurrentLine(0);

      setAlgoStats([
        { label: "States Explored", value: result.stats.totalVisited, description: "Total unique configurations explored level-by-level." },
        { label: "Max Queue Size", value: result.stats.maxQueueSize, description: "Peak memory usage for the BFS frontier." },
        { label: "Theoretical Space", value: `${switchCount * Math.pow(2, switchCount)} bits`, description: "Asymptotic space requirement Θ(n·2ⁿ)." },
        { label: "Time Complexity", value: "Θ(n²·2ⁿ)", description: "Strict asymptotic bound for BFS state-space search." }
      ]);

      setEfficiencySummary(`BFS explores the state-space of 2ⁿ (${Math.pow(2, switchCount)}) configurations. For each configuration, it validates moves in O(n²) time. This results in a total time complexity of Θ(n²·2ⁿ). It guarantees the optimal path by exploring level-by-level.`);

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
      setStatusText(`Shortest path found: ${result.minMoves} moves. Click 'Next' to step through the shortest path.`);
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
      const result = solveDivideConquer(switchCount) as DivideConquerResult;
      const recurrence = recurrenceSteps(switchCount);

      setSolutionPath(result.path as SwitchBit[][]);
      setDivideRecurrenceLines(recurrence);
      setStep(0);
      setTotalSteps(result.moves);
      setDcStepIndices(result.stepIndices);
      setCurrentLine(-1);

      setAlgoStats([
        { label: "Recursive Calls", value: result.stats.totalCalls, description: "Total invocations (verified by M(n) recurrence)." },
        { label: "Max Stack Depth", value: switchCount, description: "Linear space growth based on recursion depth." },
        { label: "Theoretical Space", value: `${switchCount} units`, description: "Asymptotic space requirement O(n)." },
        { label: "Time Complexity", value: "Θ(2ⁿ) / O(n)", description: "Θ(2ⁿ) without memoization; O(n) with memoization." }
      ]);

      setEfficiencySummary(`The recursive approach breaks the problem into sub-problems of size n-1 and n-2. The recurrence T(n) = T(n-1) + 2T(n-2) + 1 leads to an exponential growth of Θ(2ⁿ). With memoization, we reduce the time complexity to linear O(n) while maintaining O(n) space for the recursion stack.`);

      setMoveDescriptions(result.descriptions);

      setIsRunning(true);
      setIsPlaying(false);
      updateStateFromPath(0, result.path as SwitchBit[][]);
      setStatusText(`Recursive solution found: ${result.moves} moves. Click 'Next' to trace the logic.`);
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
    setTotalSteps(cfTest);
    setStatusText(`Manual mode initialized. Target: ${cfTest} moves. (System Logic Verified)`);
  }, [
    advanceBfsStep,
    advanceDivideStep,
    clearPlaybackTimer,
    completeBfsRun,
    completeDivideRun,
    mode,
    switchCount,
    updateStateFromPath,
  ]);

  const handleReset = useCallback(() => {
    clearPlaybackTimer();
    setHasInitialized(false);
    setSwitches(Array(switchCount).fill(true));
    setSolutionPath([]);
    setSearchTree([]);
    setEfficiencySummary("");
    setMoveDescriptions([]);
    setDivideRecurrenceLines([]);
    setViolationHistory([]);
    setIsRunning(false);
    setIsPlaying(false);
    setIsWon(false);
    setHasShownEfficiencyWarning(false);
    setStep(0);
    setTotalSteps(0);
    setStatusText("");
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

  const handleJumpToStep = useCallback((targetStep: number) => {
    if (solutionPath.length === 0) return;
    clearPlaybackTimer();
    setIsPlaying(false);
    setIsRunning(true);
    const safeStep = Math.min(targetStep, totalSteps);
    setStep(safeStep);
    updateStateFromPath(safeStep, solutionPath);
    setStatusText(`Jumped to Step ${safeStep}`);
  }, [clearPlaybackTimer, solutionPath, totalSteps, updateStateFromPath]);

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
        <GlassCard className="p-6 border-white/5 bg-white/[0.02] h-[250px]" glowColor={config.glowColor}>
          <div className="flex flex-col gap-5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2 font-sans">Hardware Config</span>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1 bg-black/40 rounded-xl border border-white/10 p-2 flex flex-col items-center justify-center">
                  <label className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5 font-sans">Array Size</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={switchCount}
                    onChange={(e) => handleSwitchCountChange(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                    disabled={isRunning || isWon}
                    className="bg-transparent text-[13px] font-mono font-bold text-gold/80 focus:outline-none w-full text-center"
                  />
                </div>
                <button
                  onClick={handleStart}
                  disabled={isRunning || isWon}
                  className={cn(
                    "flex-1 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 font-sans border",
                    (!isRunning && !isWon)
                      ? "border-neon-green/30 bg-neon-green/5 text-neon-green shadow-[0_0_15px_rgba(0,255,136,0.1)] hover:bg-neon-green/10 hover:border-neon-green/50 hover:scale-[1.02] active:scale-95"
                      : "border-white/5 bg-white/5 text-white/10 cursor-not-allowed"
                  )}
                >
                  Initialize
                </button>
              </div>

               {mode !== "play" && (
                 <div className="flex items-center justify-between gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                   <button
                     onClick={handleStep}
                     disabled={!hasInitialized || isWon}
                     className="flex-[3] py-3 rounded-xl bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 shadow-[0_0_15px_rgba(88,166,255,0.1)] flex items-center justify-center gap-2 border border-neon-blue/20 transition-all duration-300 group disabled:opacity-20"
                   >
                     <span className="text-[9px] font-black uppercase tracking-widest">Next Step</span>
                   </button>

                   <button
                     onClick={handleReset}
                     className="flex-1 py-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center justify-center border border-white/5"
                   >
                   </button>
                 </div>
               )}

              {mode === "play" && (
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] font-sans"
                >
                  Reset System
                </button>
              )}
            </div>
          </div>
        </GlassCard>

        {mode === "play" ? (
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] h-[250px]" glowColor="gold">
            <div className="flex flex-col gap-4 h-full">
              <span className="text-[10px] font-black text-neon-green/80 uppercase tracking-[0.2em] border-b border-white/5 pb-2 font-sans">Operational Protocol</span>
              <ul className="space-y-3 flex-1 mt-2">
                <li className="flex gap-3 text-[10px] text-white/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold">01.</span>
                  <span>Rightmost switch toggles <span className="text-white/80 font-bold uppercase tracking-tighter">any time</span>.</span>
                </li>
                <li className="flex gap-3 text-[10px] text-white/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold">02.</span>
                  <span>Toggle others <span className="text-white/80 font-bold uppercase tracking-tighter">ONLY</span> if right neighbor is ON and others to the right are OFF.</span>
                </li>
                <li className="flex gap-3 text-[10px] text-white/50 leading-relaxed font-mono">
                  <span className="text-gold font-bold uppercase tracking-widest">Goal.</span>
                  <span>Transition from <span className="text-white/80 font-bold">111...</span> to <span className="text-white/80 font-bold">000...</span></span>
                </li>
              </ul>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] h-[250px]" glowColor={config.glowColor}>
            <div className="flex flex-col gap-4 h-full">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2 font-sans">Hardware Array</span>
              <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
                {switches.map((isOn, index) => (
                  <SecuritySwitch
                    key={index}
                    id={index + 1}
                    isOn={isOn}
                    onToggle={() => {}} 
                    disabled={true}
                    size="md"
                  />
                ))}
              </div>
              <div className="mt-auto pt-4 flex items-center justify-between opacity-20 text-[8px] font-mono uppercase tracking-widest">
                <span>Array Size: {switchCount} / 05</span>
                <span>Active</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Column 3: Execution Log (BFS/DC) or System Overview (Play) */}
        {mode !== "play" ? (
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] overflow-hidden flex flex-col h-[250px]" glowColor={config.glowColor}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">Execution Log</span>
                {moveDescriptions.length > 0 && (
                  <select 
                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[9px] font-mono text-white/40 focus:outline-none hover:border-neon-blue/30 transition-colors mt-1"
                    onChange={(e) => handleJumpToStep(parseInt(e.target.value))}
                    value={step}
                  >
                    <option value="0">Initial State</option>
                    {moveDescriptions.map((desc, i) => (
                      <option key={i} value={i + 1}>Step {i + 1}: {desc}</option>
                    ))}
                  </select>
                )}
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-neon-blue/20 text-neon-blue bg-neon-blue/5">
                {moveDescriptions.length} OPS
              </span>
            </div>
            <div ref={moveListRef} className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {moveDescriptions.map((desc, i) => {
                const isCurrent = i === step - 1;
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border transition-all duration-300",
                    isCurrent ? "bg-neon-blue/10 border-neon-blue/40" : "bg-white/[0.01] border-white/5",
                    i < step - 1 && "opacity-20"
                  )}>
                    <span className="text-[9px] font-mono font-bold text-white/20 w-4">{(i + 1).toString().padStart(2, '0')}</span>
                    <span className={cn("text-[11px] font-bold truncate font-mono", isCurrent ? "text-neon-blue" : "text-white/40")}>{desc}</span>
                  </div>
                );
              })}
              {moveDescriptions.length === 0 && (
                <p className="text-[10px] font-bold text-white/10 italic text-center mt-12 uppercase tracking-widest">Awaiting Trace</p>
              )}
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 border-white/5 bg-white/[0.02] flex flex-col h-[250px]" glowColor={config.glowColor}>
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">
                  Live Violation Feed
                </span>
                {hasInitialized && (
                  <span className="text-[8px] font-mono text-neon-red/60 uppercase tracking-widest">
                    {violationHistory.length} ERRORS
                  </span>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {!hasInitialized ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />
                    <p className="text-[9px] text-white uppercase tracking-widest font-mono">Awaiting System Init</p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                    {violationHistory.map((error, i) => (
                      <div key={i} className="flex gap-2 text-[9px] font-mono leading-tight border-b border-white/[0.02] pb-1 animate-in fade-in slide-in-from-left-2">
                        <span className="text-neon-red font-bold">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className="text-white/60">{error}</span>
                      </div>
                    ))}
                    {violationHistory.length === 0 && (
                      <p className="text-[10px] text-white/10 italic text-center mt-12 uppercase tracking-widest">System Log Clear</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8 w-full">
        {/* Play Mode Switches (Full Width) */}
        {mode === "play" && (
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
                  disabled={!isRunning}
                  size={switchCount > 8 ? "sm" : switchCount > 5 ? "md" : "lg"}
                />
              ))}
            </div>
          </GlassCard>
        )}

        {/* Recurrence Model (D&C only) - Now at the bottom */}
        {mode === "divide" && divideRecurrenceLines.length > 0 && (
          <GlassCard className="p-6 bg-white/[0.02] border-white/5 w-full" glowColor="red">
            <div className="flex flex-col md:flex-row items-start gap-12">
              <div className="shrink-0">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-4">Recurrence Logic</span>
                <div className="px-4 py-2 rounded-lg bg-neon-red/5 border border-neon-red/20">
                  <p className="text-[10px] font-mono text-neon-red italic">M(n) = M(n-1) + 2M(n-2) + 1</p>
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

        {/* Theory & Complexity Section (New) */}
        <TheoryPanel
          mode={mode}
          pseudocode={mode === "bfs" ? BFS_PSEUDOCODE : DC_PSEUDOCODE}
          currentLine={currentLine}
          stats={algoStats}
          efficiencySummary={efficiencySummary}
        />

        {/* Theoretical Visualization Section (Collapsible) */}
        {mode !== "play" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
            <div className="flex flex-col gap-4">
              <GlassCard className={cn(
                "p-0 border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500",
                isGraphOpen ? "ring-1 ring-neon-blue/20" : "hover:bg-white/[0.04]"
              )} glowColor="blue">
                <button 
                  onClick={() => setIsGraphOpen(!isGraphOpen)}
                  className="flex items-center justify-between p-6 w-full group transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isGraphOpen ? "bg-neon-blue/20 text-neon-blue" : "bg-white/5 text-white/20"
                    )}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">Performance Data</span>
                      <span className={cn(
                        "text-xs font-black uppercase tracking-widest font-sans transition-colors",
                        isGraphOpen ? "text-neon-blue" : "text-white/60 group-hover:text-white"
                      )}>
                        Scalability Projection
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     {isGraphOpen && <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />}
                     {isGraphOpen ? <ChevronUp className="w-5 h-5 text-neon-blue/40" /> : <ChevronDown className="w-5 h-5 text-white/10 group-hover:text-neon-blue/40 transition-colors" />}
                  </div>
                </button>
                {isGraphOpen && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                      <ComplexityGraph currentN={switchCount} />
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>

            <div className="flex flex-col gap-4">
              <GlassCard className={cn(
                "p-0 border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500",
                isTreeOpen ? "ring-1 ring-neon-red/20" : "hover:bg-white/[0.04]"
              )} glowColor="red">
                <button 
                  onClick={() => setIsTreeOpen(!isTreeOpen)}
                  className="flex items-center justify-between p-6 w-full group transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isTreeOpen ? "bg-neon-red/20 text-neon-red" : "bg-white/5 text-white/20"
                    )}>
                      <Network className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">Logical Map</span>
                      <span className={cn(
                        "text-xs font-black uppercase tracking-widest font-sans transition-colors",
                        isTreeOpen ? "text-neon-red" : "text-white/60 group-hover:text-white"
                      )}>
                        {mode === "bfs" ? "State-Space Tree" : "Recursive structure"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     {isTreeOpen && <div className="w-1.5 h-1.5 rounded-full bg-neon-red animate-pulse" />}
                     {isTreeOpen ? <ChevronUp className="w-5 h-5 text-neon-red/40" /> : <ChevronDown className="w-5 h-5 text-white/10 group-hover:text-neon-red/40 transition-colors" />}
                  </div>
                </button>
                {isTreeOpen && (
                  <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                      {mode === "bfs" ? (
                        <StateSpaceTree n={switchCount} searchTree={searchTree} />
                      ) : (
                        <RecursiveTreeView currentN={switchCount} />
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
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
