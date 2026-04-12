"use client";

import { useMemo, useState } from "react";

import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { CardLink } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { slugifyId } from "@/lib/utils/slugify";
import type { CurriculumStage } from "@/lib/curriculum/stages";
import { CURRICULUM_STAGE_IDS, CURRICULUM_STAGE_LABELS } from "@/lib/curriculum/stages";

type ChallengeMeta = {
  slug: string;
  title: string;
  description: string;
  stage: CurriculumStage;
  group: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
};

const STAGE_BLURBS: Record<CurriculumStage, string> = {
  foundations: "Vectors, similarity, tokenization, and the minimum mental models.",
  "pre-retrieval":
    "Chunking, metadata, IDs, parsing assumptions — set up for good retrieval.",
  retrieval: "Candidate generation: BM25, dense, hybrid, fusion, filtering.",
  "query-transforms":
    "Rewrite/HyDE/multi‑query/decomposition — improve recall on vague queries.",
  "advanced-retrieval": "Parent-document, recursive, and sophisticated retrieval patterns.",
  "post-retrieval":
    "Rerank, dedupe, diversify, compress, order for LLM attention.",
  "grounding-safety":
    "Citations, refusal, injection resistance, PII/secret hygiene.",
  "agentic-rag": "Tool use, ReAct, self-correction, and autonomous agents.",
  "graph-rag": "Knowledge graphs, entity extraction, and graph-enhanced retrieval.",
  multimodal: "Images, tables, audio, and multi-modal embeddings.",
  "fine-tuning": "Embedding fine-tuning, adapter methods, and domain adaptation.",
  "production-ops": "Caching, rate limiting, monitoring, and scaling strategies.",
  "evaluation-ops": "Metrics, caching, budgets, and production guardrails.",
  frontier: "Late 2025+ techniques: long context, compound systems, frontier evaluation.",
  "capstone-projects": "End-to-end projects combining all RAG skills.",
  arena: "Competitive benchmarks and daily leaderboard challenges.",
};

const STAGES: Array<{ id: CurriculumStage; label: string; blurb: string }> =
  CURRICULUM_STAGE_IDS.map((id) => ({
    id,
    label: CURRICULUM_STAGE_LABELS[id],
    blurb: STAGE_BLURBS[id],
  }));

function cleanGroupLabel(group: string) {
  return group
    .replace(/^Phase\s+\d+\s+—\s+/i, "")
    .replace(/^Production\s+RAG\s+Labs\s+—\s+/i, "")
    .trim();
}

export function ChallengeList({ challenges }: { challenges: ChallengeMeta[] }) {
  const { state } = useLocalProgress();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<CurriculumStage | "all">("all");

  const blocks = useMemo(() => {
    const q = query.trim().toLowerCase();

    const stageOrder = STAGES.map((s) => s.id);
    const groupsByStage = new Map<CurriculumStage, Map<string, ChallengeMeta[]>>();
    const groupOrderByStage = new Map<CurriculumStage, string[]>();

    for (const sid of stageOrder) {
      groupsByStage.set(sid, new Map());
      groupOrderByStage.set(sid, []);
    }

    for (const c of challenges) {
      const sid = c.stage;
      if (stage !== "all" && sid !== stage) continue;

      if (q) {
        const hay = `${c.title} ${c.description} ${c.group}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }

      const rawGroup = c.group || "Challenges";
      const groupLabel = cleanGroupLabel(rawGroup) || rawGroup;

      const stageGroups = groupsByStage.get(sid)!;
      if (!stageGroups.has(groupLabel)) {
        stageGroups.set(groupLabel, []);
        groupOrderByStage.get(sid)!.push(groupLabel);
      }
      stageGroups.get(groupLabel)!.push(c);
    }

    return STAGES.map((s) => {
      const groups = groupOrderByStage.get(s.id)!.map((g) => ({
        group: g,
        items: groupsByStage.get(s.id)!.get(g) ?? [],
      }));
      const total = groups.reduce((acc, g) => acc + g.items.length, 0);
      return { stage: s, groups, total };
    }).filter((b) => b.total > 0);
  }, [challenges, query, stage]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4 sm:grid sm:gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-1">Search</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="BM25, HyDE, rerank, citations…"
            className="h-12 sm:h-10 w-full rounded-2xl border border-gray-200 bg-white px-4 text-base sm:text-sm outline-none focus:ring-2 focus:ring-[#8B5CF6]400 dark:border-gray-800 dark:bg-[#7C3AED] dark:focus:ring-[#8B5CF6]600"
          />
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-1">Filter by stage</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStage("all")}
              className={[
                "rounded-full border px-3 py-2 sm:py-1 text-sm sm:text-xs font-medium transition-all duration-200-all duration-200 touch-target",
                stage === "all"
                  ? "border-gray-950 bg-[#7C3AED] text-white dark:border-white/25 dark:bg-white/10"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]",
              ].join(" ")}
            >
              All
            </button>
            {STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStage(s.id)}
                className={[
                  "rounded-full border px-3 py-2 sm:py-1 text-sm sm:text-xs font-medium transition-all duration-200-all duration-200 touch-target",
                  stage === s.id
                    ? "border-gray-950 bg-[#7C3AED] text-white dark:border-white/25 dark:bg-white/10"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {blocks.map((b) => (
        <section
          key={b.stage.id}
          id={slugifyId(`stage-${b.stage.id}`)}
          className="flex scroll-mt-20 flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">{b.stage.label}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {b.stage.blurb}
              </p>
            </div>
            <Badge variant="muted">{b.total} challenges</Badge>
          </div>

          {b.groups.map((g) => (
            <div key={`${b.stage.id}-${g.group}`} className="flex flex-col gap-3">
              <a
                href={`#${slugifyId(`${b.stage.id}-${g.group}`)}`}
                id={slugifyId(`${b.stage.id}-${g.group}`)}
                className="text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                {g.group}
              </a>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {g.items.map((c) => {
                  const progress = state.challenges[c.slug];
                  const status = progress?.status ?? "not_started";
                  const done = status === "completed";

                  return (
                    <CardLink
                      key={c.slug}
                      href={`/challenges/${c.slug}`}
                      className="p-4 sm:p-5 touch-manipulation active:scale-[0.99] transition-all duration-200-transform cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {c.title}{" "}
                            {done ? <Badge variant="accent">Completed</Badge> : null}
                          </p>
                          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {c.description}
                          </p>
                        </div>
                        <Badge variant="muted" className="flex-shrink-0">
                          {c.xpReward} XP
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center gap-1 ${
                            status === "completed" ? "text-emerald-600" : 
                            status === "in_progress" ? "text-blue-600" : ""
                          }`}>
                            {status === "completed" && "✓ "}
                            {status.replace("_", " ")}
                          </span>
                          {typeof progress?.attempts === "number" && progress.attempts > 0
                            ? ` · ${progress.attempts} attempts`
                            : ""}
                        </p>
                        <span className={`text-xs font-medium ${
                          c.difficulty === "easy" ? "text-emerald-600" :
                          c.difficulty === "medium" ? "text-amber-600" :
                          "text-red-600"
                        }`}>
                          {c.difficulty}
                        </span>
                      </div>
                    </CardLink>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}


