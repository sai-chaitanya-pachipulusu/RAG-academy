"use client";

import { useState, useEffect } from "react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  category: "required" | "recommended" | "bonus";
};

const UNIVERSAL_CHECKLIST: ChecklistItem[] = [
  // Required
  {
    id: "stable-ids",
    label: "Stable chunk IDs",
    description: "Chunks have reproducible IDs (content hash + source) that don't change on re-ingestion.",
    category: "required",
  },
  {
    id: "source-traceability",
    label: "Source traceability",
    description: "Every chunk can be traced back to its source document, page, and section.",
    category: "required",
  },
  {
    id: "retrieval-metrics",
    label: "Retrieval evaluation",
    description: "You have a golden set and measure Recall@k on your queries.",
    category: "required",
  },
  {
    id: "citations",
    label: "Citation grounding",
    description: "Generated answers include citations that link to source chunks.",
    category: "required",
  },
  {
    id: "error-handling",
    label: "Error handling",
    description: "Graceful degradation when retrieval fails or context is insufficient.",
    category: "required",
  },
  // Recommended
  {
    id: "hybrid-retrieval",
    label: "Hybrid retrieval",
    description: "Combines dense (vector) and sparse (BM25) retrieval for better recall.",
    category: "recommended",
  },
  {
    id: "reranking",
    label: "Reranking layer",
    description: "Cross-encoder or similar to boost precision before generation.",
    category: "recommended",
  },
  {
    id: "faithfulness-check",
    label: "Faithfulness checking",
    description: "Verification that generated claims are supported by context.",
    category: "recommended",
  },
  {
    id: "latency-budget",
    label: "Latency budgets",
    description: "P95 latency targets per stage (retrieval, rerank, generation).",
    category: "recommended",
  },
  {
    id: "logging",
    label: "Query logging",
    description: "All queries, retrievals, and generations are logged for debugging.",
    category: "recommended",
  },
  // Bonus
  {
    id: "semantic-cache",
    label: "Semantic caching",
    description: "Similar queries hit a cache to reduce latency and cost.",
    category: "bonus",
  },
  {
    id: "streaming",
    label: "Streaming responses",
    description: "Token-by-token streaming for better perceived latency.",
    category: "bonus",
  },
  {
    id: "safety",
    label: "Safety guardrails",
    description: "Prompt injection defense, PII filtering, or content moderation.",
    category: "bonus",
  },
  {
    id: "ab-testing",
    label: "A/B testing setup",
    description: "Infrastructure to compare different retrieval/generation configs.",
    category: "bonus",
  },
];

function getStorageKey() {
  return "rag-academy-project-checklist";
}

export function ProjectChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[];
        setChecked(new Set(parsed));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(checked)));
    }
  }, [checked, mounted]);

  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setChecked(next);
  };

  const required = UNIVERSAL_CHECKLIST.filter((i) => i.category === "required");
  const recommended = UNIVERSAL_CHECKLIST.filter((i) => i.category === "recommended");
  const bonus = UNIVERSAL_CHECKLIST.filter((i) => i.category === "bonus");

  const requiredCount = required.filter((i) => checked.has(i.id)).length;
  const recommendedCount = recommended.filter((i) => checked.has(i.id)).length;
  const bonusCount = bonus.filter((i) => checked.has(i.id)).length;

  const score = requiredCount * 10 + recommendedCount * 5 + bonusCount * 2;
  const maxScore = required.length * 10 + recommended.length * 5 + bonus.length * 2;

  const grade =
    requiredCount === required.length && recommendedCount >= 3
      ? "Production Ready"
      : requiredCount === required.length
        ? "Minimum Viable"
        : "In Progress";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Project Submission Checklist</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Track your progress against production-grade requirements.
          </p>
        </div>
        <div className="text-right">
          <Badge
            variant={
              grade === "Production Ready"
                ? "accent"
                : grade === "Minimum Viable"
                  ? "muted"
                  : "default"
            }
          >
            {grade}
          </Badge>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {score}/{maxScore} points
          </p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-24 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Required ({requiredCount}/{required.length})
          </span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-2 rounded-full bg-red-500 transition-all"
              style={{ width: `${(requiredCount / required.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Recommended ({recommendedCount}/{recommended.length})
          </span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{ width: `${(recommendedCount / recommended.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-24 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Bonus ({bonusCount}/{bonus.length})
          </span>
          <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(bonusCount / bonus.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist sections */}
      <div className="mt-6 space-y-6">
        <ChecklistSection
          title="Required"
          subtitle="Must have for any production system"
          items={required}
          checked={checked}
          onToggle={toggle}
          color="red"
        />
        <ChecklistSection
          title="Recommended"
          subtitle="Strong additions for production quality"
          items={recommended}
          checked={checked}
          onToggle={toggle}
          color="amber"
        />
        <ChecklistSection
          title="Bonus"
          subtitle="Advanced features for polish"
          items={bonus}
          checked={checked}
          onToggle={toggle}
          color="emerald"
        />
      </div>
    </Card>
  );
}

function ChecklistSection({
  title,
  subtitle,
  items,
  checked,
  onToggle,
  color,
}: {
  title: string;
  subtitle: string;
  items: ChecklistItem[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  color: "red" | "amber" | "emerald";
}) {
  const colorClasses = {
    red: "border-red-200 dark:border-red-900/50",
    amber: "border-amber-200 dark:border-amber-900/50",
    emerald: "border-emerald-200 dark:border-emerald-900/50",
  };

  return (
    <div>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
              checked.has(item.id) ? colorClasses[color] : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => onToggle(item.id)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
