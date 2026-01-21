"use client";

import { useState, useEffect } from "react";

interface ExecutionStat {
  timestamp: number;
  passed: boolean;
  executionTime: number;
  score?: number;
}

interface Props {
  challengeSlug: string;
  latestRun?: {
    passed: boolean;
    executionTime: number;
    score?: number;
  };
}

export function ExecutionStats({ challengeSlug, latestRun }: Props) {
  const [stats, setStats] = useState<ExecutionStat[]>([]);
  const [showGraph, setShowGraph] = useState(false);

  // Load stats from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`exec_stats_${challengeSlug}`);
    if (stored) {
      setStats(JSON.parse(stored));
    }
  }, [challengeSlug]);

  // Save new run
  useEffect(() => {
    if (latestRun) {
      const newStat: ExecutionStat = {
        timestamp: Date.now(),
        passed: latestRun.passed,
        executionTime: latestRun.executionTime,
        score: latestRun.score,
      };
      const updated = [...stats.slice(-19), newStat]; // Keep last 20
      setStats(updated);
      localStorage.setItem(`exec_stats_${challengeSlug}`, JSON.stringify(updated));
    }
  }, [latestRun]);

  if (stats.length === 0) return null;

  const successRate = Math.round(
    (stats.filter((s) => s.passed).length / stats.length) * 100
  );
  const avgTime = Math.round(
    stats.reduce((sum, s) => sum + s.executionTime, 0) / stats.length
  );
  const bestScore = stats.filter((s) => s.score).reduce(
    (max, s) => Math.max(max, s.score || 0),
    0
  );

  const maxTime = Math.max(...stats.map((s) => s.executionTime), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Your Performance
        </p>
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {successRate}%
          </p>
          <p className="text-[10px] text-zinc-500">Success Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {avgTime}ms
          </p>
          <p className="text-[10px] text-zinc-500">Avg Time</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.length}
          </p>
          <p className="text-[10px] text-zinc-500">Attempts</p>
        </div>
      </div>

      {bestScore > 0 && (
        <div className="mt-2 text-center">
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
            Best Score: {bestScore.toFixed(2)}
          </span>
        </div>
      )}

      {/* Simple bar graph */}
      {showGraph && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] text-zinc-500">Execution Time (last 20 runs)</p>
          <div className="flex h-16 items-end gap-0.5">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${(stat.executionTime / maxTime) * 100}%`,
                  minHeight: "4px",
                  backgroundColor: stat.passed
                    ? "rgb(34, 197, 94)"
                    : "rgb(239, 68, 68)",
                }}
                title={`${stat.executionTime}ms - ${stat.passed ? "Passed" : "Failed"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
