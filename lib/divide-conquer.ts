export interface DivideConquerResult {
  moves: number;
  path: number[][];
  descriptions: string[];
  stepIndices: number[];
  stats: {
    totalCalls: number;
  };
}

export function solveDivideConquer(n: number): DivideConquerResult {
  const path: number[][] = [];
  const descriptions: string[] = [];
  const current = Array(n).fill(1); // 1 = ON, 0 = OFF
  path.push([...current]);
  const stepIndices: number[] = [];
  let totalCalls = 0;

  const toggle = (i: number, context: string, stepIdx: number) => {
    // i is 1-indexed from right to left (1=Sn, 2=Sn-1, etc.)
    const index = n - i;
    current[index] = current[index] === 1 ? 0 : 1;
    path.push([...current]);
    const action = current[index] === 1 ? "ON" : "OFF";
    descriptions.push(`[S${i}] ${action}: ${context}`);
    stepIndices.push(stepIdx);
  };

  /**
   * Recursive function following the 4-step assignment logic
   * @param k - current sub-problem size
   */
  const solve = (k: number) => {
    totalCalls += 1;
    
    // Base Case n=1
    if (k === 1) {
      toggle(1, "Base Case n=1", 1);
      return;
    }

    // Base Case n=2
    if (k === 2) {
      toggle(2, "Base Case n=2 (Step 1)", 2);
      toggle(1, "Base Case n=2 (Step 2)", 2);
      return;
    }

    // Step 1: Turn OFF last (n-2) switches
    solve(k - 2); 
    
    // Step 2: Toggle switch 1 (current leftmost k)
    toggle(k, `Step 2: Toggle S${k}`, 6); 
    
    // Step 3: Restore last (n-2) switches back to ON
    // (In this specific problem, solve(k-2) toggles them, calling it again restores them)
    solve(k - 2); 
    
    // Step 4: Solve remaining (n-1) switches recursively
    solve(k - 1);
  };

  solve(n);

  return {
    moves: path.length - 1,
    path,
    descriptions,
    stepIndices,
    stats: {
      totalCalls
    }
  };
}

export function divideConquerSwitches(n: number): number {
  const memo = new Map<number, number>([
    [1, 1],
    [2, 2],
  ]);

  const solve = (k: number): number => {
    const cached = memo.get(k);
    if (cached !== undefined) return cached;
    const value = solve(k - 1) + 2 * solve(k - 2) + 1;
    memo.set(k, value);
    return value;
  };

  return solve(n);
}

export function recurrenceSteps(n: number): string[] {
  const values = new Map<number, number>([[1, 1]]);
  const steps = ["M(1) = 1"];
  if (n >= 2) {
    values.set(2, 2);
    steps.push("M(2) = 2");
  }
  for (let k = 3; k <= n; k += 1) {
    const left = values.get(k - 1)!;
    const right = values.get(k - 2)!;
    const current = left + 2 * right + 1;
    values.set(k, current);
    steps.push(`M(${k}) = M(${k-1}) + 2*M(${k-2}) + 1 = ${left} + 2*${right} + 1 = ${current}`);
  }
  return steps;
}
