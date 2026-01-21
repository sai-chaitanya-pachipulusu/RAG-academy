"use client";

import { useState } from "react";
import { ProgressAnalytics } from "@/components/analytics/ProgressAnalytics";
import { SkillTree } from "@/components/visualizers/SkillTree";
import { DailyStreak, StreakMilestones } from "@/components/gamification/DailyStreak";

type ViewMode = "overview" | "skills" | "streak";

export default function ProgressPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Progress</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Track your RAG mastery journey across all challenges and skills.
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            onClick={() => setViewMode("overview")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "overview"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>📊</span>
            Overview
          </button>
          <button
            onClick={() => setViewMode("skills")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "skills"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>🌳</span>
            Skill Tree
          </button>
          <button
            onClick={() => setViewMode("streak")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "streak"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            <span>🔥</span>
            Streaks
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "overview" && (
        <div className="flex flex-col gap-8">
          <ProgressAnalytics />
        </div>
      )}

      {viewMode === "skills" && <SkillTree />}

      {viewMode === "streak" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <DailyStreak />
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <span>🏅</span>
                Streak Milestones
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                Unlock achievements by maintaining your learning streak
              </p>
              <div className="mt-4">
                <StreakMilestones />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <span>💡</span>
                Streak Tips
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Complete at least one challenge or quiz daily</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Use freeze days when you need a break</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Set a consistent time each day for learning</span>
                </li>
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>Enable streak reminders in settings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
