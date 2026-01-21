"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CHALLENGES, type Challenge } from "@/lib/challenges/catalog";

interface RoadmapNode {
  id: string;
  title: string;
  type: "track" | "challenge" | "milestone";
  slug?: string;
  children: RoadmapNode[];
  status?: "completed" | "in_progress" | "locked" | "available";
  xp?: number;
  difficulty?: string;
}

interface Props {
  progress: Record<string, { status: string }>;
}

export function VisualRoadmap({ progress }: Props) {
  const roadmap = useMemo(() => {
    // Group challenges by track
    const tracks = new Map<string, Challenge[]>();
    
    CHALLENGES.forEach((c) => {
      const existing = tracks.get(c.group) || [];
      existing.push(c);
      tracks.set(c.group, existing);
    });

    // Build tree structure
    const nodes: RoadmapNode[] = [];

    // Phase 0: Foundations
    const foundations = tracks.get("Phase 0 — Foundations") || 
                        Array.from(tracks.entries())
                          .find(([k]) => k.includes("Foundation"))?.[1] || [];
    
    if (foundations.length > 0) {
      nodes.push({
        id: "foundations",
        title: "🧮 Foundations",
        type: "track",
        children: foundations.map((c) => ({
          id: c.slug,
          title: c.title,
          type: "challenge",
          slug: c.slug,
          children: [],
          status: getStatus(c.slug, progress),
          xp: c.xpReward,
          difficulty: c.difficulty,
        })),
      });
    }

    // Vector DB Track
    const vectorDb = Array.from(tracks.entries())
      .find(([k]) => k.includes("Vector"))?.[1] || [];
    
    if (vectorDb.length > 0) {
      nodes.push({
        id: "vector-db",
        title: "🗃️ Vector Database",
        type: "track",
        children: vectorDb.map((c) => ({
          id: c.slug,
          title: c.title,
          type: "challenge",
          slug: c.slug,
          children: [],
          status: getStatus(c.slug, progress),
          xp: c.xpReward,
          difficulty: c.difficulty,
        })),
      });
    }

    // RAG Pipeline Track
    const ragPipeline = Array.from(tracks.entries())
      .find(([k]) => k.includes("RAG Pipeline"))?.[1] || [];
    
    if (ragPipeline.length > 0) {
      nodes.push({
        id: "rag-pipeline",
        title: "🔗 RAG Pipeline",
        type: "track",
        children: ragPipeline.map((c) => ({
          id: c.slug,
          title: c.title,
          type: "challenge",
          slug: c.slug,
          children: [],
          status: getStatus(c.slug, progress),
          xp: c.xpReward,
          difficulty: c.difficulty,
        })),
      });
    }

    // Reranker Track
    const reranker = Array.from(tracks.entries())
      .find(([k]) => k.includes("Reranker"))?.[1] || [];
    
    if (reranker.length > 0) {
      nodes.push({
        id: "reranker",
        title: "🎯 Reranking",
        type: "track",
        children: reranker.map((c) => ({
          id: c.slug,
          title: c.title,
          type: "challenge",
          slug: c.slug,
          children: [],
          status: getStatus(c.slug, progress),
          xp: c.xpReward,
          difficulty: c.difficulty,
        })),
      });
    }

    // Evaluator Track
    const evaluator = Array.from(tracks.entries())
      .find(([k]) => k.includes("Evaluator"))?.[1] || [];
    
    if (evaluator.length > 0) {
      nodes.push({
        id: "evaluator",
        title: "📊 Evaluation",
        type: "track",
        children: evaluator.map((c) => ({
          id: c.slug,
          title: c.title,
          type: "challenge",
          slug: c.slug,
          children: [],
          status: getStatus(c.slug, progress),
          xp: c.xpReward,
          difficulty: c.difficulty,
        })),
      });
    }

    return nodes;
  }, [progress]);

  return (
    <div className="relative space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-emerald-500" /> Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-amber-500" /> In Progress
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" /> Available
        </span>
      </div>

      {/* Roadmap Tracks */}
      <div className="space-y-6">
        {roadmap.map((track, trackIdx) => (
          <div key={track.id} className="relative">
            {/* Vertical connector line */}
            {trackIdx < roadmap.length - 1 && (
              <div className="absolute left-6 top-16 -bottom-6 w-0.5 bg-gradient-to-b from-indigo-300 to-indigo-100 dark:from-indigo-700 dark:to-indigo-900" />
            )}

            {/* Track Header */}
            <div className="flex items-center gap-3">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl text-white shadow-lg">
                {track.title.split(" ")[0]}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {track.title.split(" ").slice(1).join(" ")}
                </h3>
                <p className="text-xs text-zinc-500">
                  {track.children.filter((c) => c.status === "completed").length}/
                  {track.children.length} completed
                </p>
              </div>
            </div>

            {/* Challenges in Track */}
            <div className="ml-6 mt-4 grid gap-3 border-l-2 border-zinc-200 pl-6 dark:border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
              {track.children.map((challenge, idx) => (
                <ChallengeNode
                  key={challenge.id}
                  challenge={challenge}
                  isFirst={idx === 0}
                  isLast={idx === track.children.length - 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Final Milestone */}
      <div className="flex items-center justify-center">
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-6 py-4 text-center dark:border-amber-800 dark:bg-amber-950/20">
          <span className="text-2xl">🏆</span>
          <p className="mt-1 font-semibold text-amber-800 dark:text-amber-200">
            RAG Engineer
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Complete all tracks to unlock
          </p>
        </div>
      </div>
    </div>
  );
}

function getStatus(
  slug: string,
  progress: Record<string, { status: string }>
): "completed" | "in_progress" | "available" {
  const p = progress[slug];
  if (!p) return "available";
  if (p.status === "completed") return "completed";
  if (p.status === "in_progress") return "in_progress";
  return "available";
}

function ChallengeNode({
  challenge,
  isFirst,
  isLast,
}: {
  challenge: RoadmapNode;
  isFirst: boolean;
  isLast: boolean;
}) {
  const statusColors = {
    completed:
      "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
    in_progress:
      "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    available:
      "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
    locked: "border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900",
  };

  const difficultyColors = {
    easy: "text-emerald-600",
    medium: "text-amber-600",
    hard: "text-red-600",
  };

  return (
    <Link
      href={`/challenges/${challenge.slug}`}
      className={`group relative rounded-xl border p-3 transition-all hover:shadow-md ${
        statusColors[challenge.status || "available"]
      }`}
    >
      {/* Connector dot */}
      <div
        className={`absolute -left-[31px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 ${
          challenge.status === "completed"
            ? "border-emerald-500 bg-emerald-500"
            : challenge.status === "in_progress"
              ? "border-amber-500 bg-amber-500"
              : "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
        }`}
      />

      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {challenge.title}
        </p>
        {challenge.status === "completed" && (
          <span className="text-emerald-500">✓</span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2 text-[10px]">
        <span className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors] || "text-zinc-500"}>
          {challenge.difficulty}
        </span>
        <span className="text-zinc-400">{challenge.xp} XP</span>
      </div>
    </Link>
  );
}
