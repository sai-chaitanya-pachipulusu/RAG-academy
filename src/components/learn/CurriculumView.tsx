"use client";

import { useState } from "react";
import { DEEP_TRACK, FAST_TRACK, type PlanWeek } from "@/lib/curriculum/plan";
import { WeekCard } from "./WeekCard";
import { VisualRoadmap } from "@/components/roadmap/VisualRoadmap";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { CURRICULUM_STAGE_LABELS } from "@/lib/curriculum/stages";

function parseLessonHref(href: string) {
  const m = href.match(/^\/learn\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { phase: m[1], slug: m[2], id: `${m[1]}/${m[2]}` };
}

function parseChallengeHref(href: string) {
  const m = href.match(/^\/challenges\/([^/]+)$/);
  if (!m) return null;
  return { slug: m[1] };
}

export function CurriculumView() {
  const { state } = useLocalProgress();
  const [track, setTrack] = useState<"deep" | "fast">("deep");

  const plan = track === "deep" ? DEEP_TRACK : FAST_TRACK;

  const getStageLabel = (href: string) => {
    // Simplified stage logic for client-side
    const l = parseLessonHref(href);
    if (l) return CURRICULUM_STAGE_LABELS[l.phase as keyof typeof CURRICULUM_STAGE_LABELS];
    
    return null;
  };

  return (
    <div className="flex flex-col gap-10">
      
      {/* Visual Roadmap Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-semibold tracking-tight">The Path</h2>
        </div>
        <div className="mb-8">
          <ActivityHeatmap />
        </div>
        <VisualRoadmap progress={state.challenges} />
      </section>

      {/* Weekly Plan Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Study Plan</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
               Weekly schedule to stay on track.
            </p>
          </div>
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-[#7C3AED]">
            <button
              onClick={() => setTrack("deep")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                track === "deep"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Deep Dive (8 weeks)
            </button>
            <button
              onClick={() => setTrack("fast")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                track === "fast"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Fast Track (4 weeks)
            </button>
          </div>
        </div>

        <div className="grid gap-6">
        {plan.map((week) => (
          <WeekCard key={week.week} w={week} getStageLabel={getStageLabel} />
        ))}
        </div>
      </section>
    </div>
  );
}
