"use client";

import { cn } from "@/lib/utils";

interface TreeNodeProps {
  n: number;
  label: string;
  isMain?: boolean;
  currentLine?: number;
}

function TreeNode({ n, label, isMain, currentLine }: TreeNodeProps) {
  if (n < 0) return null;
  const isBase = n <= 2;
  const moves = n === 0 ? 0 : Math.floor((Math.pow(2, n + 1) - (1 + Math.pow(-1, n))) / 3);

  let isActive = false;
  if (currentLine === 19 || currentLine === 20) isActive = isBase;
  if (currentLine === 22) isActive = label === "Step 1: OFF";
  if (currentLine === 26) isActive = label === "Step 3: ON";
  if (currentLine === 28) isActive = label === "Step 4: REST";

  const isToggleActive = currentLine === 24;

  return (
    <div className="flex flex-col items-center gap-2 min-w-[80px]">
      <div className={cn(
        "px-2 py-1.5 rounded border flex flex-col items-center transition-all duration-500",
        isActive 
          ? "bg-white border-white scale-125 z-20 shadow-[0_0_20px_rgba(255,255,255,0.8)]" 
          : isMain 
            ? "bg-neon-red/10 border-neon-red/40" 
            : "bg-white/5 border-white/10",
        !isActive && isBase && n > 0 && "border-neon-green/30"
      )}>
        <span className={cn("text-[7px] uppercase font-sans mb-0.5 tracking-tighter", isActive ? "text-black/60" : "text-white/30")}>{label}</span>
        <span className={cn("text-[9px] font-mono font-bold", isActive ? "text-black" : isMain ? "text-neon-red" : "text-white/70")}>
          {n === 0 ? "DONE" : `M(${n})`}
        </span>
        {n > 0 && <span className={cn("text-[7px] font-mono", isActive ? "opacity-80 text-black" : "opacity-40")}>{moves} moves</span>}
      </div>
      
      {!isBase && isMain && (
        <div className="flex flex-col items-center w-full">
          <div className="w-px h-3 bg-white/10" />
          <div className="flex justify-between w-full relative pt-2 border-t border-white/10 px-1">
            <TreeNode n={n - 2} label="Step 1: OFF" currentLine={currentLine} />
            <div className="flex flex-col items-center px-1">
              <div className={cn(
                "px-1.5 py-0.5 rounded border text-[7px] font-mono mb-1 transition-all duration-500",
                isToggleActive ? "bg-gold border-gold text-black scale-125 shadow-[0_0_15px_rgba(212,175,55,0.8)] z-10" : "bg-gold/10 border-gold/20 text-gold"
              )}>
                +1
              </div>
              <span className="text-[6px] text-white/20 uppercase">Toggle Sn</span>
            </div>
            <TreeNode n={n - 2} label="Step 3: ON" currentLine={currentLine} />
            <TreeNode n={n - 1} label="Step 4: REST" isMain currentLine={currentLine} />
          </div>
        </div>
      )}
    </div>
  );
}

interface RecursiveTreeViewProps {
  currentN: number;
  currentLine?: number;
}

export function RecursiveTreeView({ currentN, currentLine }: RecursiveTreeViewProps) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
            <span className="text-[10px] font-black text-neon-red/80 uppercase tracking-widest font-sans">
              Recursive Decomposition Tree
            </span>
          </div>
          <span className="text-[8px] text-white/20 uppercase font-mono mt-1">
            T(n) = M(n-2) + 1 + M(n-2) + M(n-1)
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center py-2 overflow-auto custom-scrollbar bg-black/20 rounded-xl">
        <TreeNode n={currentN} label="Goal: OFF" isMain currentLine={currentLine} />
      </div>
    </div>
  );
}
