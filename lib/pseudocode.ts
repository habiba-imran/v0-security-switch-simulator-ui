export const BFS_PSEUDOCODE = [
  "initial_state ← [1, 1, ..., 1]",
  "goal_state    ← [0, 0, ..., 0]",
  "queue ← empty FIFO; visited ← {initial_state}",
  "Enqueue(queue, (initial_state, 0))",
  "while queue is not empty do",
  "  (current, moves) ← Dequeue(queue)",
  "  for i ← 0 to n-1 do",
  "    if IsValidMove(current, i) then",
  "      new_state ← ToggleSwitch(current, i)",
  "      if new_state = goal then return moves + 1",
  "      if new_state ∉ visited then",
  "        Add new_state to visited",
  "        Enqueue(queue, (new_state, moves + 1))"
];

export const DC_PSEUDOCODE = [
  "Algorithm DivideConquer(n)",
  "if n = 1 then toggle S1; return 1",
  "if n = 2 then toggle S2; toggle S1; return 2",
  "// Step 1: Turn OFF last (n-2) switches",
  "moves ← DivideConquer(n-2)",
  "// Step 2: Toggle switch 1 (leftmost)",
  "toggle switch 1; moves ← moves + 1",
  "// Step 3: Restore last (n-2) switches ON",
  "moves ← moves + DivideConquer(n-2)",
  "// Step 4: Solve remaining (n-1) switches",
  "moves ← moves + DivideConquer(n-1)"
];

export const DC_STEP_MAP: Record<string, number> = {
  "Base case": 1,
  "Step 1: Turn OFF last (n-2)": 5,
  "Step 2: Toggle switch 1": 7,
  "Step 3: Restore last (n-2)": 9,
  "Step 4: Solve remaining (n-1)": 11,
};
