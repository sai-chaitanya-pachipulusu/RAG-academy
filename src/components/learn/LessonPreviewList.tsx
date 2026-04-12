"use client";

import Link from "next/link";

import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { Badge } from "@/components/ui/Badge";
import { lessonId } from "@/lib/progress/localStore";

type LessonPreview = {
  phase: string;
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
};

export function LessonPreviewList({ lessons }: { lessons: LessonPreview[] }) {
  const { state } = useLocalProgress();

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-white/10">
      {lessons.map((l) => {
        const id = lessonId(l.phase, l.slug);
        const status = state.lessons[id]?.status ?? "not_started";
        const badge =
          status === "completed" ? (
            <Badge variant="accent">completed</Badge>
          ) : status === "in_progress" ? (
            <Badge>in progress</Badge>
          ) : (
            <Badge variant="muted">not started</Badge>
          );

        return (
          <li key={l.slug}>
            <Link
              href={`/learn/${l.phase}/${l.slug}`}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-950 dark:text-gray-50">
                  {l.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {l.description}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {l.estimatedMinutes}m
                </span>
                {badge}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}


