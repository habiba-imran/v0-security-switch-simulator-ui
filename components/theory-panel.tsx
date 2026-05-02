"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { Terminal, BarChart3, Activity, Network } from "lucide-react";
import { ComplexityGraph } from "./complexity-graph";
import { StateSpaceTree } from "./state-space-tree";
import { type SwitchBit, type SearchNode } from "@/lib/bruteforce-bfs";

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
  isPseudocodeOpen: boolean;
  isEfficiencyOpen: boolean;
  isComplexityOpen?: boolean;
  searchTree?: SearchNode[];
  solutionPath?: SwitchBit[][];
  step?: number;
  currentN: number;
}

export function TheoryPanel({ 
  mode, 
  pseudocode, 
  currentLine, 
  stats, 
  efficiencySummary,
  isPseudocodeOpen,
  isEfficiencyOpen,
  isComplexityOpen,
  searchTree,
  solutionPath,
  step = 0,
  currentN
}: TheoryPanelProps) {
  if (mode === "play") return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full mt-2">
      {/* Pseudocode Highlighter */}
      {isPseudocodeOpen && (
        <GlassCard className="p-0 border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500 ring-1 ring-gold/20 h-full flex flex-col" glowColor="gold">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-gold/20 text-gold">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">Logic Trace</span>
                <span className="text-xs font-black uppercase tracking-widest font-sans text-gold">
                  Live Algorithm Protocol
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 font-mono text-[11px] p-4 bg-black/40 rounded-xl border border-white/5 flex-1 overflow-y-auto custom-scrollbar">
              {pseudocode.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-3 py-1.5 rounded transition-all duration-200 flex gap-4",
                    currentLine === i 
                      ? "text-gold font-bold" 
                      : "text-white/20"
                  )}
                >
                  <span className="whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Efficiency Dashboard */}
      {isEfficiencyOpen && (
        <GlassCard className="p-0 border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-500 ring-1 ring-neon-blue/20 h-full flex flex-col" glowColor="blue">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-neon-blue/20 text-neon-blue">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] font-sans">Metrics & Bounds</span>
                <span className="text-xs font-black uppercase tracking-widest font-sans text-neon-blue">
                  Efficiency Analysis Matrix
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1 group hover:border-neon-blue/30 transition-all">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-xl font-black text-white/90 group-hover:text-neon-blue transition-colors">{stat.value}</span>
                    <p className="text-[9px] text-white/40 leading-tight italic">{stat.description}</p>
                  </div>
                ))}
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
          </div>
        </GlassCard>
      )}

      {/* Performance Graph */}
      {isComplexityOpen && (
        <GlassCard className="p-6 border-white/5 bg-white/[0.02] h-full flex flex-col" glowColor="blue">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 rounded-lg bg-neon-blue/20 text-neon-blue">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] font-sans">Performance</span>
              <span className="text-xs font-black uppercase tracking-widest font-sans text-neon-blue">
                Asymptotic Complexity Map
              </span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ComplexityGraph currentN={currentN} />
          </div>
        </GlassCard>
      )}


    </div>
  );
}
