"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal, BarChart3 } from "lucide-react";

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
  const [isPseudocodeOpen, setIsPseudocodeOpen] = useState(false);
  const [isEfficiencyOpen, setIsEfficiencyOpen] = useState(false);

  if (mode === "play") return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-6">
      {/* Pseudocode Highlighter */}
      <GlassCard className={cn(
        "p-0 border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500",
        isPseudocodeOpen ? "ring-1 ring-gold/20" : "hover:bg-white/[0.04]"
      )} glowColor="gold">
        <button 
          onClick={() => setIsPseudocodeOpen(!isPseudocodeOpen)}
          className="flex items-center justify-between p-6 w-full group transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              isPseudocodeOpen ? "bg-gold/20 text-gold" : "bg-white/5 text-white/20"
            )}>
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">Logic Trace</span>
              <span className={cn(
                "text-xs font-black uppercase tracking-widest font-sans transition-colors",
                isPseudocodeOpen ? "text-gold" : "text-white/60 group-hover:text-white"
              )}>
                Live Algorithm Protocol
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {isPseudocodeOpen && <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />}
             {isPseudocodeOpen ? <ChevronUp className="w-5 h-5 text-gold/40" /> : <ChevronDown className="w-5 h-5 text-white/10 group-hover:text-gold/40 transition-colors" />}
          </div>
        </button>
        
        {isPseudocodeOpen && (
          <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-1 font-mono text-[11px] p-4 bg-black/40 rounded-xl border border-white/5">
              {pseudocode.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-3 py-1.5 rounded transition-all duration-200 flex gap-4",
                    currentLine === i 
                      ? "bg-gold/20 text-gold border-l-2 border-gold shadow-[0_0_15px_rgba(210,170,90,0.1)]" 
                      : "text-white/10 border-l-2 border-transparent"
                  )}
                >
                  <span className="opacity-20 w-4 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Efficiency Dashboard */}
      <GlassCard className={cn(
        "p-0 border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500",
        isEfficiencyOpen ? "ring-1 ring-neon-blue/20" : "hover:bg-white/[0.04]"
      )} glowColor="blue">
        <button 
          onClick={() => setIsEfficiencyOpen(!isEfficiencyOpen)}
          className="flex items-center justify-between p-6 w-full group transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              isEfficiencyOpen ? "bg-neon-blue/20 text-neon-blue" : "bg-white/5 text-white/20"
            )}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">Metrics & Bounds</span>
              <span className={cn(
                "text-xs font-black uppercase tracking-widest font-sans transition-colors",
                isEfficiencyOpen ? "text-neon-blue" : "text-white/60 group-hover:text-white"
              )}>
                Efficiency Analysis Matrix
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {isEfficiencyOpen && <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />}
             {isEfficiencyOpen ? <ChevronUp className="w-5 h-5 text-neon-blue/40" /> : <ChevronDown className="w-5 h-5 text-white/10 group-hover:text-neon-blue/40 transition-colors" />}
          </div>
        </button>

        {isEfficiencyOpen && (
          <div className="px-6 pb-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 group hover:border-neon-blue/30 transition-all">
                  <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-xl font-black text-white/90 group-hover:text-neon-blue transition-colors">{stat.value}</span>
                  <p className="text-[9px] text-white/40 leading-tight italic">{stat.description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden">
              <table className="w-full text-[9px] font-mono text-left">
                <thead className="bg-white/5 text-white/40 uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3 font-black border-r border-white/5">Criterion</th>
                    <th className="px-4 py-3 font-black border-r border-white/5">BFS (Search)</th>
                    <th className="px-4 py-3 font-black">Divide & Conquer</th>
                  </tr>
                </thead>
                <tbody className="text-white/60">
                  <tr className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2 font-bold bg-white/5 border-r border-white/5">Time Bound</td>
                    <td className="px-4 py-2 border-r border-white/5 text-neon-blue">Θ(n²·2ⁿ)</td>
                    <td className="px-4 py-2 text-neon-red">Θ(2ⁿ)</td>
                  </tr>
                  <tr className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2 font-bold bg-white/5 border-r border-white/5">Space Cost</td>
                    <td className="px-4 py-2 border-r border-white/5">O(n·2ⁿ)</td>
                    <td className="px-4 py-2">O(n)</td>
                  </tr>
                  <tr className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2 font-bold bg-white/5 border-r border-white/5">Optimality</td>
                    <td className="px-4 py-2 border-r border-white/5">Guaranteed</td>
                    <td className="px-4 py-2">Mathematical</td>
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
              <p className="text-[10px] text-white/50 leading-relaxed font-sans italic">
                {efficiencySummary}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
