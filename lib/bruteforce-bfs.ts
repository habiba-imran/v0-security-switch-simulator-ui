export type SwitchBit = 0 | 1;
export type SwitchState = ReadonlyArray<SwitchBit>;

function isValidMove(state: SwitchState, i: number): boolean {
  const n = state.length;

  // The rightmost switch can always be toggled.
  if (i === n - 1) {
    return true;
  }

  // Any other switch requires its immediate right switch to be ON.
  if (state[i + 1] !== 1) {
    return false;
  }

  // All switches further right must be OFF.
  for (let j = i + 2; j < n; j += 1) {
    if (state[j] !== 0) {
      return false;
    }
  }

  return true;
}

function toggle(state: SwitchState, i: number): SwitchBit[] {
  const next = [...state] as SwitchBit[];
  next[i] = next[i] === 1 ? 0 : 1;
  return next;
}

function toKey(state: SwitchState): string {
  return state.join("");
}

function fromKey(key: string): SwitchBit[] {
  return key.split("").map((bit) => (bit === "1" ? 1 : 0)) as SwitchBit[];
}

export interface SearchNode {
  state: SwitchBit[];
  id: string;
  parentId: string | null;
  isPath: boolean;
  isDeadEnd: boolean;
  level: number;
}

export interface BruteForceResult {
  minMoves: number;
  path: SwitchBit[][];
  searchTree: SearchNode[];
  stats: {
    totalVisited: number;
    maxQueueSize: number;
  };
}

export function solveSwitchesBruteforce(n: number): BruteForceResult {
  const start = Array(n).fill(1) as SwitchBit[];
  const target = Array(n).fill(0) as SwitchBit[];

  const startKey = toKey(start);
  const targetKey = toKey(target);

  if (startKey === targetKey) {
    return { minMoves: 0, path: [start] };
  }

  const queue: string[] = [startKey];
  let queueHead = 0;

  // childKey -> parentKey
  const visited = new Map<string, string | null>([[startKey, null]]);

  let maxQueueSize = 1;

  const searchTree: SearchNode[] = [];
  const startNode: SearchNode = {
    state: start,
    id: startKey,
    parentId: null,
    isPath: false,
    isDeadEnd: false,
    level: 0
  };
  searchTree.push(startNode);

  while (queueHead < queue.length) {
    maxQueueSize = Math.max(maxQueueSize, queue.length - queueHead);
    const currentKey = queue[queueHead];
    queueHead += 1;

    if (currentKey === targetKey) break;

    const current = fromKey(currentKey);
    const currentLevel = searchTree.find(n => n.id === currentKey)?.level ?? 0;

    // We limit tree capture to avoid massive memory usage for visualization
    if (currentLevel >= 4) continue;

    for (let i = 0; i < n; i += 1) {
      if (!isValidMove(current, i)) continue;

      const next = toggle(current, i);
      const nextKey = toKey(next);
      
      const isNew = !visited.has(nextKey);
      
      if (isNew) {
        visited.set(nextKey, currentKey);
        queue.push(nextKey);
      }

      // Record in search tree for visualization
      searchTree.push({
        state: next,
        id: nextKey + "-" + Math.random().toString(36).substr(2, 4), // Unique ID for tree
        parentId: currentKey,
        isPath: false,
        isDeadEnd: !isNew,
        level: currentLevel + 1
      });
    }
  }

  const path: SwitchBit[][] = [];
  let pathKey: string | null = targetKey;
  const pathKeys = new Set<string>();

  while (pathKey !== null) {
    path.push(fromKey(pathKey));
    pathKeys.add(pathKey);
    pathKey = visited.get(pathKey) ?? null;
  }
  path.reverse();

  // Mark path nodes in searchTree
  searchTree.forEach(node => {
    if (pathKeys.has(node.id.split('-')[0])) {
      node.isPath = true;
    }
  });

  return { 
    minMoves: path.length - 1, 
    path,
    searchTree,
    stats: {
      totalVisited: visited.size,
      maxQueueSize
    }
  };
}
