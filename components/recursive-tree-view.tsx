"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
  n: number;
  label: string;
  isMain?: boolean;
}

function TreeNode({ n, label, isMain }: TreeNodeProps) {
  if (n < 0) return null;
  const isBase = n <= 2;
  const moves = n === 0 ? 0 : Math.floor((Math.pow(2, n + 1) - (1 + Math.pow(-1, n))) / 3);

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      <div className={cn(
        "px-2 py-1.5 rounded border flex flex-col items-center transition-all duration-500",
        isMain ? "bg-neon-red/10 border-neon-red/40" : "bg-white/5 border-white/10",
        isBase && n > 0 && "border-neon-green/30"
      )}>
        <span className="text-[7px] text-white/30 uppercase font-sans mb-0.5 tracking-tighter">{label}</span>
        <span className={cn("text-[9px] font-mono font-bold", isMain ? "text-neon-red" : "text-white/70")}>
          {n === 0 ? "DONE" : `M(${n})`}
        </span>
        {n > 0 && <span className="text-[7px] opacity-40 font-mono">{moves} moves</span>}
      </div>
      
      {!isBase && isMain && (
        <div className="flex flex-col items-center w-full">
          <div className="w-px h-3 bg-white/10" />
          <div className="flex justify-between w-full relative pt-2 border-t border-white/10 px-1">
            <TreeNode n={n - 2} label="Step 1: OFF" />
            <div className="flex flex-col items-center px-1">
              <div className="px-1.5 py-0.5 rounded bg-gold/10 border border-gold/20 text-[7px] text-gold font-mono mb-1">
                +1
              </div>
              <span className="text-[6px] text-white/20 uppercase">Toggle Sn</span>
            </div>
            <TreeNode n={n - 2} label="Step 3: ON" />
            <TreeNode n={n - 1} label="Step 4: REST" isMain />
          </div>
        </div>
      )}
    </div>
  );
}

interface RecursiveTreeViewProps {
  currentN: number;
}

export function RecursiveTreeView({ currentN }: RecursiveTreeViewProps) {
  return (
    <GlassCard className="p-6 border-white/5 bg-white/[0.02] overflow-hidden" glowColor="red">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-neon-red/80 uppercase tracking-[0.2em] font-sans">
              Recursive Decomposition Tree
            </span>
            <span className="text-[8px] text-white/20 uppercase font-mono mt-0.5">
              T(n) = M(n-2) + 1 + M(n-2) + M(n-1)
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center py-4 overflow-x-auto custom-scrollbar">
          <TreeNode n={currentN} label="Goal: OFF" isMain />
        </div>

        <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-4 text-[8px] font-mono text-white/20 uppercase tracking-widest">
          <div className="space-y-1">
            <p><span className="text-neon-red">●</span> Recursive Call (Main)</p>
            <p><span className="text-white/40">●</span> Sub-Problem (Setup)</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-gold">●</span> Atomic Toggle (+1)</p>
            <p><span className="text-neon-green">●</span> Base Cases (n=1,2)</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
