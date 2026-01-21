"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { CHALLENGES } from "@/lib/challenges/catalog";

interface SkillNode {
  id: string;
  name: string;
  icon: string;
  description: string;
  challengeSlugs: string[];
  prerequisites: string[];
  position: { x: number; y: number };
}

// Define skill tree nodes
const SKILL_NODES: SkillNode[] = [
  // Row 1 - Foundations
  {
    id: "embeddings",
    name: "Embeddings",
    icon: "🧬",
    description: "Vector representations of text",
    challengeSlugs: ["cosine-similarity", "embedding-visualization"],
    prerequisites: [],
    position: { x: 50, y: 10 },
  },
  
  // Row 2 - Core Retrieval
  {
    id: "chunking",
    name: "Chunking",
    icon: "✂️",
    description: "Split documents effectively",
    challengeSlugs: ["rag-pipeline-chunker", "semantic-chunking"],
    prerequisites: ["embeddings"],
    position: { x: 25, y: 25 },
  },
  {
    id: "vector-search",
    name: "Vector Search",
    icon: "🔍",
    description: "Similarity-based retrieval",
    challengeSlugs: ["dense-vector-class", "flat-index"],
    prerequisites: ["embeddings"],
    position: { x: 75, y: 25 },
  },
  
  // Row 3 - Advanced Retrieval
  {
    id: "hybrid-search",
    name: "Hybrid Search",
    icon: "🔀",
    description: "Combine dense + sparse",
    challengeSlugs: ["bm25-baseline", "hybrid-retrieval"],
    prerequisites: ["vector-search"],
    position: { x: 15, y: 45 },
  },
  {
    id: "query-transform",
    name: "Query Transform",
    icon: "🔄",
    description: "Improve query quality",
    challengeSlugs: ["hyde-search", "multi-query"],
    prerequisites: ["chunking", "vector-search"],
    position: { x: 50, y: 45 },
  },
  {
    id: "reranking",
    name: "Reranking",
    icon: "📊",
    description: "Refine retrieval results",
    challengeSlugs: ["reranker-score-function", "rerank-cascade"],
    prerequisites: ["vector-search"],
    position: { x: 85, y: 45 },
  },
  
  // Row 4 - Generation & Evaluation
  {
    id: "generation",
    name: "Generation",
    icon: "✨",
    description: "Prompt engineering for RAG",
    challengeSlugs: ["rag-pipeline-generator", "context-formatting"],
    prerequisites: ["query-transform"],
    position: { x: 30, y: 65 },
  },
  {
    id: "evaluation",
    name: "Evaluation",
    icon: "📈",
    description: "Measure RAG quality",
    challengeSlugs: ["evaluator-recall-at-k", "evaluator-mrr"],
    prerequisites: ["reranking"],
    position: { x: 70, y: 65 },
  },
  
  // Row 5 - Advanced
  {
    id: "agentic",
    name: "Agentic RAG",
    icon: "🤖",
    description: "Autonomous retrieval",
    challengeSlugs: ["router-agent", "adaptive-rag-router"],
    prerequisites: ["generation", "evaluation"],
    position: { x: 35, y: 85 },
  },
  {
    id: "production",
    name: "Production",
    icon: "🚀",
    description: "Scale and optimize",
    challengeSlugs: ["semantic-cache", "guardrails"],
    prerequisites: ["generation", "evaluation"],
    position: { x: 65, y: 85 },
  },
];

function getNodeStatus(
  node: SkillNode,
  challengeProgress: Record<string, { status?: string }>
): "locked" | "available" | "in_progress" | "completed" {
  // Count completed challenges for this node
  const completed = node.challengeSlugs.filter(
    (slug) => challengeProgress[slug]?.status === "completed"
  ).length;
  
  const inProgress = node.challengeSlugs.filter(
    (slug) => challengeProgress[slug]?.status === "in_progress"
  ).length;

  // Check if all prerequisites are completed (at least one challenge each)
  const prerequisitesMet = node.prerequisites.every((prereqId) => {
    const prereqNode = SKILL_NODES.find((n) => n.id === prereqId);
    if (!prereqNode) return true;
    return prereqNode.challengeSlugs.some(
      (slug) => challengeProgress[slug]?.status === "completed"
    );
  });

  if (!prerequisitesMet) return "locked";
  if (completed === node.challengeSlugs.length) return "completed";
  if (completed > 0 || inProgress > 0) return "in_progress";
  return "available";
}

