"use client";

import { useState, useRef, useEffect } from "react";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";
import { type SwitchBit, type SearchNode } from "@/lib/bruteforce-bfs";
import { Network, Zap, ZoomOut, ZoomIn, RotateCcw } from "lucide-react";

interface StateSpaceTreeProps {
  n: number;
  searchTree: SearchNode[];
  currentState?: SwitchBit[];
}

export function StateSpaceTree({ n, searchTree, currentState }: StateSpaceTreeProps) {
  const [zoom, setZoom] = useState(0.8);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(prev => Math.min(2, Math.max(0.2, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (currentState) {
      const activeNode = document.getElementById("active-tree-node");
      if (activeNode && containerRef.current) {
        activeNode.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }
  }, [currentState]);
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
    if (!data || depth > 64) return null;

    const { node, children } = data;
    const isRoot = node.parentId === null;
    const isCurrent = currentState && currentState.join("") === node.state.join("") && node.isPath;

    return (
      <div className="flex flex-col items-center" key={id}>
        {/* Node */}
        <div 
          id={isCurrent ? "active-tree-node" : undefined}
          className={cn(
          "relative rounded-lg border font-mono font-bold transition-all duration-500 text-center flex flex-col items-center",
          n >= 5 ? "px-1.5 py-1 min-w-[34px] text-[7px] gap-0.5" : n === 4 ? "px-2 py-1 min-w-[40px] text-[8px] gap-0.5" : "px-3 py-1.5 min-w-[50px] text-[9px] gap-1",
          isCurrent 
            ? "bg-white border-white text-black scale-125 z-30 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            : node.isPath
              ? "bg-neon-blue/20 border-neon-blue shadow-[0_0_15px_rgba(88,166,255,0.4)] text-white scale-110 z-20"
              : node.isDeadEnd
                ? "bg-neon-red/10 border-neon-red/20 text-neon-red/40 z-10 opacity-60"
                : "bg-black/40 border-white/10 text-white/30 z-10"
        )}>
          {node.isPath && <Zap className="w-2 h-2 text-neon-blue animate-pulse absolute -top-1 -right-1" />}
          <div className="flex gap-0.5">
            {node.state.map((b, i) => (
              <div key={i} className={cn(
                "rounded-full",
                n >= 5 ? "w-1 h-1" : "w-1.5 h-1.5",
                b === 1
                  ? (isCurrent ? "bg-black" : node.isPath ? "bg-neon-blue" : node.isDeadEnd ? "bg-neon-red/40" : "bg-white/40")
                  : (isCurrent ? "bg-transparent border border-black/30" : "bg-transparent border border-white/10")
              )} />
            ))}
          </div>
          <span className="tracking-tighter opacity-80">{node.state.join("")}</span>
        </div>

        {/* Vertical Branches */}
        {children.length > 0 && depth < 64 && (
          <div className="flex flex-col items-center mt-4 w-full">
            {/* Main trunk */}
            <div className={cn(
              "w-px h-4",
              node.isPath ? "bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.4)]" : "bg-white/10"
            )} />

            <div className={cn("flex", n >= 5 ? "gap-1" : n === 4 ? "gap-2" : "gap-4")}>
              {children.map((childId, idx) => {
                const childNode = nodesById.get(childId)?.node;
                return (
                  <div key={childId} className="flex flex-col items-center relative">
                    {/* Horizontal spread */}
                    {children.length > 1 && (
                      <div className={cn(
                        "absolute top-0 h-px",
                        idx === 0 ? "left-1/2 right-0" : idx === children.length - 1 ? "left-0 right-1/2" : "left-0 right-0",
                        childNode?.isPath ? "bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.4)]" : "bg-white/10"
                      )} />
                    )}
                    {/* Vertical leaf stem */}
                    <div className={cn(
                      "w-px h-4",
                      childNode?.isPath ? "bg-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.4)]" : "bg-white/10"
                    )} />
                    {renderNode(childId, depth + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const root = searchTree.find(n => n.parentId === null);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest font-sans">State-Space Map</span>
          </div>
          <span className="text-[8px] font-mono text-white/10 uppercase mt-1">Binary Tree Decomposition</span>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
            className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-[9px] font-mono text-neon-blue font-bold px-1 min-w-[35px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <div className="w-px h-3 bg-white/10" />
          <button
            onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
            className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(0.8)}
            className="p-1.5 hover:bg-white/10 rounded text-white/20 hover:text-neon-blue transition-colors ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto custom-scrollbar relative px-2 bg-black/20 rounded-xl">
        <div
          className="min-w-max pb-4 pt-6 transition-all duration-300"
          style={{ zoom: zoom }}
        >
          {root ? (
            <div className="flex justify-center">
              {renderNode(root.id)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20 py-20">
              <Network className="w-10 h-10 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-center">Awaiting System<br />Initialization</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
