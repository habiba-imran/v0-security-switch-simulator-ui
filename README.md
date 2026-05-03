# Security Switch Simulator UI

An interactive Next.js app that turns a constrained switch-toggling puzzle into a visual simulation. The experience has three modes:

- Manual play, where you solve the puzzle yourself under the move rules.
- Brute force visualization, which uses BFS to explore the state space and show the shortest solution.
- Divide and conquer visualization, which demonstrates the recursive strategy and recurrence behind the solution.

Deployed app: https://128-security-switch-problelm.netlify.app/

## Problem Statement

Start with every switch ON, represented as `111...`, and turn them all OFF, represented as `000...`, using the fewest moves possible.

The rule for toggling is strict:

- The rightmost switch can be toggled at any time.
- Any other switch can be toggled only if its immediate right neighbor is ON and all switches further right are OFF.

This creates a constrained state space where not every bit can change freely, so the app focuses on showing both the legal moves and the algorithmic cost of solving the puzzle.

## Algorithm Overview

### 1. Brute Force Search with BFS

The brute force mode treats each switch configuration as a node in a graph. A valid toggle produces an edge to the next configuration. Breadth-first search is used because it explores the graph level by level, which guarantees the first time the goal state is reached is the shortest possible solution.

Why BFS works here:

- Each move has the same cost, so the shortest path is the path with the fewest edges.
- BFS visits all states at distance 1, then distance 2, then distance 3, and so on.
- That makes it ideal for proving the minimum number of moves.

What the UI shows in this mode:

- The shortest solution path.
- The explored search tree.
- Search statistics such as visited states and queue size.

### 2. Divide and Conquer Recursion

The divide-and-conquer mode solves the puzzle recursively by splitting the problem into smaller subproblems.

The recurrence used in the app is:

`M(n) = M(n-1) + 2M(n-2) + 1`

Interpretation of the recursive strategy:

- Solve a smaller configuration to prepare the right side of the array.
- Toggle the next switch that becomes legal to move.
- Restore the smaller configuration.
- Solve the remaining subproblem.

Base cases:

- `M(1) = 1`
- `M(2) = 2`

This mode is useful for seeing how the puzzle naturally decomposes into repeated substructures and why the move count grows exponentially without memoization.

### 3. Manual Play Mode

Manual mode lets you apply the same rules yourself. It is useful for understanding why some moves are legal and others are blocked.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide icons

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `pnpm dev` - start the local development server.
- `pnpm build` - build the production app.
- `pnpm start` - start the production server.
- `pnpm lint` - run ESLint across the project.

## Notes

- The app cross-checks the BFS solution, the recursive solution, and the closed-form move count to keep the visualizations consistent.
- The project was generated with v0 and can continue to be edited from the linked v0 workflow.

## v0 Workflow

Continue working on the linked v0 project here:

[Continue working on v0](https://v0.app/chat/projects/prj_bT64cROVAe490oa9k5DTyYHFLWdG)
