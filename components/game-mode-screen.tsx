"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TopBar } from "./top-bar";
import { ControlPanel } from "./control-panel";
import { SecuritySwitch } from "./security-switch";
import { ToastNotification } from "./toast-notification";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Activity, Network, Terminal, BarChart3, Maximize2, X } from "lucide-react";
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

const ResetIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

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
  const [algoStats, setAlgoStats] = useState<{ label: string, value: string | number, description: string }[]>([]);
  const [dcStepIndices, setDcStepIndices] = useState<number[]>([]);
  const [searchTree, setSearchTree] = useState<SearchNode[]>([]);
  const [efficiencySummary, setEfficiencySummary] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

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
  useEffect(() => {
    if (mode === "bfs") {
      const result = solveSwitchesBruteforce(switchCount);
      setSearchTree(result.searchTree);
      setSolutionPath(result.path);
      setTotalSteps(result.minMoves);
      setAlgoStats([
        { label: "States Explored", value: result.stats.totalVisited, description: "Total unique configurations explored level-by-level." },
        { label: "Max Queue Size", value: result.stats.maxQueueSize, description: "Peak memory usage for the BFS frontier." },
        { label: "Theoretical Space", value: `${switchCount * Math.pow(2, switchCount)} bits`, description: "Asymptotic space requirement Θ(n·2ⁿ)." },
        { label: "Time Complexity", value: "Θ(n²·2ⁿ)", description: "Strict asymptotic bound for BFS state-space search." }
      ]);
      setEfficiencySummary(`BFS explores the state-space of 2ⁿ (${Math.pow(2, switchCount)}) configurations. For each configuration, it validates moves in O(n²) time. This results in a total time complexity of Θ(n²·2ⁿ). It guarantees the optimal path by exploring level-by-level.`);
    } else if (mode === "divide") {
      const result = solveDivideConquer(switchCount);
      setTotalSteps(result.moves);
      setAlgoStats([
        { label: "Recursive Calls", value: result.stats.totalCalls, description: "Total invocations (verified by M(n) recurrence)." },
        { label: "Max Stack Depth", value: switchCount, description: "Linear space growth based on recursion depth." },
        { label: "Theoretical Space", value: `${switchCount} units`, description: "Asymptotic space requirement O(n)." },
        { label: "Time Complexity", value: "Θ(2ⁿ) / O(n)", description: "Θ(2ⁿ) without memoization; O(n) with memoization." }
      ]);
      setEfficiencySummary(`The recursive approach breaks the problem into sub-problems of size n-1 and n-2. The recurrence T(n) = T(n-1) + 2T(n-2) + 1 leads to an exponential growth of Θ(2ⁿ). With memoization, we reduce the time complexity to linear O(n) while maintaining O(n) space for the recursion stack.`);
    }
  }, [mode, switchCount]);
  const config = modeConfig[mode];

  const clearPlaybackTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateStateFromPath = useCallback((moveIndex: number, path: SwitchBit[][]) => {
    const state = path[moveIndex];
    if (!state) return;
    setSwitches(state.map((bit) => bit === 1));
    const previous = moveIndex > 0 ? path[moveIndex - 1] : null;
    if (previous) {
      const toggledIndex = state.findIndex((bit, index) => bit !== previous[index]);
      if (toggledIndex >= 0) {
        const action = state[toggledIndex] === 1 ? "ON" : "OFF";
        setStatusText(`Move ${moveIndex}: Turned S${toggledIndex + 1} ${action}`);
      }
    }
  }, []);

  const advanceBfsStep = useCallback(() => {
    setStep((prev) => {
      if (prev >= totalSteps) {
        setIsPlaying(false);
        setIsRunning(false);
        return prev;
      }
      const nextStep = prev + 1;
      updateStateFromPath(nextStep, solutionPath);
      setCurrentLine((nextStep % 4) + 6);
      if (nextStep === totalSteps) {
        setIsPlaying(false);
        setIsRunning(false);
      }
      return nextStep;
    });
  }, [solutionPath, totalSteps, updateStateFromPath]);

  const advanceDivideStep = useCallback(() => {
    setStep((prev) => {
      if (prev >= totalSteps) {
        setIsPlaying(false);
        setIsRunning(false);
        return prev;
      }
      const nextStep = prev + 1;
      updateStateFromPath(nextStep, solutionPath);
      if (dcStepIndices[nextStep - 1] !== undefined) {
        setCurrentLine(dcStepIndices[nextStep - 1]);
      }
      if (nextStep === totalSteps) {
        setIsPlaying(false);
        setIsRunning(false);
      }
      return nextStep;
    });
  }, [solutionPath, totalSteps, updateStateFromPath, dcStepIndices]);

  const startBfsPlayback = useCallback(() => {
    if (timerRef.current || step >= totalSteps) return;
    timerRef.current = setInterval(() => advanceBfsStep(), 650);
  }, [advanceBfsStep, step, totalSteps]);

  const startDividePlayback = useCallback(() => {
    if (timerRef.current || step >= totalSteps) return;
    timerRef.current = setInterval(() => advanceDivideStep(), 650);
  }, [advanceDivideStep, step, totalSteps]);

  useEffect(() => {
    if (isPlaying) {
      if (mode === "bfs") startBfsPlayback();
      else if (mode === "divide") startDividePlayback();
    } else {
      clearPlaybackTimer();
    }
    return () => clearPlaybackTimer();
  }, [isPlaying, mode, startBfsPlayback, startDividePlayback, clearPlaybackTimer]);

  const handleSwitchCountChange = useCallback((count: number) => {
    clearPlaybackTimer();
    setSwitchCount(count);
    setSwitches(Array(count).fill(true));
    setSolutionPath([]);
    setMoveDescriptions([]);
    setDivideRecurrenceLines([]);
    setSearchTree([]);
    setIsRunning(false);
    setIsPlaying(false);
    setStep(0);
    setTotalSteps(0);
    setIsWon(false);
    setHasShownEfficiencyWarning(false);
    setHasInitialized(false);
  }, [clearPlaybackTimer]);

  const handleToggle = useCallback((index: number) => {
    if (mode !== "play" || !isRunning || isWon) return;
    if (step >= totalSteps && totalSteps > 0) {
      setToast({ message: "Protocol Violation: Efficiency limit exceeded. No further operations allowed.", type: "error", visible: true });
      setStatusText("SYSTEM LOCKED: Move limit exceeded. Reset to retry.");
      setIsRunning(false);
      return;
    }
    const n = switches.length;
    let canToggle = false;
    if (index === n - 1) canToggle = true;
    else {
      const nextOn = switches[index + 1];
      const othersOff = switches.slice(index + 2).every(s => !s);
      if (nextOn && othersOff) canToggle = true;
    }
    if (!canToggle) {
      setViolationHistory(prev => [...prev, "Hardware Protocol Violation"]);
      setStep(prev => prev + 1);
      return;
    }
    setSwitches(prev => {
      const next = [...prev];
      next[index] = !next[index];
      if (next.every(s => !s)) {
        setIsWon(true);
        setIsRunning(false);
        setToast({ message: "System Secured", type: "success", visible: true });
      }
      return next;
    });
    setStep(prev => prev + 1);
  }, [mode, isRunning, isWon, step, totalSteps, switches]);

  const handleStart = useCallback(() => {
    clearPlaybackTimer();
    setSwitches(Array(switchCount).fill(true));

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
      return;
    }

    setIsRunning(true);
    setIsPlaying(false);
    setStep(0);
    setSolutionPath([]);
    setTotalSteps(cfTest);
    setStatusText(`Manual mode initialized. Target: ${cfTest} moves. (System Logic Verified)`);
  }, [mode, switchCount, clearPlaybackTimer, updateStateFromPath]);

  const handleReset = useCallback(() => {
    clearPlaybackTimer();
    setHasInitialized(false);
    setSwitches(Array(switchCount).fill(true));
    setStep(0);
    setIsRunning(false);
    setIsPlaying(false);
    setIsWon(false);
    setMoveDescriptions([]);
    setViolationHistory([]);
  }, [clearPlaybackTimer, switchCount]);

  const handleStep = useCallback(() => {
    if (mode === "bfs") advanceBfsStep();
    else if (mode === "divide") advanceDivideStep();
  }, [mode, advanceBfsStep, advanceDivideStep]);

  const handleBackStep = useCallback(() => {
    if (step > 0) {
      const nextStep = step - 1;
      setStep(nextStep);
      updateStateFromPath(nextStep, solutionPath);
    }
  }, [step, solutionPath, updateStateFromPath]);

  const progress = totalSteps > 0 ? (step / totalSteps) * 100 : 0;

  return (
    <div className="relative z-10 min-h-screen p-4 md:p-8 flex flex-col gap-6 bg-background/50 overflow-y-auto">
      <TopBar
        title={config.title}
        onBack={onBack}
        step={step}
        totalSteps={totalSteps}
        progress={progress}
        statusText={mode === "play" ? (violationHistory[violationHistory.length - 1] || "System secure. No violations detected. Click initialize to start") : (moveDescriptions[step - 1] || "Initialize to Start")}
        feedLabel={mode === "play" ? "Violation Feed" : "Execution Log"}
        onNextStep={mode !== "play" ? handleStep : undefined}
        onPrevStep={mode !== "play" ? handleBackStep : undefined}
        completeLog={moveDescriptions}
      />

      {mode === "play" ? (
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
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl bg-white/5 text-white/30 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] font-sans"
                >
                  Reset System
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 border-white/5 bg-white/[0.02] h-[250px]" glowColor={config.glowColor}>
            <div className="flex flex-col gap-4 h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] font-sans">Array Active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-wrap justify-center items-center gap-3 mt-4">
                  {switches.map((isOn, index) => (
                    <SecuritySwitch
                      key={index}
                      id={index + 1}
                      isOn={isOn}
                      onToggle={() => handleToggle(index)}
                      disabled={!isRunning}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

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
                  <span className="text-gold font-bold">02.</span>
                  <span><span className="text-white/80 font-bold uppercase tracking-tighter">GOAL</span> Reach 000...</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-6 flex flex-col gap-5">
            <GlassCard className="p-5 border-white/5 bg-white/[0.02] h-[calc(100vh-200px)] min-h-[320px] max-h-[500px] flex flex-col" glowColor={config.glowColor}>
              <div className="flex flex-col gap-3 h-full">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-neon-blue/40 rounded-full" />
                    <div>
                      <h2 className="text-lg font-black text-white/80 uppercase tracking-tighter font-sans">Active Hardware Matrix</h2>
                      <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">Live configuration streaming</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-black/40 rounded-xl border border-white/10 px-3 py-1 flex items-center gap-3">
                      <span className="text-[7px] font-black text-white/20 uppercase tracking-widest font-sans">Size</span>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={switchCount}
                        onChange={(e) => handleSwitchCountChange(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                        disabled={isRunning || isWon}
                        className="bg-transparent text-sm font-black text-gold font-mono w-8 text-center"
                      />
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <button
                      onClick={handleStart}
                      disabled={isRunning || isWon}
                      className="px-4 py-2.5 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 border border-gold/20 transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
                    >
                      Initialize
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled={!hasInitialized || isWon}
                      className={cn(
                        "px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-20",
                        isPlaying ? "bg-neon-red/10 text-neon-red border border-neon-red/20" : "bg-neon-green/10 text-neon-green border border-neon-green/20"
                      )}
                    >
                      {isPlaying ? "Pause" : "Execute All"}
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2.5 rounded-xl bg-white/5 text-white/40 border border-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                      title="Reset Workstation"
                    >
                      <ResetIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex justify-center items-center py-2">
                  <div className="flex flex-wrap justify-center gap-4">
                    {switches.map((isOn, index) => (
                      <SecuritySwitch
                        key={index}
                        id={index + 1}
                        isOn={isOn}
                        onToggle={() => { }}
                        disabled={true}
                        size="md"
                      />
                    ))}
                  </div>
                </div>

              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-5">
            <GlassCard className="p-5 border-white/5 bg-white/[0.02] h-[calc(100vh-200px)] min-h-[320px] max-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Logical Map Trace</span>
                
                <div className="flex items-center gap-6">
                  {mode === "bfs" ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.8)]" />
                        <span className="text-[8px] font-mono text-neon-blue font-bold uppercase">Optimal Path</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-red/40" />
                        <span className="text-[8px] font-mono text-white/20 uppercase">Cycles</span>
                      </div>
                      <span className="text-[8px] font-mono text-white/20 uppercase">{searchTree.length} Nodes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-red" />
                        <span className="text-[8px] font-mono text-neon-red font-bold uppercase">Main Call</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        <span className="text-[8px] font-mono text-white/20 uppercase">Toggle (+1)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                        <span className="text-[8px] font-mono text-white/20 uppercase">Base Case</span>
                      </div>
                    </div>
                  )}
                  <button onClick={() => setIsMapExpanded(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors bg-white/5 border border-white/5" title="Expand Map">
                    <span className="text-[8px] font-black uppercase tracking-[0.1em] font-sans">Expand</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                {mode === "bfs" ? (
                  <div className="h-full">
                    <StateSpaceTree n={switchCount} searchTree={searchTree} currentState={solutionPath[step]} />
                  </div>
                ) : (
                  <div className="h-full">
                    <RecursiveTreeView currentN={switchCount} currentLine={currentLine} />
                  </div>
                )}
              </div>
            </GlassCard>




          </div>

          <div className="lg:col-span-12 flex justify-center mt-2 mb-2 animate-bounce">
            <div className="flex flex-col items-center gap-1 text-white/40">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] font-sans">Scroll For Analysis</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <div className="lg:col-span-12">
            <TheoryPanel
              mode={mode}
              pseudocode={mode === "bfs" ? BFS_PSEUDOCODE : DC_PSEUDOCODE}
              isPseudocodeOpen={true}
              isEfficiencyOpen={true}
              isComplexityOpen={true}
              currentLine={currentLine}
              stats={algoStats}
              efficiencySummary={efficiencySummary}
              searchTree={searchTree}
              solutionPath={solutionPath}
              step={step}
              currentN={switchCount}
            />
          </div>
        </div>
      )}



      {isMapExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm">
          <GlassCard className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col p-6 border-white/10" glowColor={config.glowColor}>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-white/80 uppercase tracking-[0.2em]">Logical Map Trace - Expanded</span>
                {mode === "bfs" ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.8)]" />
                      <span className="text-[8px] font-mono text-neon-blue font-bold uppercase">Optimal Path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-red/40" />
                      <span className="text-[8px] font-mono text-white/20 uppercase">Cycles</span>
                    </div>
                    <span className="text-[8px] font-mono text-white/20 uppercase">{searchTree.length} Nodes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-red" />
                      <span className="text-[8px] font-mono text-neon-red font-bold uppercase">Main Call</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      <span className="text-[8px] font-mono text-white/20 uppercase">Toggle (+1)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                      <span className="text-[8px] font-mono text-white/20 uppercase">Base Case</span>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setIsMapExpanded(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-black/20 rounded-xl overflow-hidden border border-white/5">
              {mode === "bfs" ? (
                <div className="h-full">
                  <StateSpaceTree n={switchCount} searchTree={searchTree} currentState={solutionPath[step]} />
                </div>
              ) : (
                <div className="h-full">
                  <RecursiveTreeView currentN={switchCount} currentLine={currentLine} />
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

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
