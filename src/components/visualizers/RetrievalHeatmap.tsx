"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";

type RetrievalHeatmapProps = {
  title?: string;
  description?: string;
};

type QueryDocPair = {
  queryId: string;
  queryText: string;
  docId: string;
  docTitle: string;
  score: number;
  isRelevant: boolean;
};

// Sample data: 5 queries x 8 documents
const QUERIES = [
  { id: "q1", text: "What is RAG?" },
  { id: "q2", text: "How to chunk documents?" },
  { id: "q3", text: "Best embedding models" },
  { id: "q4", text: "Hybrid search implementation" },
  { id: "q5", text: "Evaluate retrieval quality" },
];

const DOCUMENTS = [
  { id: "d1", title: "RAG Fundamentals" },
  { id: "d2", title: "Chunking Strategies" },
  { id: "d3", title: "Embedding Model Guide" },
  { id: "d4", title: "BM25 Algorithm" },
  { id: "d5", title: "Vector Databases" },
  { id: "d6", title: "Hybrid Search" },
  { id: "d7", title: "Evaluation Metrics" },
  { id: "d8", title: "Production RAG" },
];

// Simulated relevance scores (in practice, these come from evaluation)
const SCORES: Record<string, Record<string, { score: number; relevant: boolean }>> = {
  q1: {
    d1: { score: 0.95, relevant: true },
    d2: { score: 0.42, relevant: false },
    d3: { score: 0.38, relevant: false },
    d4: { score: 0.25, relevant: false },
    d5: { score: 0.55, relevant: true },
    d6: { score: 0.35, relevant: false },
    d7: { score: 0.30, relevant: false },
    d8: { score: 0.72, relevant: true },
  },
  q2: {
    d1: { score: 0.35, relevant: false },
    d2: { score: 0.92, relevant: true },
    d3: { score: 0.28, relevant: false },
    d4: { score: 0.22, relevant: false },
    d5: { score: 0.40, relevant: false },
    d6: { score: 0.30, relevant: false },
    d7: { score: 0.25, relevant: false },
    d8: { score: 0.55, relevant: true },
  },
  q3: {
    d1: { score: 0.30, relevant: false },
    d2: { score: 0.25, relevant: false },
    d3: { score: 0.88, relevant: true },
    d4: { score: 0.20, relevant: false },
    d5: { score: 0.65, relevant: true },
    d6: { score: 0.28, relevant: false },
    d7: { score: 0.35, relevant: false },
    d8: { score: 0.45, relevant: false },
  },
  q4: {
    d1: { score: 0.40, relevant: false },
    d2: { score: 0.32, relevant: false },
    d3: { score: 0.35, relevant: false },
    d4: { score: 0.72, relevant: true },
    d5: { score: 0.55, relevant: true },
    d6: { score: 0.90, relevant: true },
    d7: { score: 0.28, relevant: false },
    d8: { score: 0.62, relevant: true },
  },
  q5: {
    d1: { score: 0.25, relevant: false },
    d2: { score: 0.20, relevant: false },
    d3: { score: 0.30, relevant: false },
    d4: { score: 0.22, relevant: false },
    d5: { score: 0.28, relevant: false },
    d6: { score: 0.25, relevant: false },
    d7: { score: 0.94, relevant: true },
    d8: { score: 0.58, relevant: true },
  },
};

function getScoreColor(score: number, isRelevant: boolean): string {
  if (isRelevant) {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-green-400";
    return "bg-green-300";
  } else {
    if (score >= 0.6) return "bg-red-400"; // False positive risk
    if (score >= 0.4) return "bg-amber-300";
    return "bg-gray-200 dark:bg-gray-700";
  }
}

export function RetrievalHeatmap({
  title = "Retrieval Quality Heatmap",
  description = "Visualize retrieval scores across queries and documents.",
}: RetrievalHeatmapProps) {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [showRelevantOnly, setShowRelevantOnly] = useState(false);
  const [threshold, setThreshold] = useState(0.5);

  // Calculate metrics
  const metrics = useMemo(() => {
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    QUERIES.forEach((q) => {
      DOCUMENTS.forEach((d) => {
        const data = SCORES[q.id][d.id];
        const retrieved = data.score >= threshold;
        
        if (retrieved && data.relevant) truePositives++;
        if (retrieved && !data.relevant) falsePositives++;
        if (!retrieved && data.relevant) falseNegatives++;
      });
    });

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1 = (2 * precision * recall) / (precision + recall) || 0;

    return { precision, recall, f1, truePositives, falsePositives, falseNegatives };
  }, [threshold]);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Threshold:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{threshold.toFixed(1)}</span>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showRelevantOnly}
            onChange={(e) => setShowRelevantOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600 dark:text-gray-400">Highlight relevant only</span>
        </label>
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Precision</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{(metrics.precision * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500">Recall</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{(metrics.recall * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs text-gray-500">F1 Score</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{(metrics.f1 * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs text-gray-500">Query / Doc</th>
              {DOCUMENTS.map((doc) => (
                <th
                  key={doc.id}
                  className={`p-2 text-center text-xs font-medium ${
                    selectedDoc === doc.id ? "bg-blue-100 dark:bg-blue-900" : ""
                  }`}
                  onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                  style={{ cursor: "pointer", writingMode: "vertical-rl", height: "80px" }}
                >
                  {doc.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {QUERIES.map((query) => (
              <tr
                key={query.id}
                className={selectedQuery === query.id ? "bg-blue-50 dark:bg-blue-950" : ""}
              >
                <td
                  className="cursor-pointer p-2 text-xs font-medium text-gray-700 dark:text-gray-300"
                  onClick={() => setSelectedQuery(selectedQuery === query.id ? null : query.id)}
                >
                  {query.text}
                </td>
                {DOCUMENTS.map((doc) => {
                  const data = SCORES[query.id][doc.id];
                  const aboveThreshold = data.score >= threshold;
                  const shouldShow = !showRelevantOnly || data.relevant;
                  
                  return (
                    <td key={doc.id} className="p-1">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded text-[10px] font-medium transition-all ${
                          shouldShow ? getScoreColor(data.score, data.relevant) : "bg-gray-100 dark:bg-[#2563EB]"
                        } ${aboveThreshold ? "ring-2 ring-[#3B82F6]900 dark:ring-white" : ""}`}
                        title={`${query.text} → ${doc.title}: ${data.score.toFixed(2)} (${data.relevant ? "relevant" : "not relevant"})`}
                      >
                        {shouldShow ? data.score.toFixed(2) : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Relevant (high score)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-300" />
          <span className="text-gray-600 dark:text-gray-400">Relevant (low score)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-red-400" />
          <span className="text-gray-600 dark:text-gray-400">Not relevant (high score) ⚠️</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gray-200 ring-2 ring-[#3B82F6]900" />
          <span className="text-gray-600 dark:text-gray-400">Above threshold</span>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-200">
        <strong>How to read:</strong> Green = relevant document, Red/Amber = not relevant but retrieved (false positive).
        Adjust the threshold to see how it affects precision/recall. High scores on non-relevant docs indicate embedding issues.
      </div>
    </Card>
  );
}
