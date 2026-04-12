"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";

type RRFFusionAnimatorProps = {
  title?: string;
  description?: string;
};

type SearchResult = {
  id: string;
  title: string;
  rank: number;
  score?: number;
};

// Sample data
const DENSE_RESULTS: SearchResult[] = [
  { id: "d1", title: "Semantic search fundamentals", rank: 1 },
  { id: "d3", title: "Vector database overview", rank: 2 },
  { id: "d5", title: "Embedding model comparison", rank: 3 },
  { id: "d2", title: "BM25 algorithm details", rank: 4 },
  { id: "d7", title: "Hybrid search patterns", rank: 5 },
  { id: "d4", title: "Keyword matching basics", rank: 6 },
];

const SPARSE_RESULTS: SearchResult[] = [
  { id: "d2", title: "BM25 algorithm details", rank: 1 },
  { id: "d4", title: "Keyword matching basics", rank: 2 },
  { id: "d7", title: "Hybrid search patterns", rank: 3 },
  { id: "d1", title: "Semantic search fundamentals", rank: 4 },
  { id: "d6", title: "TF-IDF explained", rank: 5 },
  { id: "d3", title: "Vector database overview", rank: 6 },
];

function calculateRRFScore(rank: number, k: number): number {
  return 1 / (k + rank);
}

function fuseLists(
  lists: SearchResult[][],
  k: number
): Array<SearchResult & { rrfScore: number; sources: string[] }> {
  const scores = new Map<string, { score: number; item: SearchResult; sources: string[] }>();

  lists.forEach((list, listIdx) => {
    const sourceName = listIdx === 0 ? "Dense" : "Sparse";
    list.forEach((item) => {
      const rrfScore = calculateRRFScore(item.rank, k);
      const existing = scores.get(item.id);
      if (existing) {
        existing.score += rrfScore;
        existing.sources.push(sourceName);
      } else {
        scores.set(item.id, {
          score: rrfScore,
          item,
          sources: [sourceName],
        });
      }
    });
  });

  return Array.from(scores.values())
    .map(({ score, item, sources }) => ({
      ...item,
      rrfScore: score,
      sources,
    }))
    .sort((a, b) => b.rrfScore - a.rrfScore);
}

export function RRFFusionAnimator({
  title = "RRF Fusion Animator",
  description = "See how Reciprocal Rank Fusion combines results from multiple retrievers.",
}: RRFFusionAnimatorProps) {
  const [k, setK] = useState(60);
  const [animationStep, setAnimationStep] = useState<"idle" | "calculating" | "merging" | "done">("idle");
  const [showFormula, setShowFormula] = useState(false);

  const fusedResults = fuseLists([DENSE_RESULTS, SPARSE_RESULTS], k);

  const startAnimation = () => {
    setAnimationStep("calculating");
    setTimeout(() => setAnimationStep("merging"), 1000);
    setTimeout(() => setAnimationStep("done"), 2000);
  };

  const resetAnimation = () => {
    setAnimationStep("idle");
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">k parameter:</label>
          <select
            value={k}
            onChange={(e) => {
              setK(Number(e.target.value));
              resetAnimation();
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value={10}>10 (aggressive)</option>
            <option value={60}>60 (default)</option>
            <option value={100}>100 (smooth)</option>
          </select>
        </div>
        <button
          onClick={animationStep === "done" ? resetAnimation : startAnimation}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 cursor-pointer"
        >
          {animationStep === "done" ? "Reset" : "Run Fusion"}
        </button>
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#2563EB] cursor-pointer"
        >
          {showFormula ? "Hide" : "Show"} Formula
        </button>
      </div>

      {/* Formula */}
      {showFormula && (
        <div className="mb-4 rounded-lg bg-gray-100 p-4 dark:bg-[#2563EB]">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">RRF Formula:</p>
          <code className="text-sm text-gray-900 dark:text-gray-100">
            RRF_score(d) = Σ 1 / (k + rank(d))
          </code>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            For each document d, sum 1/(k + rank) across all ranked lists where it appears.
            k={k} means rank 1 contributes {(1 / (k + 1)).toFixed(4)}, rank 2 contributes {(1 / (k + 2)).toFixed(4)}, etc.
          </p>
        </div>
      )}

      {/* Three-column layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Dense results */}
        <div className={`transition-all duration-200-opacity ${animationStep !== "idle" ? "opacity-100" : "opacity-60"}`}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Dense Retrieval
          </h4>
          <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
            {DENSE_RESULTS.map((result) => (
              <div
                key={result.id}
                className={`flex items-center justify-between rounded-lg border bg-white p-2 text-sm transition-all duration-200-all duration-200 dark:bg-gray-900 ${
                  animationStep === "calculating"
                    ? "border-blue-300 ring-1 ring-blue-200"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {result.rank}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{result.title}</span>
                </div>
                {animationStep !== "idle" && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    +{calculateRRFScore(result.rank, k).toFixed(4)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sparse results */}
        <div className={`transition-all duration-200-opacity ${animationStep !== "idle" ? "opacity-100" : "opacity-60"}`}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Sparse (BM25) Retrieval
          </h4>
          <div className="space-y-2 rounded-lg border border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/30">
            {SPARSE_RESULTS.map((result) => (
              <div
                key={result.id}
                className={`flex items-center justify-between rounded-lg border bg-white p-2 text-sm transition-all duration-200-all duration-200 dark:bg-gray-900 ${
                  animationStep === "calculating"
                    ? "border-green-300 ring-1 ring-green-200"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                    {result.rank}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{result.title}</span>
                </div>
                {animationStep !== "idle" && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    +{calculateRRFScore(result.rank, k).toFixed(4)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fused results */}
        <div className={`transition-all duration-200-opacity ${animationStep === "done" ? "opacity-100" : "opacity-40"}`}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            Fused Results (RRF)
          </h4>
          <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50/50 p-3 dark:border-purple-800 dark:bg-purple-950/30">
            {fusedResults.slice(0, 6).map((result, idx) => (
              <div
                key={result.id}
                className={`flex items-center justify-between rounded-lg border bg-white p-2 text-sm dark:bg-gray-900 ${
                  animationStep === "done"
                    ? "border-purple-300 dark:border-purple-700"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{result.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {result.sources.includes("Dense") && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" title="Dense" />
                    )}
                    {result.sources.includes("Sparse") && (
                      <span className="h-2 w-2 rounded-full bg-green-500" title="Sparse" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {result.rrfScore.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 rounded-lg bg-purple-50 p-3 text-sm text-purple-800 dark:bg-purple-950/30 dark:text-purple-200">
        <strong>Key insight:</strong> Documents appearing in both lists get boosted. 
        "Hybrid search patterns" appears in both (Dense rank 5, Sparse rank 3), so it rises in the fused ranking.
        The k parameter controls how much top ranks dominate.
      </div>
    </Card>
  );
}
