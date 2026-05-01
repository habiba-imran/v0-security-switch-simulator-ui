"use client";

import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { type SearchNode } from "@/lib/bruteforce-bfs";

interface StateSpaceTreeProps {
  n: number;
  searchTree: SearchNode[];
}

export function StateSpaceTree({ n, searchTree }: StateSpaceTreeProps) {
  // Build a tree structure from the flat list
  const nodesById = new Map<string, { node: SearchNode; children: string[] }>();
  searchTree.forEach(s => {
    nodesById.set(s.id, { node: s, children: [] });
  });

  searchTree.forEach(s => {
    if (s.parentId && nodesById.has(s.parentId)) {
      nodesById.get(s.parentId)!.children.push(s.id);
    }
  });

  const renderNode = (id: string, depth: number = 0) => {
    const data = nodesById.get(id);
    if (!data || depth > 25) return null;

    const { node, children } = data;
    
    return (
      <div className="flex items-center gap-6" key={id}>
        {/* Node */}
        <div className={cn(
          "px-3 py-1.5 rounded-lg border font-mono text-[9px] font-bold transition-all duration-500 min-w-[60px] text-center z-10",
          node.isPath ? "bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_15px_rgba(88,166,255,0.2)]" :
          node.isDeadEnd ? "bg-red-500/10 border-red-500/20 text-red-500/40" :
          "bg-white/5 border-white/10 text-white/30"
        )}>
          {node.state.join("")}
        </div>
        
        {/* Branches */}
        {children.length > 0 && depth < 25 && (
          <div className="flex flex-col gap-4 relative">
            {/* Connecting Lines */}
            <div className="absolute left-[-24px] top-1/2 bottom-1/2 w-6 h-px bg-white/10" />
            
            {children.map((childId, idx) => (
              <div key={childId} className="flex items-center relative pl-6">
                {/* Vertical segment */}
                {children.length > 1 && (
                  <div 
                    className="absolute left-0 w-px bg-white/10" 
                    style={{ 
                      top: idx === 0 ? '50%' : '0', 
                      bottom: idx === children.length - 1 ? '50%' : '0' 
                    }} 
                  />
                )}
                {/* Horizontal segment */}
                <div className="absolute left-0 w-6 h-px bg-white/10 top-1/2" />
                {renderNode(childId, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const root = searchTree.find(n => n.parentId === null);

  return (
    <div className="flex flex-col gap-6 h-full min-h-[400px]">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-neon-blue uppercase tracking-[0.2em] font-sans">
            Binary State-Space Map
          </span>
          <span className="text-[9px] text-white/20 uppercase font-mono mt-1">
            L-to-R Exploration Trace (All Valid Moves)
          </span>
        </div>
        <div className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[10px] font-mono text-neon-blue font-bold">
          {searchTree.length} STATES RECORDED
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8 bg-black/20 rounded-2xl border border-white/5">
        <div className="inline-block min-w-full">
          {root ? (
            <div className="flex items-start">
              {renderNode(root.id)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 opacity-20 py-20">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-neon-blue animate-spin-slow" />
              <span className="text-[11px] font-mono uppercase tracking-[0.3em]">Processing Logic Map...</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/20 uppercase tracking-widest">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.5)]" />
            <span>Optimal Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/10 border border-white/20" />
            <span>Explored Branch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/40" />
            <span>Cycle / Dead End</span>
          </div>
        </div>
        <span className="italic opacity-50">Use Shift + Scroll for horizontal panning</span>
      </div>
    </div>
  );
}
