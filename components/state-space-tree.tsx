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
    if (!data || depth > 3) return null; // Depth limit for UI

    const { node, children } = data;
    
    return (
      <div className="flex flex-col items-center gap-2" key={id}>
        <div className={cn(
          "px-2 py-1 rounded-lg border font-mono text-[9px] font-bold transition-all duration-500 min-w-[40px] text-center",
          node.isPath ? "bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_10px_rgba(88,166,255,0.2)]" :
          node.isDeadEnd ? "bg-red-500/10 border-red-500/20 text-red-500/40" :
          "bg-white/5 border-white/10 text-white/30"
        )}>
          {node.state.join("")}
        </div>
        
        {children.length > 0 && depth < 3 && (
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-white/10" />
            <div className="flex gap-2 relative px-2">
              <div className="absolute top-0 left-0 right-0 h-px bg-white/10" style={{ left: '15%', right: '15%' }} />
              {children.slice(0, 3).map(childId => ( // Width limit for UI
                <div key={childId} className="flex flex-col items-center pt-2">
                  <div className="w-px h-2 bg-white/10" />
                  {renderNode(childId, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const root = searchTree.find(n => n.parentId === null);

  return (
    <GlassCard className="p-6 border-white/5 bg-white/[0.02] overflow-hidden" glowColor="blue">
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-neon-blue uppercase tracking-[0.2em] font-sans">
              Complete State-Space Tree
            </span>
            <span className="text-[8px] text-white/20 uppercase font-mono mt-0.5">
              BFS Exploration Trace (All Valid Moves)
            </span>
          </div>
          <div className="px-2 py-1 rounded bg-neon-blue/10 border border-neon-blue/20 text-[9px] font-mono text-neon-blue">
            NODES: {searchTree.length}
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center py-4 overflow-x-auto custom-scrollbar">
          {root ? (
            renderNode(root.id)
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-20 py-10">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-neon-blue animate-spin-slow" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Ready for Analysis</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-4 text-[8px] font-mono text-white/20 uppercase tracking-widest">
          <div className="space-y-1">
            <p><span className="text-neon-blue">●</span> Shortest Path</p>
            <p><span className="text-white/40">●</span> Explored State</p>
          </div>
          <div className="space-y-1 text-right">
            <p><span className="text-red-500/50">●</span> Loop / Dead End</p>
            <p>Depth: 4 | Width: 3</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
