"use client";

import { useMemo } from "react";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { getLevelInfo } from "@/lib/gamification/xp";
import { PreferencesPanel } from "@/components/preferences/PreferencesPanel";
import { LLMSettingsPanel } from "@/components/llm/LLMSettingsPanel";

export function ProfileSection() {
  const { state, reset } = useLocalProgress();
  const level = getLevelInfo(state.xp);

  const completedCount = useMemo(() => {
    return Object.values(state.challenges).filter((c) => c.status === "completed")
      .length;
  }, [state.challenges]);

  return (
    <div className="space-y-6">
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p className="text-sm font-medium">Level</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Level {level.level} · {level.title}
          </p>
          <p className="mt-2 text-sm">
            <span className="font-medium">{state.xp}</span> XP
          </p>
          {level.nextLevelXp !== null ? (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Next level at {level.nextLevelXp} XP
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p className="text-sm font-medium">Streak</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {state.streak.streakDays} day streak
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Last activity: {state.streak.lastActivityDate ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p className="text-sm font-medium">Challenges</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Completed: {completedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <p className="text-sm font-medium">Reset</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Clears local XP, streak, and challenge progress.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Reset local progress
          </button>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
         <PreferencesPanel />
         <LLMSettingsPanel />
      </div>
    </div>
  );
}
