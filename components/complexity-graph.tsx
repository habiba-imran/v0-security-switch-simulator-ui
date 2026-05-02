"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { GlassCard } from "./glass-card";

interface ComplexityGraphProps {
  currentN: number;
}

export function ComplexityGraph({ currentN }: ComplexityGraphProps) {
  const data = Array.from({ length: 10 }, (_, i) => {
    const n = i + 1;
    // Part 4: Using exact closed form for M(n)
    const moves = Math.floor((Math.pow(2, n + 1) - (1 + Math.pow(-1, n))) / 3);
    
    // Part 3: Complexity Functions
    const bfsComplexity = Math.pow(n, 2) * Math.pow(2, n);
    const dcComplexity = Math.pow(2, n);

    return {
      n,
      moves,
      bfsComplexity,
      dcComplexity,
      isCurrent: n === currentN
    };
  });

  return (
    <GlassCard className="p-6 border-white/5 bg-white/[0.02] h-[400px]" glowColor="gold">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gold/80 uppercase tracking-[0.2em] font-sans">
              Asymptotic Performance Analysis
            </span>
            <span className="text-[8px] text-white/20 uppercase font-mono mt-0.5">
              Growth Comparison: M(n) vs BFS vs D&C
            </span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[8px] text-gold/60 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-gold" /> M(n)
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-neon-blue/60 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-blue" /> BFS
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-neon-red/60 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-red" /> D&C
            </div>
          </div>
        </div>

        <div className="flex-1 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMoves" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d2aa5a" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#d2aa5a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="n" 
                stroke="#ffffff20" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff20" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                scale="sqrt" // Helps visualize both M(n) and n^2*2^n on same scale
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid #ffffff10', 
                  borderRadius: '8px',
                  fontSize: '9px'
                }}
                itemStyle={{ fontSize: '9px' }}
                cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
              />
              {/* M(n) Area */}
              <Area 
                type="monotone" 
                dataKey="moves" 
                stroke="#d2aa5a" 
                fillOpacity={1} 
                fill="url(#colorMoves)" 
                strokeWidth={2}
                name="Moves M(n)"
              />
              {/* BFS Runtime Line */}
              <Area 
                type="monotone" 
                dataKey="bfsComplexity" 
                stroke="#58a6ff" 
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="BFS Θ(n²·2ⁿ)"
              />
              {/* D&C Runtime Line */}
              <Area 
                type="monotone" 
                dataKey="dcComplexity" 
                stroke="#ff5858" 
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="2 2"
                name="D&C Θ(2ⁿ)"
              />
              {/* Highlight current point */}
              <Line 
                type="monotone" 
                dataKey="moves" 
                stroke="transparent" 
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.n === currentN) {
                    return (
                      <circle cx={cx} cy={cy} r={5} fill="#d2aa5a" stroke="#fff" strokeWidth={1} className="animate-pulse" />
                    );
                  }
                  return <g />;
                }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}
