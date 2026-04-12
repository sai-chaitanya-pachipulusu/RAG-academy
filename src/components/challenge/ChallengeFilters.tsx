"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CHALLENGES, type Challenge } from "@/lib/challenges/catalog";
import { CHALLENGE_STAGE_BY_SLUG } from "@/lib/challenges/defs/stageBySlug";
import { Reveal } from "@/components/ui/Reveal";
import { isChallengeFree, countFreeChallenges } from "@/lib/challenges/access";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

type FilterDifficulty = "all" | "easy" | "medium" | "hard";
type FilterStatus = "all" | "completed" | "in_progress" | "not_started";
type SortBy = "default" | "difficulty" | "xp";

const MODULES = [
  { id: "foundations", name: "Foundations", stages: ["foundations"] },
  { id: "data-ingestion", name: "Data Ingestion", stages: ["pre-retrieval"] },
  { id: "query-optimization", name: "Query Analysis", stages: ["query-transforms"] },
  { id: "hybrid-retrieval", name: "Hybrid Retrieval", stages: ["retrieval"] },
  { id: "advanced-retrieval", name: "Advanced Retrieval", stages: ["advanced-retrieval"] },
  { id: "post-retrieval", name: "Post-Retrieval", stages: ["post-retrieval"] },
  { id: "grounding-safety", name: "Grounding & Safety", stages: ["grounding-safety"] },
  { id: "agentic-rag", name: "Agentic RAG", stages: ["agentic-rag"] },
  { id: "evaluation", name: "Evaluation", stages: ["evaluation-ops"] },
  { id: "production-ops", name: "Production", stages: ["production-ops", "capstone-projects", "arena"] },
  { id: "multimodal", name: "Multimodal", stages: ["multimodal", "graph-rag"] },
  { id: "fine-tuning", name: "Fine-Tuning", stages: ["fine-tuning"] },
] as const;

interface Props {
  progress: Record<string, { status: string }>;
}

function getModuleForChallenge(slug: string) {
  const stage = CHALLENGE_STAGE_BY_SLUG[slug];
  for (const mod of MODULES) {
    if ((mod.stages as readonly string[]).includes(stage)) {
      return mod;
    }
  }
  return null;
}

export function ChallengeFilters({ progress }: Props) {
  const { user, hasPaidAccess } = useSupabaseAuth();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<FilterDifficulty>("all");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  
  // User has full access if they have a paid subscription
  const hasFullAccess = hasPaidAccess;

  const filteredChallenges = useMemo(() => {
    let result = [...CHALLENGES];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(searchLower) || c.description.toLowerCase().includes(searchLower)
      );
    }

    if (difficulty !== "all") {
      result = result.filter((c) => c.difficulty === difficulty);
    }

    if (selectedModule !== "all") {
      result = result.filter((c) => {
        const mod = getModuleForChallenge(c.slug);
        return mod?.id === selectedModule;
      });
    }

    if (status !== "all") {
      result = result.filter((c) => {
        const p = progress[c.slug];
        const challengeStatus = p?.status || "not_started";
        return challengeStatus === status;
      });
    }

    if (sortBy === "difficulty") {
      const order = { easy: 0, medium: 1, hard: 2 };
      result.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    } else if (sortBy === "xp") {
      result.sort((a, b) => b.xpReward - a.xpReward);
    }

    return result;
  }, [search, difficulty, status, sortBy, selectedModule, progress]);

  const stats = useMemo(() => {
    const total = CHALLENGES.length;
    const completed = Object.values(progress).filter((p) => p.status === "completed").length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  }, [progress]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search challenges... (e.g., BM25, rerank, HNSW)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50/50 pl-10 pr-16 text-sm outline-none transition-all duration-200-all duration-200 focus:border-[#8B5CF6]300 focus:bg-white cursor-pointer"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as FilterDifficulty)}
            className="h-9 rounded-lg border border-gray-100 bg-white px-3 text-xs font-medium text-gray-600 outline-none hover:border-gray-200 cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FilterStatus)}
            className="h-9 rounded-lg border border-gray-100 bg-white px-3 text-xs font-medium text-gray-600 outline-none hover:border-gray-200 cursor-pointer"
          >
            <option value="all">Any Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-9 rounded-lg border border-gray-100 bg-white px-3 text-xs font-medium text-gray-600 outline-none hover:border-gray-200 cursor-pointer"
          >
            <option value="default">Default</option>
            <option value="difficulty">Difficulty</option>
            <option value="xp">XP Reward</option>
          </select>
        </div>
      </div>

      {/* Module Pills */}
      <div className="overflow-x-auto pb-1 -mx-6 px-6">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setSelectedModule("all")}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all duration-200-all duration-200 ${
              selectedModule === "all"
                ? "bg-[#8B5CF6] text-white shadow-lg"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            All ({stats.total})
          </button>
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200-all duration-200 ${
                selectedModule === mod.id
                  ? "bg-[#8B5CF6] text-white shadow-lg"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {mod.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs">
        <p className="text-gray-500">
          <span className="font-bold text-gray-900">{filteredChallenges.length}</span> challenges
        </p>
        <p className="text-gray-500">
          <span className="font-bold text-emerald-600">{stats.completed}</span> done ({stats.percentage}%)
        </p>
      </div>

      {/* Challenge Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredChallenges.map((challenge, i) => {
          const p = progress[challenge.slug];
          const challengeStatus = p?.status || "not_started";
          const mod = getModuleForChallenge(challenge.slug);
          const isFree = isChallengeFree(challenge);
          const isLocked = !isFree && !hasFullAccess;

          return (
            <Reveal key={challenge.slug} delayMs={Math.min(i * 30, 300)}>
              <Link
                href={`/challenges/${challenge.slug}`}
                className={`group flex flex-col h-full rounded-xl border bg-white p-4 transition-all duration-200-all duration-200 hover:shadow-lg hover:shadow-zinc-100/50 ${
                  isLocked 
                    ? "border-gray-100 opacity-75 hover:opacity-100 hover:border-gray-200" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    challengeStatus === "completed"
                      ? "bg-emerald-50"
                      : isLocked
                        ? "bg-gray-100"
                        : "bg-gray-50"
                  }`}>
                    {challengeStatus === "completed" ? (
                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isLocked ? (
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isFree && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-600">
                        Free
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      challenge.difficulty === "easy"
                        ? "bg-emerald-50 text-emerald-600"
                        : challenge.difficulty === "medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-600 transition-all duration-200-all duration-200 line-clamp-1 cursor-pointer">
                  {challenge.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2 flex-1">
                  {challenge.description}
                </p>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    {mod?.name || "General"}
                  </span>
                  <span className="text-[10px] font-bold text-gray-900">
                    +{challenge.xpReward} XP
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredChallenges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No challenges found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query.</p>
          <button
            onClick={() => {
              setSearch("");
              setDifficulty("all");
              setStatus("all");
              setSelectedModule("all");
            }}
            className="mt-4 text-sm font-semibold text-gray-900 underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
