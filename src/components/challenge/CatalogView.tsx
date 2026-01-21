"use client";

import Link from "next/link";
import { ChallengeFilters } from "@/components/challenge/ChallengeFilters";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { Reveal } from "@/components/ui/Reveal";

export function CatalogView() {
  const { state } = useLocalProgress();

  return (
    <div className="space-y-8">
      {/* Pro Tip Banner */}
      <Reveal>
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-6 sm:flex-row">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-zinc-900">Follow the structured path</p>
            <p className="mt-0.5 text-sm text-zinc-500">
              The Learn page organizes challenges into a 12-module curriculum for systematic mastery.
            </p>
          </div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            View Curriculum
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </Reveal>

      <ChallengeFilters progress={state.challenges} />
    </div>
  );
}
