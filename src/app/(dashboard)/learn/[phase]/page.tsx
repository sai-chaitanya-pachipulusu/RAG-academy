import { notFound } from "next/navigation";

import { listLessonsByPhase, listPhases } from "@/lib/lessons/fs";
import { formatPhaseLabel } from "@/lib/lessons/format";
import { Card } from "@/components/ui/Card";
import { LessonCards } from "@/components/learn/LessonCards";

type Props = {
  params: Promise<{
    phase: string;
  }>;
};

export default async function PhaseLessonsPage({ params }: Props) {
  const { phase } = await params;
  const phases = await listPhases();
  if (!phases.includes(phase)) notFound();

  const lessons = await listLessonsByPhase(phase);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Learn / {formatPhaseLabel(phase)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {formatPhaseLabel(phase)}
        </h1>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <p className="text-sm font-medium">No lessons in this phase yet</p>
        </Card>
      ) : (
        <LessonCards lessons={lessons} />
      )}
    </div>
  );
}


