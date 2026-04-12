"use client";

import Link from "next/link";
import { ChallengeFilters } from "@/components/challenge/ChallengeFilters";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";

export function CatalogView() {
  const { state } = useLocalProgress();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B5CF6] text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Follow the structured path</p>
          <p className="text-xs text-gray-500">
            The Learn page organizes challenges into a 13-phase curriculum.
          </p>
        </div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6] px-4 py-2 text-xs font-medium text-white hover:bg-[#7C3AED] cursor-pointer"
        >
          View Curriculum
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      <ChallengeFilters progress={state.challenges} />
    </div>
  );
}
