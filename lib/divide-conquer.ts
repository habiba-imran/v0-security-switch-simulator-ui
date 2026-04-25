export interface DivideConquerResult {
  moves: number;
  path: number[][];
  descriptions: string[];
}

export function solveDivideConquer(n: number): DivideConquerResult {
  const path: number[][] = [];
  const descriptions: string[] = [];
  const current = Array(n).fill(1); // 1 = ON, 0 = OFF
  path.push([...current]);

  const toggle = (i: number, context: string) => {
    // i is 1-indexed from right to left (1=Sn, 2=Sn-1, etc.)
    const index = n - i;
    current[index] = current[index] === 1 ? 0 : 1;
    path.push([...current]);
    const action = current[index] === 1 ? "ON" : "OFF";
    descriptions.push(`[S${i}] ${action}: ${context}`);
  };

  /**
   * Recursive function to make switches 1 to k (from right) reach target
   * @param k - number of switches from right
   * @param target - 0 for OFF, 1 for ON
   */
  const change = (k: number, target: number) => {
    if (k <= 0) return;
    
    const index = n - k;
    if (current[index] === target) {
      change(k - 1, target);
    } else {
      // To toggle S_k, we need S_{k-1} ON and S_{k-2...1} OFF
      if (k > 1) {
        change(k - 1, 1); // Make S_{k-1} ON
        change(k - 2, 0); // Make S_{k-2...1} OFF
      }
      
      const goal = target === 0 ? "turn OFF" : "turn ON";
      toggle(k, `Goal was to ${goal} S${k}`);
      change(k - 1, target);
    }
  };

  change(n, 0); // Turn all OFF
  return {
    moves: path.length - 1,
    path,
    descriptions
  };
}

export function divideConquerSwitches(n: number): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error("n must be a positive integer");
  }

  const memo = new Map<number, number>([
    [1, 1],
    [2, 2],
  ]);

  const solve = (k: number): number => {
    const cached = memo.get(k);
    if (cached !== undefined) {
      return cached;
    }

    const value = solve(k - 1) + 2 * solve(k - 2) + 1;
    memo.set(k, value);
    return value;
  };

  return solve(n);
}

export function recurrenceSteps(n: number): string[] {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error("n must be a positive integer");
  }

  const values = new Map<number, number>([[1, 1]]);
  const steps = ["T(1) = 1"];

  if (n >= 2) {
    values.set(2, 2);
    steps.push("T(2) = 2");
  }

  for (let k = 3; k <= n; k += 1) {
    const left = values.get(k - 1)!;
    const right = values.get(k - 2)!;
    const current = left + 2 * right + 1;

    values.set(k, current);
    steps.push(
      `T(${k}) = T(${k - 1}) + 2*T(${k - 2}) + 1 = ${left} + 2*${right} + 1 = ${current}`,
    );
  }

  return steps;
}
