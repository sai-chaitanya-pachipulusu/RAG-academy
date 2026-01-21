"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CHALLENGES, type Challenge } from "@/lib/challenges/catalog";
import { CHALLENGE_STAGE_BY_SLUG } from "@/lib/challenges/defs/stageBySlug";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";

// Phase definitions with icons and colors
const PHASES = [
  { id: "foundations", name: "Phase 0: Foundations", icon: "🧮", color: "from-blue-500 to-cyan-500", description: "Vector math and embeddings" },
  { id: "pre-retrieval", name: "Phase 1: Data Layer", icon: "📦", color: "from-emerald-500 to-teal-500", description: "Chunking and indexing" },
  { id: "retrieval", name: "Phase 2: Retrieval", icon: "🔍", color: "from-purple-500 to-indigo-500", description: "Search and query engineering" },
  { id: "query-transforms", name: "Phase 2.5: Query Transforms", icon: "🔄", color: "from-violet-500 to-purple-500", description: "Query expansion and rewriting" },
  { id: "post-retrieval", name: "Phase 3: Reranking", icon: "🎯", color: "from-amber-500 to-orange-500", description: "Context optimization" },
  { id: "agentic-rag", name: "Phase 4: Agentic RAG", icon: "🤖", color: "from-rose-500 to-pink-500", description: "Agents and tools" },
  { id: "grounding-safety", name: "Phase 5: Security", icon: "🛡️", color: "from-red-500 to-rose-500", description: "Safety and compliance" },
  { id: "multimodal", name: "Phase 6: Multi-Modal", icon: "🖼️", color: "from-fuchsia-500 to-pink-500", description: "Tables, images, audio" },
  { id: "advanced-retrieval", name: "Phase 7: SOTA Architectures", icon: "🚀", color: "from-sky-500 to-blue-500", description: "ColBERT, RAPTOR, Self-RAG" },
  { id: "production-ops", name: "Phase 8: Infrastructure", icon: "⚙️", color: "from-slate-500 to-zinc-600", description: "Scaling and optimization" },
  { id: "evaluation-ops", name: "Phase 9: Evaluation", icon: "📊", color: "from-lime-500 to-green-500", description: "LLM-as-a-Judge" },
  { id: "fine-tuning", name: "Phase 10: Fine-Tuning", icon: "🎓", color: "from-yellow-500 to-amber-500", description: "Model customization" },
] as const;

export function PhaseProgressionView() {
  const { state } = useLocalProgress();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  // Group challenges by phase/stage
  const phaseData = useMemo(() => {
    return PHASES.map((phase) => {
      const challenges = CHALLENGES.filter((c) => {
        const stage = CHALLENGE_STAGE_BY_SLUG[c.slug];
        return stage === phase.id;
      });

      const completed = challenges.filter(
        (c) => state.challenges[c.slug]?.status === "completed"
      ).length;

      const inProgress = challenges.filter(
        (c) => state.challenges[c.slug]?.status === "in_progress"
      ).length;

      return {
        ...phase,
        challenges,
        completed,
        inProgress,
        total: challenges.length,
        progress: challenges.length > 0 ? (completed / challenges.length) * 100 : 0,
      };
    }).filter((p) => p.total > 0); // Only show phases with challenges
  }, [state.challenges]);

  // Calculate overall stats
  const totalCompleted = phaseData.reduce((sum, p) => sum + p.completed, 0);
  const totalChallenges = phaseData.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-8">
      {/* Overall Progress Header */}
      <div className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-6 dark:border-white/10 dark:from-zinc-900 dark:to-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your RAG Journey</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {totalCompleted} of {totalChallenges} challenges completed
            </p>
          </div>
          <div className="relative h-16 w-16">
            {/* Circular Progress Ring */}
            <svg className="h-16 w-16 -rotate-90 transform">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-zinc-200 dark:text-zinc-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(totalCompleted / totalChallenges) * 176} 176`}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {Math.round((totalCompleted / totalChallenges) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-amber-500 dark:opacity-50" />

        <div className="space-y-4">
          {phaseData.map((phase, index) => (
            <div key={phase.id} className="relative pl-16">
              {/* Timeline Node */}
              <div
                className={`absolute left-3 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs ${
                  phase.progress === 100
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : phase.progress > 0
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900"
                }`}
              >
                {phase.progress === 100 ? "✓" : index}
              </div>

              {/* Phase Card */}
              <div
                className={`group cursor-pointer rounded-xl border transition-all ${
                  expandedPhase === phase.id
                    ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
                }`}
                onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
              >
                {/* Phase Header */}
                <div className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${phase.color} text-lg text-white shadow-sm`}>
                    {phase.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {phase.name}
                      </h3>
                      <span className="ml-2 text-xs text-zinc-500">
                        {phase.completed}/{phase.total}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {phase.description}
                    </p>
                    {/* Mini progress bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${phase.color} transition-all`}
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 text-zinc-400 transition-transform ${
                      expandedPhase === phase.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded Challenge List */}
                {expandedPhase === phase.id && (
                  <div className="border-t border-zinc-200 p-4 dark:border-white/10">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {phase.challenges.map((challenge) => {
                        const status = state.challenges[challenge.slug]?.status;
                        return (
                          <Link
                            key={challenge.slug}
                            href={`/challenges/${challenge.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-white/5 ${
                              status === "completed"
                                ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                                : status === "in_progress"
                                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"
                                  : "border-zinc-200 dark:border-zinc-800"
                            }`}
                          >
                            <span className="flex-shrink-0">
                              {status === "completed" ? "✅" : status === "in_progress" ? "🔄" : "○"}
                            </span>
                            <span className="truncate">{challenge.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Final Milestone */}
        <div className="relative pl-16 pt-4">
          <div className="absolute left-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500 text-white text-xs">
            🏆
          </div>
          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 text-center dark:border-amber-800 dark:from-amber-950/20 dark:to-yellow-950/20">
            <p className="font-bold text-amber-800 dark:text-amber-200">
              RAG Engineer Certification
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Complete all phases to unlock
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
