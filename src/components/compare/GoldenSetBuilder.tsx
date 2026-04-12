"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";

type GoldenSetItem = {
  id: string;
  query: string;
  expectedSources: string[];
  expectedKeywords: string[];
};

export function GoldenSetBuilder() {
  const [items, setItems] = useState<GoldenSetItem[]>([
    {
      id: "1",
      query: "What is chunking in RAG?",
      expectedSources: ["chunking-101.md"],
      expectedKeywords: ["split", "document", "token"],
    },
  ]);

  const [newQuery, setNewQuery] = useState("");
  const [newSources, setNewSources] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  const addItem = () => {
    if (!newQuery.trim()) return;

    const item: GoldenSetItem = {
      id: Date.now().toString(),
      query: newQuery.trim(),
      expectedSources: newSources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      expectedKeywords: newKeywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setItems([...items, item]);
    setNewQuery("");
    setNewSources("");
    setNewKeywords("");
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const exportGoldenSet = () => {
    const exportData = items.map((item) => ({
      query: item.query,
      expected_sources: item.expectedSources,
      expected_answer_contains: item.expectedKeywords,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "golden_set.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Golden Set Builder</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Create evaluation queries with expected sources and keywords.
          </p>
        </div>
        <button
          onClick={exportGoldenSet}
          disabled={items.length === 0}
          className="rounded-full bg-[#2563EB] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2563EB] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-[#2563EB] cursor-pointer"
        >
          Export JSON
        </button>
      </div>

      {/* Current items */}
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.query}
              </p>
              {item.expectedSources.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Sources: {item.expectedSources.join(", ")}
                </p>
              )}
              {item.expectedKeywords.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keywords: {item.expectedKeywords.join(", ")}
                </p>
              )}
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="shrink-0 text-xs text-gray-400 hover:text-red-500 cursor-pointer"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div className="mt-4 space-y-3 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Add evaluation query
        </p>
        <input
          type="text"
          placeholder="Query (e.g., 'How does hybrid retrieval work?')"
          value={newQuery}
          onChange={(e) => setNewQuery(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]400 dark:border-gray-800 dark:bg-[#2563EB] dark:focus:ring-[#3B82F6]600"
        />
        <input
          type="text"
          placeholder="Expected sources (comma-separated, e.g., 'retrieval.md, hybrid.md')"
          value={newSources}
          onChange={(e) => setNewSources(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]400 dark:border-gray-800 dark:bg-[#2563EB] dark:focus:ring-[#3B82F6]600"
        />
        <input
          type="text"
          placeholder="Expected keywords (comma-separated, e.g., 'dense, sparse, BM25')"
          value={newKeywords}
          onChange={(e) => setNewKeywords(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]400 dark:border-gray-800 dark:bg-[#2563EB] dark:focus:ring-[#3B82F6]600"
        />
        <button
          onClick={addItem}
          disabled={!newQuery.trim()}
          className="w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-[#2563EB] dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
        >
          Add Query
        </button>
      </div>

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        💡 Tip: Start with 25–50 queries covering your most important use cases.
        Export the JSON and use it with the evaluation templates.
      </p>
    </Card>
  );
}
