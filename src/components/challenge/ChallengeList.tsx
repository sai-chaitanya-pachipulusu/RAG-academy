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
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Search</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="BM25, HyDE, rerank, citations…"
            className="mt-1 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
          />
        </div>

        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Filter by stage</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStage("all")}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                stage === "all"
                  ? "border-zinc-950 bg-zinc-950 text-white dark:border-white/25 dark:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]",
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
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  stage === s.id
                    ? "border-zinc-950 bg-zinc-950 text-white dark:border-white/25 dark:bg-white/10"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]",
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
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
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
                className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {g.group}
              </a>

              <div className="grid gap-3 sm:grid-cols-2">
                {g.items.map((c) => {
                  const progress = state.challenges[c.slug];
                  const status = progress?.status ?? "not_started";
                  const done = status === "completed";

                  return (
                    <CardLink
                      key={c.slug}
                      href={`/challenges/${c.slug}`}
                      className="p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {c.title}{" "}
                          {done ? <Badge variant="accent">Completed</Badge> : null}
                        </p>
                        <Badge variant="muted">
                          {c.difficulty} · {c.xpReward} XP
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        {c.description}
                      </p>
                      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                        Status: {status.replace("_", " ")}
                        {typeof progress?.attempts === "number" && progress.attempts > 0
                          ? ` · attempts: ${progress.attempts}`
                          : ""}
                      </p>
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


