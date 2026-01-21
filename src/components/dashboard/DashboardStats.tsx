"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { getLevelInfo } from "@/lib/gamification/xp";
import { Card } from "@/components/ui/Card";

export function DashboardStats() {
  const { state } = useLocalProgress();
  const level = getLevelInfo(state.xp);

  const completed = useMemo(() => {
    return Object.values(state.challenges).filter((c) => c.status === "completed")
      .length;
  }, [state.challenges]);

  const completedLessons = useMemo(() => {
    return Object.values(state.lessons).filter((l) => l.status === "completed")
      .length;
  }, [state.lessons]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <p className="text-sm font-medium">XP</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{state.xp}</p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Level {level.level} · {level.title}
        </p>
      </Card>
      <Card>
        <p className="text-sm font-medium">Streak</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {state.streak.streakDays}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Last activity: {state.streak.lastActivityDate ?? "—"}
        </p>
      </Card>
      <Card>
        <p className="text-sm font-medium">Lessons</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {completedLessons}
        </p>
        <Link
          href="/learn"
          className="mt-2 inline-flex text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Continue →
        </Link>
      </Card>
      <Card>
        <p className="text-sm font-medium">Challenges</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{completed}</p>
        <Link
          href="/challenges"
          className="mt-2 inline-flex text-sm font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Continue →
        </Link>
      </Card>
    </div>
  );
}


