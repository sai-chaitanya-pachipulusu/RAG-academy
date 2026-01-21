"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

type AttentionVisualizerProps = {
  title?: string;
  description?: string;
};

// Simulated attention pattern showing "lost in the middle" effect
const SAMPLE_CONTEXT = [
  { id: 1, text: "RAG systems combine retrieval and generation.", attention: 0.85, position: "start" },
  { id: 2, text: "The retrieval step finds relevant documents.", attention: 0.72, position: "start" },
  { id: 3, text: "Documents are chunked before embedding.", attention: 0.45, position: "middle" },
  { id: 4, text: "Embeddings capture semantic meaning.", attention: 0.38, position: "middle" },
  { id: 5, text: "Vector similarity enables fast search.", attention: 0.32, position: "middle" },
  { id: 6, text: "Reranking improves precision.", attention: 0.35, position: "middle" },
  { id: 7, text: "Context is passed to the LLM.", attention: 0.42, position: "middle" },
  { id: 8, text: "The LLM generates an answer.", attention: 0.68, position: "end" },
  { id: 9, text: "Citations should reference sources.", attention: 0.78, position: "end" },
];

const SAMPLE_CONTEXT_REORDERED = [
  { id: 1, text: "RAG systems combine retrieval and generation.", attention: 0.92, position: "start" },
  { id: 9, text: "Citations should reference sources.", attention: 0.85, position: "start" },
  { id: 2, text: "The retrieval step finds relevant documents.", attention: 0.78, position: "start" },
  { id: 8, text: "The LLM generates an answer.", attention: 0.72, position: "middle" },
  { id: 3, text: "Documents are chunked before embedding.", attention: 0.55, position: "middle" },
  { id: 4, text: "Embeddings capture semantic meaning.", attention: 0.48, position: "middle" },
  { id: 5, text: "Vector similarity enables fast search.", attention: 0.52, position: "middle" },
  { id: 6, text: "Reranking improves precision.", attention: 0.58, position: "end" },
  { id: 7, text: "Context is passed to the LLM.", attention: 0.65, position: "end" },
];

function getAttentionColor(attention: number): string {
  if (attention >= 0.7) return "bg-green-500";
  if (attention >= 0.5) return "bg-yellow-400";
  if (attention >= 0.35) return "bg-orange-400";
  return "bg-red-400";
}

function getAttentionBg(attention: number): string {
  if (attention >= 0.7) return "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800";
  if (attention >= 0.5) return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
  if (attention >= 0.35) return "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800";
  return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
}

export function AttentionVisualizer({
  title = "Lost-in-the-Middle Visualizer",
  description = "See how LLMs attend differently to context position.",
}: AttentionVisualizerProps) {
  const [ordering, setOrdering] = useState<"natural" | "optimized">("natural");
  const [showBars, setShowBars] = useState(true);

  const context = ordering === "natural" ? SAMPLE_CONTEXT : SAMPLE_CONTEXT_REORDERED;

  const avgAttention = context.reduce((sum, c) => sum + c.attention, 0) / context.length;
  const minAttention = Math.min(...context.map((c) => c.attention));
  const maxAttention = Math.max(...context.map((c) => c.attention));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          <button
            onClick={() => setOrdering("natural")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              ordering === "natural"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Natural Order
          </button>
          <button
            onClick={() => setOrdering("optimized")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              ordering === "optimized"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            Optimized Order
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showBars}
            onChange={(e) => setShowBars(e.target.checked)}
            className="rounded"
          />
          <span className="text-zinc-600 dark:text-zinc-400">Show attention bars</span>
        </label>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Avg Attention</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{(avgAttention * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Min Attention</p>
          <p className="text-xl font-bold text-red-600">{(minAttention * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Max Attention</p>
          <p className="text-xl font-bold text-green-600">{(maxAttention * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-4 flex gap-4">
        {/* Position chart */}
        <div className="flex-1">
          <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Attention by Position</h4>
          <div className="flex h-32 items-end gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
            {context.map((chunk, idx) => (
              <div
                key={chunk.id}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className={`w-full rounded-t transition-all ${getAttentionColor(chunk.attention)}`}
                  style={{ height: `${chunk.attention * 100}%` }}
                  title={`Position ${idx + 1}: ${(chunk.attention * 100).toFixed(0)}%`}
                />
                <span className="text-[10px] text-zinc-500">{idx + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-zinc-500">Position in context</p>
        </div>
      </div>

      {/* Context chunks */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Context Chunks</h4>
        {context.map((chunk, idx) => (
          <div
            key={chunk.id}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${getAttentionBg(chunk.attention)}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
              {idx + 1}
            </span>
            <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{chunk.text}</p>
            {showBars && (
              <div className="flex w-32 items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`h-full rounded-full transition-all ${getAttentionColor(chunk.attention)}`}
                    style={{ width: `${chunk.attention * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {(chunk.attention * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
        <strong>Key insight:</strong> In "Natural Order", middle chunks get ~30-40% attention while start/end get ~70-85%.
        "Optimized Order" places the most important information at the start and end, improving overall attention utilization.
        This is why chunk ordering matters for RAG quality.
      </div>
    </Card>
  );
}
