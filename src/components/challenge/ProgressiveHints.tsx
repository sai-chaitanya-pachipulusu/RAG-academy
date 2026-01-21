"use client";

import { useState } from "react";

interface HintSystemProps {
  hints: string[];
  solutionCode: string;
  onXPDeduction?: (amount: number) => void;
}

const HINT_COSTS = [0, 5, 10, 15]; // XP cost per hint level
const SOLUTION_COST = 50;

interface HintState {
  revealedCount: number;
  solutionRevealed: boolean;
  totalXPSpent: number;
}

export function ProgressiveHints({
  hints,
  solutionCode,
  onXPDeduction,
}: HintSystemProps) {
  const [state, setState] = useState<HintState>({
    revealedCount: 0,
    solutionRevealed: false,
    totalXPSpent: 0,
  });

  const revealNextHint = () => {
    if (state.revealedCount >= hints.length) return;

    const cost = HINT_COSTS[state.revealedCount] || HINT_COSTS[HINT_COSTS.length - 1];
    
    setState((prev) => ({
      ...prev,
      revealedCount: prev.revealedCount + 1,
      totalXPSpent: prev.totalXPSpent + cost,
    }));

    if (cost > 0) {
      onXPDeduction?.(cost);
    }
  };

  const revealSolution = () => {
    if (state.solutionRevealed) return;

    setState((prev) => ({
      ...prev,
      solutionRevealed: true,
      totalXPSpent: prev.totalXPSpent + SOLUTION_COST,
    }));

    onXPDeduction?.(SOLUTION_COST);
  };

  const getNextHintCost = () => {
    if (state.revealedCount >= hints.length) return null;
    return HINT_COSTS[state.revealedCount] || HINT_COSTS[HINT_COSTS.length - 1];
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
          <span>💡</span>
          <span>Hints</span>
        </h3>
        {state.totalXPSpent > 0 && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-400">
            -{state.totalXPSpent} XP spent
          </span>
        )}
      </div>

      {/* Revealed hints */}
      <div className="space-y-2">
        {hints.slice(0, state.revealedCount).map((hint, i) => (
          <div
            key={i}
            className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20"
          >
            <div className="flex items-start gap-2">
              <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                {i + 1}
              </span>
              <p className="text-sm text-blue-800 dark:text-blue-200">{hint}</p>
            </div>
            {i > 0 && (
              <p className="mt-1 text-right text-[10px] text-blue-500">
                Cost: -{HINT_COSTS[i] || HINT_COSTS[HINT_COSTS.length - 1]} XP
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Reveal next hint button */}
      {state.revealedCount < hints.length && (
        <button
          onClick={revealNextHint}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-blue-950/30"
        >
          <span>💡</span>
          <span>Reveal Hint {state.revealedCount + 1}</span>
          {getNextHintCost()! > 0 && (
            <span className="ml-1 text-xs text-zinc-500">
              (-{getNextHintCost()} XP)
            </span>
          )}
        </button>
      )}

      {/* All hints revealed indicator */}
      {state.revealedCount >= hints.length && !state.solutionRevealed && (
        <p className="text-center text-xs text-zinc-500">
          All hints revealed
        </p>
      )}

      {/* Solution section */}
      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {!state.solutionRevealed ? (
          <button
            onClick={revealSolution}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 text-sm font-medium text-amber-700 transition hover:shadow dark:border-amber-800 dark:from-amber-950/30 dark:to-yellow-950/30 dark:text-amber-400"
          >
            <span>🔓</span>
            <span>Reveal Solution</span>
            <span className="ml-1 text-xs text-amber-600/70">
              (-{SOLUTION_COST} XP)
            </span>
          </button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Solution
              </h4>
              <span className="text-xs text-amber-600">
                -{SOLUTION_COST} XP
              </span>
            </div>
            <pre className="overflow-auto rounded bg-zinc-900 p-3 text-xs text-emerald-400">
              {solutionCode}
            </pre>
            <p className="mt-2 text-[10px] text-amber-600/70 dark:text-amber-400/70">
              Study this solution, then try implementing it yourself!
            </p>
          </div>
        )}
      </div>

      {/* XP warning */}
      {state.totalXPSpent === 0 && (
        <p className="text-center text-xs text-zinc-400">
          💪 First hint is free! Subsequent hints cost XP.
        </p>
      )}
    </div>
  );
}

// Compact hint indicator for challenge cards
export function HintIndicator({
  hintsUsed,
  totalHints,
}: {
  hintsUsed: number;
  totalHints: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalHints }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-3 rounded-full ${
            i < hintsUsed
              ? "bg-blue-400"
              : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}
