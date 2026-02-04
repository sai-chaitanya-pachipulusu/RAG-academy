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
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-900">Level</p>
          <p className="mt-1 text-sm text-zinc-600">
            Level {level.level} · {level.title}
          </p>
          <p className="mt-2 text-sm text-zinc-900">
            <span className="font-medium">{state.xp}</span> XP
          </p>
          {level.nextLevelXp !== null ? (
            <p className="mt-1 text-xs text-zinc-500">
              Next level at {level.nextLevelXp} XP
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-900">Streak</p>
          <p className="mt-1 text-sm text-zinc-600">
            {state.streak.streakDays} day streak
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Last activity: {state.streak.lastActivityDate ?? "—"}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-900">Challenges</p>
          <p className="mt-1 text-sm text-zinc-600">
            Completed: {completedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-900">Reset</p>
          <p className="mt-1 text-sm text-zinc-600">
            Clears local XP, streak, and challenge progress.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-950 hover:bg-zinc-50"
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