export function SkillTree() {
  const { state } = useLocalProgress();

  const nodeStatuses = useMemo(() => {
    const statuses: Record<string, ReturnType<typeof getNodeStatus>> = {};
    SKILL_NODES.forEach((node) => {
      statuses[node.id] = getNodeStatus(node, state.challenges);
    });
    return statuses;
  }, [state.challenges]);

  const getProgressForNode = (node: SkillNode) => {
    const completed = node.challengeSlugs.filter(
      (slug) => state.challenges[slug]?.status === "completed"
    ).length;
    return { completed, total: node.challengeSlugs.length };
  };

  const getNodeColor = (status: ReturnType<typeof getNodeStatus>) => {
    switch (status) {
      case "locked":
        return "bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600";
      case "available":
        return "bg-blue-100 text-blue-600 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "in_progress":
        return "bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "completed":
        return "bg-emerald-100 text-emerald-600 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    }
  };

  // Calculate overall progress
  const totalNodes = SKILL_NODES.length;
  const completedNodes = Object.values(nodeStatuses).filter(
    (s) => s === "completed"
  ).length;
  const inProgressNodes = Object.values(nodeStatuses).filter(
    (s) => s === "in_progress"
  ).length;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <span>🌳</span>
            Skill Tree
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Unlock skills by completing challenges
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {completedNodes}/{totalNodes} mastered
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-zinc-500">Locked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-blue-400" />
          <span className="text-zinc-500">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="text-zinc-500">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="text-zinc-500">Completed</span>
        </div>
      </div>

      {/* Skill Tree Visualization */}
      <div className="relative h-[500px] overflow-hidden rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
        {/* Connection lines */}
        <svg className="absolute inset-0 h-full w-full">
          {SKILL_NODES.map((node) =>
            node.prerequisites.map((prereqId) => {
              const prereq = SKILL_NODES.find((n) => n.id === prereqId);
              if (!prereq) return null;
              
              const startX = `${prereq.position.x}%`;
              const startY = `${prereq.position.y + 5}%`;
              const endX = `${node.position.x}%`;
              const endY = `${node.position.y - 3}%`;
              
              const isActive =
                nodeStatuses[prereqId] === "completed" ||
                nodeStatuses[prereqId] === "in_progress";

              return (
                <line
                  key={`${prereqId}-${node.id}`}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={isActive ? "#10b981" : "#d1d5db"}
                  strokeWidth={isActive ? 3 : 2}
                  strokeDasharray={isActive ? "0" : "5,5"}
                  className="transition-all duration-300"
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        {SKILL_NODES.map((node) => {
          const status = nodeStatuses[node.id];
          const progress = getProgressForNode(node);
          const isClickable = status !== "locked";

          const NodeContent = (
            <div
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all ${
                isClickable ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"
              }`}
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
              }}
            >
              {/* Node circle */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 text-2xl shadow-lg transition-all ${getNodeColor(
                  status
                )}`}
              >
                {node.icon}
              </div>

              {/* Node label */}
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold ${
                    status === "locked"
                      ? "text-zinc-400 dark:text-zinc-600"
                      : "text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {node.name}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {progress.completed}/{progress.total}
                </p>
              </div>

              {/* Progress ring for in-progress nodes */}
              {status === "in_progress" && progress.completed > 0 && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {Math.round((progress.completed / progress.total) * 100)}%
                </div>
              )}

              {/* Completed checkmark */}
              {status === "completed" && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </div>
              )}
            </div>
          );

          if (isClickable && node.challengeSlugs.length > 0) {
            return (
              <Link
                key={node.id}
                href={`/challenges/${node.challengeSlugs[0]}`}
              >
                {NodeContent}
              </Link>
            );
          }

          return <div key={node.id}>{NodeContent}</div>;
        })}
      </div>

      {/* Current suggestion */}
      {inProgressNodes > 0 || completedNodes < totalNodes ? (
        <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Suggested:</strong>{" "}
            {(() => {
              const availableNode = SKILL_NODES.find(
                (n) => nodeStatuses[n.id] === "available"
              );
              const inProgressNode = SKILL_NODES.find(
                (n) => nodeStatuses[n.id] === "in_progress"
              );
              const suggestedNode = inProgressNode || availableNode;
              if (!suggestedNode) return "Complete any available skill!";
              return (
                <>
                  Continue with{" "}
                  <Link
                    href={`/challenges/${suggestedNode.challengeSlugs[0]}`}
                    className="font-semibold underline"
                  >
                    {suggestedNode.name}
                  </Link>{" "}
                  ({suggestedNode.description})
                </>
              );
            })()}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            🎉 Congratulations! You've mastered all core RAG skills!
          </p>
        </div>
      )}
    </div>
  );
}
