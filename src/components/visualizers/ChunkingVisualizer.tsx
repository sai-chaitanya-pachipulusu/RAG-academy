"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";

type ChunkingVisualizerProps = {
  title?: string;
  description?: string;
};

const SAMPLE_TEXT = `# Introduction to RAG

Retrieval-Augmented Generation (RAG) is a technique that combines the power of large language models with external knowledge retrieval. This approach addresses a fundamental limitation of LLMs: their knowledge is frozen at training time.

## How RAG Works

The RAG pipeline consists of two main phases:

1. **Offline (Indexing)**: Documents are chunked, embedded, and stored in a vector database.
2. **Online (Query)**: User queries are embedded and used to retrieve relevant chunks.

### The Retrieval Step

When a user asks a question, the system:
- Converts the query into a vector embedding
- Searches for similar document chunks
- Returns the most relevant pieces of context

### The Generation Step

The retrieved context is then combined with the original query and sent to an LLM, which generates a response grounded in the retrieved information.

## Benefits of RAG

RAG offers several advantages over pure LLM approaches:

- **Up-to-date information**: Knowledge can be updated without retraining
- **Verifiable sources**: Answers can be traced back to source documents
- **Reduced hallucinations**: Grounding in retrieved content improves accuracy
- **Domain specificity**: Easy to adapt to specialized knowledge domains

## Challenges

However, RAG also introduces new challenges:
- Chunking strategy significantly impacts retrieval quality
- Embedding model selection affects semantic matching
- Context window management requires careful optimization`;

type Chunk = {
  text: string;
  tokens: number;
  startChar: number;
  endChar: number;
};

function countTokens(text: string): number {
  // Rough approximation: ~4 chars per token
  return Math.ceil(text.length / 4);
}

function chunkBySize(text: string, targetTokens: number, overlap: number): Chunk[] {
  const targetChars = targetTokens * 4;
  const overlapChars = overlap * 4;
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + targetChars, text.length);
    const chunkText = text.slice(start, end);
    chunks.push({
      text: chunkText,
      tokens: countTokens(chunkText),
      startChar: start,
      endChar: end,
    });
    start = end - overlapChars;
    if (start >= text.length - overlapChars) break;
  }

  return chunks;
}

function chunkByParagraph(text: string): Chunk[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: Chunk[] = [];
  let charOffset = 0;

  for (const para of paragraphs) {
    if (para.trim()) {
      chunks.push({
        text: para,
        tokens: countTokens(para),
        startChar: charOffset,
        endChar: charOffset + para.length,
      });
    }
    charOffset += para.length + 2; // +2 for the \n\n
  }

  return chunks;
}

function chunkBySentence(text: string, targetSentences: number = 3): Chunk[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: Chunk[] = [];
  let charOffset = 0;

  for (let i = 0; i < sentences.length; i += targetSentences) {
    const group = sentences.slice(i, i + targetSentences);
    const chunkText = group.join(" ");
    chunks.push({
      text: chunkText,
      tokens: countTokens(chunkText),
      startChar: charOffset,
      endChar: charOffset + chunkText.length,
    });
    charOffset += chunkText.length + 1;
  }

  return chunks;
}

function chunkByMarkdown(text: string): Chunk[] {
  const sections = text.split(/(?=^#{1,3} )/m);
  const chunks: Chunk[] = [];
  let charOffset = 0;

  for (const section of sections) {
    if (section.trim()) {
      chunks.push({
        text: section.trim(),
        tokens: countTokens(section),
        startChar: charOffset,
        endChar: charOffset + section.length,
      });
    }
    charOffset += section.length;
  }

  return chunks;
}

const STRATEGIES = {
  "fixed-size": { label: "Fixed Size (200 tokens)", fn: (t: string) => chunkBySize(t, 200, 40) },
  "paragraph": { label: "By Paragraph", fn: chunkByParagraph },
  "sentence": { label: "By Sentence (3 per chunk)", fn: chunkBySentence },
  "markdown": { label: "Markdown-aware", fn: chunkByMarkdown },
};

const COLORS = [
  "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
  "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
  "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700",
  "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700",
  "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
  "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700",
  "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700",
  "bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700",
];

export function ChunkingVisualizer({
  title = "Chunking Visualizer",
  description = "Compare different chunking strategies and see how they split documents.",
}: ChunkingVisualizerProps) {
  const [strategy, setStrategy] = useState<keyof typeof STRATEGIES>("fixed-size");
  const [hoveredChunk, setHoveredChunk] = useState<number | null>(null);

  const chunks = useMemo(() => {
    return STRATEGIES[strategy].fn(SAMPLE_TEXT);
  }, [strategy]);

  const stats = useMemo(() => {
    const tokens = chunks.map((c) => c.tokens);
    return {
      count: chunks.length,
      avgTokens: Math.round(tokens.reduce((a, b) => a + b, 0) / tokens.length),
      minTokens: Math.min(...tokens),
      maxTokens: Math.max(...tokens),
    };
  }, [chunks]);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>

      {/* Strategy selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(STRATEGIES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setStrategy(key as keyof typeof STRATEGIES)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              strategy === key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Chunks</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.count}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Avg Tokens</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.avgTokens}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Min Tokens</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.minTokens}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Max Tokens</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.maxTokens}</p>
        </div>
      </div>

      {/* Visualization */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Original text with highlighting */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Original Document</h4>
          <div className="h-[400px] overflow-auto rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {chunks.map((chunk, idx) => (
                <span
                  key={idx}
                  className={`rounded px-0.5 transition-colors ${
                    hoveredChunk === idx
                      ? COLORS[idx % COLORS.length]
                      : hoveredChunk !== null
                      ? "opacity-30"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredChunk(idx)}
                  onMouseLeave={() => setHoveredChunk(null)}
                >
                  {chunk.text}
                </span>
              ))}
            </pre>
          </div>
        </div>

        {/* Chunk list */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Chunks ({chunks.length})</h4>
          <div className="h-[400px] space-y-2 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
            {chunks.map((chunk, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-2 transition-all ${COLORS[idx % COLORS.length]} ${
                  hoveredChunk === idx ? "ring-2 ring-blue-500" : ""
                }`}
                onMouseEnter={() => setHoveredChunk(idx)}
                onMouseLeave={() => setHoveredChunk(null)}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Chunk {idx + 1}
                  </span>
                  <span className="text-xs text-zinc-500">{chunk.tokens} tokens</span>
                </div>
                <p className="line-clamp-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {chunk.text.slice(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Why it matters:</strong> Chunk boundaries determine what information can be retrieved together. 
        Poor chunking can split related information across chunks, hurting retrieval quality.
      </div>
    </Card>
  );
}
