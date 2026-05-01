"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

interface TreeNodeProps {
  n: number;
  depth: number;
  maxDepth: number;
}

function TreeNode({ n, depth, maxDepth }: TreeNodeProps) {
  if (n <= 0 || depth > maxDepth) return null;

  const isBaseCase = n <= 2;
  const moves = Math.floor(Math.pow(2, n + 1) / 3);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn(
        "px-3 py-2 rounded-lg border flex flex-col items-center min-w-[60px] transition-all duration-500",
        isBaseCase 
          ? "bg-neon-green/10 border-neon-green/30 text-neon-green" 
          : "bg-white/5 border-white/10 text-white/80"
      )}>
        <span className="text-[10px] font-mono font-bold">T({n})</span>
        <span className="text-[8px] opacity-40 font-mono">{moves} mov</span>
      </div>

      {!isBaseCase && depth < maxDepth && (
        <div className="flex flex-col items-center">
          {/* Stem */}
          <div className="w-px h-4 bg-white/10" />
          
          {/* Branches */}
          <div className="flex gap-4 relative">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" style={{ left: '25%', right: '25%' }} />
            
            <div className="flex flex-col items-center pt-2">
              <div className="w-px h-2 bg-white/10" />
              <TreeNode n={n - 1} depth={depth + 1} maxDepth={maxDepth} />
            </div>
            
            <div className="flex flex-col items-center pt-2">
              <div className="w-px h-2 bg-white/10" />
              <TreeNode n={n - 2} depth={depth + 1} maxDepth={maxDepth} />
            </div>

            <div className="flex flex-col items-center pt-2">
              <div className="w-px h-2 bg-white/10" />
              <TreeNode n={n - 2} depth={depth + 1} maxDepth={maxDepth} />
            </div>
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
  // We limit depth to keep it readable
  const maxVisualDepth = currentN > 4 ? 2 : 3;

  return (
    <GlassCard className="p-6 border-white/5 bg-white/[0.02] overflow-hidden" glowColor="red">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-neon-red/80 uppercase tracking-[0.2em] font-sans">
              Recursion Tree Decomposition
            </span>
            <span className="text-[8px] text-white/20 uppercase font-mono mt-0.5">
              Visualizing T(n) = T(n-1) + 2T(n-2) + 1
            </span>
          </div>
          <div className="px-2 py-1 rounded bg-neon-red/10 border border-neon-red/20 text-[9px] font-mono text-neon-red">
            DEPTH: {currentN}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-4 overflow-x-auto custom-scrollbar">
          <TreeNode n={currentN} depth={0} maxDepth={maxVisualDepth} />
        </div>

        <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-white/20 uppercase tracking-widest">
          <span>Root: Current Size</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-white/10 border border-white/20" />
              <span>Recursive Call</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-neon-green/20 border border-neon-green/40" />
              <span>Base Case</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
