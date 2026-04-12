"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Card } from "@/components/ui/Card";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { FAST_TRACK } from "@/lib/curriculum/plan";
import { lessonId } from "@/lib/progress/localStore";

type NextStep =
  | { kind: "lesson"; href: string; label: string; phase: string; slug: string }
  | { kind: "challenge"; href: string; label: string; slug: string }
  | null;

function parseLessonHref(href: string) {
  const m = href.match(/^\/learn\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { phase: m[1], slug: m[2] };
}

function parseChallengeHref(href: string) {
  const m = href.match(/^\/challenges\/([^/]+)$/);
  if (!m) return null;
  return { slug: m[1] };
}

export function ContinueCard() {
  const { state } = useLocalProgress();

  const next = useMemo<NextStep>(() => {
    for (const week of FAST_TRACK) {
      for (const item of [...week.learn, ...week.challenges]) {
        const lesson = parseLessonHref(item.href);
        if (lesson) {
          const id = lessonId(lesson.phase, lesson.slug);
          const status = state.lessons[id]?.status ?? "not_started";
          if (status !== "completed") {
            return {
              kind: "lesson",
              href: item.href,
              label: item.label,
              phase: lesson.phase,
              slug: lesson.slug,
            };
          }
          continue;
        }

        const challenge = parseChallengeHref(item.href);
        if (challenge) {
          const status = state.challenges[challenge.slug]?.status ?? "not_started";
          if (status !== "completed") {
            return {
              kind: "challenge",
              href: item.href,
              label: item.label,
              slug: challenge.slug,
            };
          }
          continue;
        }
      }
    }
    return null;
  }, [state.challenges, state.lessons]);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">Continue</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {next ? next.label : "You’re caught up"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {next
              ? "Next recommended step from the Study Plan."
              : "Pick a Compare lab or start a Project to go deeper."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {next ? (
            <Link
              href={next.href}
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#2563EB] dark:bg-white dark:text-black dark:hover:bg-[#2563EB] cursor-pointer"
            >
              Continue →
            </Link>
          ) : (
            <Link
              href="/projects"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#2563EB] dark:bg-white dark:text-black dark:hover:bg-[#2563EB] cursor-pointer"
            >
              Start a project →
            </Link>
          )}
          <Link
            href="/plan"
            className="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-950 hover:bg-gray-50 dark:border-gray-800 dark:bg-[#2563EB] dark:text-gray-50 dark:hover:bg-gray-900 cursor-pointer"
          >
            Study Plan
          </Link>
        </div>
      </div>
    </Card>
  );
}


