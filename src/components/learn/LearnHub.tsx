"use client";

import { useState } from "react";
import { ModuleLearningView } from "@/components/curriculum/ModuleLearningView";
import { LearningPath } from "@/components/curriculum/LearningPath";
import { EnhancedRagAdvisor } from "@/components/advisor/EnhancedRagAdvisor";
import type { LessonMeta } from "@/lib/lessons/fs";

interface Props {
  phases: string[];
  phaseBlocks: {
    phase: string;
    lessons: LessonMeta[];
  }[];
}

type ViewMode = "modules" | "path" | "advisor";

export function LearnHub({ phaseBlocks }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("modules");

  return (
    <div className="relative space-y-10">
      {/* View Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1.5">
          <button
            onClick={() => setViewMode("modules")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "modules"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Modules
          </button>
          <button
            onClick={() => setViewMode("path")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "path"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Learning Path
          </button>
          <button
            onClick={() => setViewMode("advisor")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              viewMode === "advisor"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ask Advisor
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "modules" && <ModuleLearningView phaseBlocks={phaseBlocks} />}
      {viewMode === "path" && <LearningPath />}
      {viewMode === "advisor" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8">
          <EnhancedRagAdvisor />
        </div>
      )}
    </div>
  );
}
