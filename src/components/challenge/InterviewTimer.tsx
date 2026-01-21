"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  isActive: boolean;
  duration: number; // in seconds
  onTimeUp?: () => void;
}

export function InterviewTimer({ isActive, duration, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isPaused, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = (timeLeft / duration) * 100;

  const getColorClass = () => {
    if (progress > 50) return "text-emerald-600 dark:text-emerald-400";
    if (progress > 25) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400 animate-pulse";
  };

  const getBgColorClass = () => {
    if (progress > 50) return "bg-emerald-500";
    if (progress > 25) return "bg-amber-500";
    return "bg-red-500";
  };

  if (!isActive) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-zinc-100 p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏱️</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Interview Mode
          </span>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="rounded-full bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className={`mt-2 text-center text-4xl font-bold tabular-nums ${getColorClass()}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={`h-full transition-all duration-1000 ${getBgColorClass()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500">
        {timeLeft === 0
          ? "Time's up!"
          : isPaused
            ? "Timer paused"
            : "Complete before time runs out"}
      </p>
    </div>
  );
}

// Interview mode toggle button
export function InterviewModeToggle({
  isEnabled,
  onToggle,
  difficulty,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  difficulty: string;
}) {
  const getDuration = () => {
    switch (difficulty) {
      case "easy":
        return "5 min";
      case "medium":
        return "10 min";
      case "hard":
        return "15 min";
      default:
        return "10 min";
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        isEnabled
          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
      }`}
    >
      <span>⏱️</span>
      {isEnabled ? "Exit Interview Mode" : `Interview Mode (${getDuration()})`}
    </button>
  );
}

// Get duration in seconds based on difficulty
export function getInterviewDuration(difficulty: string): number {
  switch (difficulty) {
    case "easy":
      return 5 * 60; // 5 minutes
    case "medium":
      return 10 * 60; // 10 minutes
    case "hard":
      return 15 * 60; // 15 minutes
    default:
      return 10 * 60;
  }
}
