"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import {
  lessonId,
  markLessonCompleted,
  markLessonViewed,
  resetLesson,
} from "@/lib/progress/localStore";
import { CURRICULUM_STAGE_LABELS } from "@/lib/curriculum/stages";
import type { CurriculumStage } from "@/lib/curriculum/stages";

type Props = {
  phase: string;
  slug: string;
  stage: CurriculumStage;
  estimatedMinutes: number;
  outcomes: string[];
};

export function LessonProgressControls({
  phase,
  slug,
  stage,
  estimatedMinutes,
  outcomes,
}: Props) {
  const { state, setState } = useLocalProgress();
  const id = useMemo(() => lessonId(phase, slug), [phase, slug]);
  const status = state.lessons[id]?.status ?? "not_started";
  const completed = status === "completed";

  useEffect(() => {
    // Mark as "in progress" on view (but don't overwrite completed).
    if (completed) return;
    setState((prev) => {
      const next = { ...prev, lessons: { ...prev.lessons } };
      const existing = prev.lessons[id];
      if (existing) next.lessons[id] = { ...existing };
      markLessonViewed(next, id);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, id, setState]);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{CURRICULUM_STAGE_LABELS[stage]}</Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ~{estimatedMinutes} min
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Status:{" "}
              <span className="font-medium text-zinc-950 dark:text-zinc-50">
                {status.replace("_", " ")}
              </span>
            </span>
          </div>

          {outcomes.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Outcomes
              </p>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
                {outcomes.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="mt-[0.42rem] size-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-white/20" />
                    <span className="min-w-0">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={completed}
            onClick={() => {
              if (completed) return;
              setState((prev) => {
                const next = { ...prev, lessons: { ...prev.lessons } };
                const existing = prev.lessons[id];
                if (existing) next.lessons[id] = { ...existing };
                markLessonCompleted(next, id);
                return next;
              });
            }}
            className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {completed ? "Completed" : "Mark complete"}
          </button>
          <button
            type="button"
            disabled={completed}
            onClick={() => {
              if (completed) return;
              setState((prev) => {
                const next = { ...prev, lessons: { ...prev.lessons } };
                const existing = prev.lessons[id];
                if (existing) next.lessons[id] = { ...existing };
                resetLesson(next, id);
                return next;
              });
            }}
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Reset
          </button>
          <Link
            href="/plan"
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Plan
          </Link>
        </div>
      </div>
    </Card>
  );
}


