"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface TheoryPanelProps {
  mode: "bfs" | "divide" | "play";
  pseudocode: string[];
  currentLine: number;
  stats: {
    label: string;
    value: string | number;
    description: string;
  }[];
  efficiencySummary: string;
}

export function TheoryPanel({ mode, pseudocode, currentLine, stats, efficiencySummary }: TheoryPanelProps) {
  if (mode === "play") return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-6">
      {/* Pseudocode Highlighter */}
      <GlassCard className="p-6 border-white/5 bg-white/[0.02]" glowColor="gold">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black text-gold/80 uppercase tracking-[0.2em] font-sans">
              Live Algorithm Trace
            </span>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-gold animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-gold/40" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1 font-mono text-[11px]">
            {pseudocode.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "px-3 py-1.5 rounded transition-all duration-200 flex gap-4",
                  currentLine === i 
                    ? "bg-gold/20 text-gold border-l-2 border-gold shadow-[0_0_15px_rgba(210,170,90,0.1)]" 
                    : "text-white/30 border-l-2 border-transparent"
                )}
              >
                <span className="opacity-20 w-4 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Efficiency Dashboard */}
      <GlassCard className="p-6 border-white/5 bg-white/[0.02]" glowColor="blue">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] font-sans">
              Efficiency Analysis Matrix
            </span>
            <span className="text-[9px] font-mono text-white/20 uppercase">DAA Assignment Report</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1 group hover:border-neon-blue/30 transition-colors">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
                <span className="text-xl font-black text-white/90 group-hover:text-neon-blue transition-colors">{stat.value}</span>
                <p className="text-[9px] text-white/20 leading-tight italic">{stat.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
            <table className="w-full text-[8px] font-mono text-left">
              <thead className="bg-white/5 text-white/40 uppercase tracking-widest">
                <tr>
                  <th className="px-3 py-2 font-black border-r border-white/5">Criterion</th>
                  <th className="px-3 py-2 font-black border-r border-white/5">BFS (Brute Force)</th>
                  <th className="px-3 py-2 font-black">Divide & Conquer</th>
                </tr>
              </thead>
              <tbody className="text-white/60">
                <tr className="border-t border-white/5">
                  <td className="px-3 py-1.5 font-bold bg-white/5 border-r border-white/5">Time Bound</td>
                  <td className="px-3 py-1.5 border-r border-white/5 text-neon-blue">Θ(n²·2ⁿ)</td>
                  <td className="px-3 py-1.5 text-neon-red">Θ(2ⁿ)</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-3 py-1.5 font-bold bg-white/5 border-r border-white/5">Space Cost</td>
                  <td className="px-3 py-1.5 border-r border-white/5">O(n·2ⁿ)</td>
                  <td className="px-3 py-1.5">O(n)</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-3 py-1.5 font-bold bg-white/5 border-r border-white/5">Optimality</td>
                  <td className="px-3 py-1.5 border-r border-white/5">BFS Guarantee</td>
                  <td className="px-3 py-1.5">Proven by Recurrence</td>
                </tr>
                <tr className="border-t border-white/5">
                  <td className="px-3 py-1.5 font-bold bg-white/5 border-r border-white/5">Advantage</td>
                  <td className="px-3 py-1.5 border-r border-white/5 italic">General Search</td>
                  <td className="px-3 py-1.5 italic">Scalable Logic</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-neon-blue/5 border border-neon-blue/10 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
              <span className="text-[10px] font-bold text-neon-blue/80 uppercase tracking-widest font-sans">
                Academic Conclusion
              </span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed font-sans italic">
              {efficiencySummary}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
