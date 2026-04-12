"use client";

import { CardLink } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { lessonId } from "@/lib/progress/localStore";
import { CURRICULUM_STAGE_LABELS } from "@/lib/curriculum/stages";
import type { CurriculumStage } from "@/lib/curriculum/stages";

type LessonCardMeta = {
  phase: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  stage: CurriculumStage;
};

export function LessonCards({ lessons }: { lessons: LessonCardMeta[] }) {
  const { state } = useLocalProgress();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {lessons.map((l) => {
        const id = lessonId(l.phase, l.slug);
        const status = state.lessons[id]?.status ?? "not_started";
        const statusBadge =
          status === "completed" ? (
            <Badge variant="accent">completed</Badge>
          ) : status === "in_progress" ? (
            <Badge>in progress</Badge>
          ) : (
            <Badge variant="muted">not started</Badge>
          );

        return (
          <CardLink key={l.slug} href={`/learn/${l.phase}/${l.slug}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{l.title}</p>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge variant="muted">{CURRICULUM_STAGE_LABELS[l.stage]}</Badge>
                {statusBadge}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {l.description}
            </p>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {l.estimatedMinutes} min · lesson {l.order}
            </p>
          </CardLink>
        );
      })}
    </div>
  );
}


