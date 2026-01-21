"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Metric = {
  name: string;
  formula: string;
  explanation: string;
  when: string;
  range: string;
  challenge?: string;
};

const RETRIEVAL_METRICS: Metric[] = [
  {
    name: "Recall@k",
    formula: "|retrieved ∩ relevant| / |relevant|",
    explanation: "How many relevant docs did we find in top-k?",
    when: "Use when you care about not missing important information.",
    range: "0–1 (higher = better)",
    challenge: "/challenges/evaluator-recall-at-k",
  },
  {
    name: "Precision@k",
    formula: "|retrieved ∩ relevant| / k",
    explanation: "How many of the top-k are actually relevant?",
    when: "Use when context window is limited (every token counts).",
    range: "0–1 (higher = better)",
    challenge: "/challenges/evaluator-precision-at-k",
  },
  {
    name: "MRR",
    formula: "1 / rank(first relevant)",
    explanation: "How early does the first relevant doc appear?",
    when: "Use when users look at first result primarily.",
    range: "0–1 (higher = better)",
    challenge: "/challenges/evaluator-mrr",
  },
  {
    name: "nDCG@k",
    formula: "DCG@k / iDCG@k",
    explanation: "Weighted score considering position and graded relevance.",
    when: "Use when relevance isn't binary (some docs more relevant than others).",
    range: "0–1 (higher = better)",
    challenge: "/challenges/evaluator-ndcg",
  },
  {
    name: "MAP",
    formula: "mean(AP@k across queries)",
    explanation: "Average precision across all relevant positions.",
    when: "Use for overall system comparison across query set.",
    range: "0–1 (higher = better)",
    challenge: "/challenges/evaluator-map",
  },
];

const GENERATION_METRICS: Metric[] = [
  {
    name: "Faithfulness",
    formula: "claims_supported / total_claims",
    explanation: "Are the generated claims supported by retrieved context?",
    when: "Critical for avoiding hallucinations.",
    range: "0–1 (higher = better)",
    challenge: "/challenges/faithfulness-judge",
  },
  {
    name: "Answer Relevance",
    formula: "semantic_sim(answer, query)",
    explanation: "Does the answer address what was asked?",
    when: "Catches off-topic or overly generic answers.",
    range: "0–1 (higher = better)",
    challenge: "/challenges/relevance-judge",
  },
  {
    name: "Context Recall",
    formula: "|answer_claims in context| / |answer_claims|",
    explanation: "Could the answer be derived from the context?",
    when: "Helps debug when answers are correct but context was wrong.",
    range: "0–1 (higher = better)",
    challenge: "/challenges/context-recall-judge",
  },
];

export function MetricsExplainer() {
  const [activeTab, setActiveTab] = useState<"retrieval" | "generation">("retrieval");

  const metrics = activeTab === "retrieval" ? RETRIEVAL_METRICS : GENERATION_METRICS;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Metrics Reference</p>
        <div className="flex gap-1 rounded-full border border-zinc-200 p-1 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("retrieval")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === "retrieval"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Retrieval
          </button>
          <button
            onClick={() => setActiveTab("generation")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === "generation"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Generation
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {metrics.map((m) => (
          <div
            key={m.name}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {m.name}
                </p>
                <code className="mt-1 block text-xs text-emerald-600 dark:text-emerald-400">
                  {m.formula}
                </code>
              </div>
              <Badge variant="muted">{m.range}</Badge>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              {m.explanation}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
              <span className="font-medium">When to use:</span> {m.when}
            </p>
            {m.challenge && (
              <a
                href={m.challenge}
                className="mt-2 inline-block text-xs font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-500"
              >
                Implement this metric →
              </a>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
