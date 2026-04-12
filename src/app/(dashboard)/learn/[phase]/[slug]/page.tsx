import { notFound } from "next/navigation";
import Link from "next/link";

import { MDXRenderer } from "@/components/learn/MDXRenderer";
import { LessonProgressControls } from "@/components/learn/LessonProgressControls";
import { LessonSources } from "@/components/learn/LessonSources";
import { Card, CardLink } from "@/components/ui/Card";
import { getLesson, listLessonsByPhase } from "@/lib/lessons/fs";
import { formatPhaseLabel } from "@/lib/lessons/format";

type Props = {
  params: Promise<{
    phase: string;
    slug: string;
  }>;
};

export default async function LessonPage({ params }: Props) {
  const { phase, slug } = await params;
  const lesson = await getLesson(phase, slug);
  if (!lesson) notFound();

  const allInPhase = await listLessonsByPhase(phase);
  const idx = allInPhase.findIndex((l) => l.slug === slug);
  const prev = idx > 0 ? allInPhase[idx - 1] : null;
  const next = idx >= 0 && idx < allInPhase.length - 1 ? allInPhase[idx + 1] : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Learn / {formatPhaseLabel(lesson.phase)} / {lesson.slug}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {lesson.title}
        </h1>
        {lesson.description ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {lesson.description}
          </p>
        ) : null}
        <div className="mt-3">
          <Link
            href={`/learn/${phase}`}
            className="text-sm font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
          >
            Back to phase →
          </Link>
        </div>
      </header>

      <LessonProgressControls
        phase={lesson.phase}
        slug={lesson.slug}
        stage={lesson.stage}
        estimatedMinutes={lesson.estimatedMinutes}
        outcomes={lesson.outcomes}
      />

      <MDXRenderer source={lesson.body} />

      <LessonSources sources={lesson.sources} />

      <section className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <CardLink href={`/learn/${prev.phase}/${prev.slug}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Previous lesson</p>
            <p className="mt-1 text-sm font-medium">{prev.title}</p>
          </CardLink>
        ) : (
          <Card>
            <p className="text-xs text-gray-500 dark:text-gray-400">Previous lesson</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              You’re at the start of this phase.
            </p>
          </Card>
        )}

        {next ? (
          <CardLink href={`/learn/${next.phase}/${next.slug}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next lesson</p>
            <p className="mt-1 text-sm font-medium">{next.title}</p>
          </CardLink>
        ) : (
          <Card>
            <p className="text-xs text-gray-500 dark:text-gray-400">Next lesson</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              End of phase. Jump to the next phase or follow the Study Plan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/plan"
                className="text-sm font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
              >
                Study Plan →
              </Link>
              <Link
                href="/learn"
                className="text-sm font-medium text-gray-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:text-gray-50 dark:decoration-white/25 dark:hover:decoration-white/50 cursor-pointer"
              >
                All phases →
              </Link>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}


