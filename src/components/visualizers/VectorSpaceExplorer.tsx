"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";

type Point = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "document" | "query";
  relevance?: number;
};

type VectorSpaceExplorerProps = {
  title?: string;
  description?: string;
};

// Sample data for demonstration
const SAMPLE_DOCUMENTS: Point[] = [
  { id: "d1", label: "RAG fundamentals", x: 0.2, y: 0.3, type: "document" },
  { id: "d2", label: "Vector databases", x: 0.25, y: 0.35, type: "document" },
  { id: "d3", label: "Embedding models", x: 0.3, y: 0.4, type: "document" },
  { id: "d4", label: "LLM fine-tuning", x: 0.7, y: 0.6, type: "document" },
  { id: "d5", label: "Prompt engineering", x: 0.6, y: 0.5, type: "document" },
  { id: "d6", label: "Chunking strategies", x: 0.35, y: 0.25, type: "document" },
  { id: "d7", label: "BM25 retrieval", x: 0.5, y: 0.2, type: "document" },
  { id: "d8", label: "Cross-encoder reranking", x: 0.4, y: 0.45, type: "document" },
  { id: "d9", label: "Semantic search", x: 0.28, y: 0.38, type: "document" },
  { id: "d10", label: "Knowledge graphs", x: 0.8, y: 0.8, type: "document" },
];

function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

export function VectorSpaceExplorer({ 
  title = "Vector Space Explorer",
  description = "See how queries find similar documents in embedding space."
}: VectorSpaceExplorerProps) {
  const [query, setQuery] = useState("How does semantic search work?");
  const [queryPoint, setQueryPoint] = useState<Point | null>(null);
  const [topK, setTopK] = useState(3);
  const svgRef = useRef<SVGSVGElement>(null);

  // Simulate query embedding (in reality this would call an API)
  const handleSearch = () => {
    // Place query near "Semantic search" area with some randomness
    const newQuery: Point = {
      id: "query",
      label: query.slice(0, 30),
      x: 0.32 + (Math.random() - 0.5) * 0.1,
      y: 0.38 + (Math.random() - 0.5) * 0.1,
      type: "query",
    };
    setQueryPoint(newQuery);
  };

  // Calculate relevance scores
  const documentsWithRelevance = useMemo(() => {
    if (!queryPoint) return SAMPLE_DOCUMENTS;

    return SAMPLE_DOCUMENTS.map((doc) => ({
      ...doc,
      relevance: 1 - calculateDistance(doc, queryPoint),
    })).sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
  }, [queryPoint]);

  const topResults = documentsWithRelevance.slice(0, topK);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a search query..."
          className="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 cursor-pointer"
        >
          Embed & Search
        </button>
        <select
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value={3}>Top 3</option>
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
        </select>
      </div>

      {/* Visualization */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-[#3B82F6]-50 to-[#3B82F6]-100 dark:border-gray-700 dark:from-[#3B82F6]-900 dark:to-[#3B82F6]-800">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.1"
                className="text-gray-300 dark:text-gray-700"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Connection lines to top results */}
          {queryPoint &&
            topResults.map((doc, idx) => (
              <line
                key={`line-${doc.id}`}
                x1={queryPoint.x * 100}
                y1={queryPoint.y * 100}
                x2={doc.x * 100}
                y2={doc.y * 100}
                stroke={`hsl(${220 - idx * 30}, 70%, 50%)`}
                strokeWidth="0.3"
                strokeDasharray="2,1"
                opacity={0.6}
              />
            ))}

          {/* Document points */}
          {documentsWithRelevance.map((doc, idx) => {
            const isTopResult = topResults.some((r) => r.id === doc.id);
            const rank = topResults.findIndex((r) => r.id === doc.id);
            
            return (
              <g key={doc.id}>
                <circle
                  cx={doc.x * 100}
                  cy={doc.y * 100}
                  r={isTopResult ? 3 : 2}
                  className={
                    isTopResult
                      ? "fill-blue-500 stroke-blue-600"
                      : "fill-zinc-400 stroke-zinc-500 dark:fill-zinc-500 dark:stroke-zinc-400"
                  }
                  strokeWidth="0.3"
                />
                {isTopResult && (
                  <text
                    x={doc.x * 100}
                    y={doc.y * 100 - 4}
                    className="text-[3px] font-bold fill-blue-600 dark:fill-blue-400"
                    textAnchor="middle"
                  >
                    #{rank + 1}
                  </text>
                )}
                <text
                  x={doc.x * 100}
                  y={doc.y * 100 + 5}
                  className="text-[2.5px] fill-zinc-600 dark:fill-zinc-400"
                  textAnchor="middle"
                >
                  {doc.label}
                </text>
              </g>
            );
          })}

          {/* Query point */}
          {queryPoint && (
            <g>
              <circle
                cx={queryPoint.x * 100}
                cy={queryPoint.y * 100}
                r="3"
                className="fill-amber-500 stroke-amber-600"
                strokeWidth="0.5"
              />
              <circle
                cx={queryPoint.x * 100}
                cy={queryPoint.y * 100}
                r="5"
                fill="none"
                className="stroke-amber-400"
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
              <text
                x={queryPoint.x * 100}
                y={queryPoint.y * 100 - 6}
                className="text-[2.5px] font-bold fill-amber-600 dark:fill-amber-400"
                textAnchor="middle"
              >
                Query
              </text>
            </g>
          )}

          {/* Legend */}
          <g transform="translate(75, 5)">
            <rect x="0" y="0" width="23" height="14" rx="1" className="fill-white/80 dark:fill-zinc-800/80" />
            <circle cx="3" cy="4" r="1.5" className="fill-amber-500" />
            <text x="6" y="5" className="text-[2px] fill-zinc-700 dark:fill-zinc-300">Query</text>
            <circle cx="3" cy="8" r="1.5" className="fill-blue-500" />
            <text x="6" y="9" className="text-[2px] fill-zinc-700 dark:fill-zinc-300">Top result</text>
            <circle cx="3" cy="12" r="1" className="fill-zinc-400" />
            <text x="6" y="13" className="text-[2px] fill-zinc-700 dark:fill-zinc-300">Document</text>
          </g>
        </svg>
      </div>

      {/* Results panel */}
      {queryPoint && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Top {topK} Results</h4>
          <div className="mt-2 space-y-2">
            {topResults.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{doc.label}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Score: {((doc.relevance ?? 0) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
        <strong>How it works:</strong> The query is converted to a vector (embedding) and placed in the same space as documents. 
        The closest documents by distance become the search results. This is the core of semantic search.
      </div>
    </Card>
  );
}
