export const BFS_PSEUDOCODE = [
  "Enqueue(initial_state, 0)",
  "while queue is not empty do",
  "  current_state ← Dequeue(queue)",
  "  for i ← 0 to n-1 do",
  "    if IsValidMove(current_state, i) then",
  "      new_state ← ToggleSwitch(current_state, i)",
  "      if new_state = goal then return",
  "      if new_state ∉ visited then",
  "        Enqueue(new_state, moves + 1)"
];

export const DC_PSEUDOCODE = [
  "if n = 1 then toggle S1; return 1",
  "if n = 2 then toggle S2; toggle S1; return 2",
  "moves ← DivideConquer(n-2) // Turn OFF",
  "toggle switch 1 // Toggle leftmost",
  "moves ← moves + DivideConquer(n-2) // Restore",
  "moves ← moves + DivideConquer(n-1) // Solve rest"
];

export const DC_STEP_MAP: Record<string, number> = {
  "Base case": 0,
  "Goal was to turn OFF S1": 0,
  "Goal was to turn OFF S2": 1,
  "Turn OFF last (n-2)": 2,
  "Toggle switch 1": 3,
  "Restore last (n-2)": 4,
  "Solve remaining (n-1)": 5,
};
