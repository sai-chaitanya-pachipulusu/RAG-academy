"use client";

import { useState } from "react";
import { ProgressAnalytics } from "@/components/analytics/ProgressAnalytics";
import { SkillTree } from "@/components/visualizers/SkillTree";
import { DailyStreak, StreakMilestones } from "@/components/gamification/DailyStreak";

type ViewMode = "overview" | "skills" | "streak";

export default function ProgressPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Your Progress</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Track your RAG mastery journey.
        </p>
      </div>

      {/* View Toggle */}
      <div className="inline-flex gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1">
        {([
          { id: "overview" as const, label: "Overview" },
          { id: "skills" as const, label: "Skill Tree" },
          { id: "streak" as const, label: "Streaks" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              viewMode === tab.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "overview" && <ProgressAnalytics />}

      {viewMode === "skills" && <SkillTree />}

      {viewMode === "streak" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <DailyStreak />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Streak Milestones</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Unlock achievements by maintaining your streak
              </p>
              <div className="mt-3">
                <StreakMilestones />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Streak Tips</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <li className="flex gap-1.5">
                  <span className="text-emerald-500">+</span>
                  <span>Complete at least one challenge daily</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-emerald-500">+</span>
                  <span>Use freeze days when you need a break</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-emerald-500">+</span>
                  <span>Set a consistent time each day for learning</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="text-emerald-500">+</span>
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
