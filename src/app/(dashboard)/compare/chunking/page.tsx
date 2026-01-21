import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ChunkingVisualizer } from "@/components/visualizers/ChunkingVisualizer";

type Row = {
  strategy: string;
  fixes: string;
  when: string;
  tradeoffs: string;
  default: "yes" | "maybe" | "no";
};

const ROWS: Row[] = [
  {
    strategy: "Fixed-size (token/char)",
    fixes: "Simple, predictable chunk boundaries.",
    when: "Homogeneous content; need consistent embedding lengths.",
    tradeoffs: "May split mid-sentence; loses semantic boundaries.",
    default: "maybe",
  },
  {
    strategy: "Recursive / hierarchical",
    fixes: "Respects document structure (paragraphs, sections).",
    when: "Default for most document types.",
    tradeoffs: "Chunk sizes vary; may need padding for embeddings.",
    default: "yes",
  },
  {
    strategy: "Sentence-based",
    fixes: "Never splits mid-sentence; good for QA.",
    when: "FAQ-style content; single-sentence answers.",
    tradeoffs: "Sentences vary wildly in length; may be too short.",
    default: "maybe",
  },
  {
    strategy: "Semantic (by embedding)",
    fixes: "Groups semantically related content.",
    when: "Topic changes matter more than structure.",
    tradeoffs: "Expensive (requires embedding during chunking); non-deterministic.",
    default: "no",
  },
  {
    strategy: "Parent-document / late",
    fixes: "Small chunks for retrieval, full context for generation.",
    when: "Need precise retrieval but broad context.",
    tradeoffs: "More complex index; storage overhead.",
    default: "maybe",
  },
  {
    strategy: "Markdown/code-aware",
    fixes: "Respects headers, code blocks, tables.",
    when: "Technical documentation, READMEs, codebases.",
    tradeoffs: "Requires content-type detection; parser complexity.",
    default: "yes",
  },
];

export default function ChunkingComparePage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Compare / Chunking</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Chunking Strategies (how to split documents)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Chunking determines what your retriever can find. Bad chunking → missing context or irrelevant results,
          no matter how good your embeddings are.
        </p>
      </header>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Production default</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Start with recursive chunking (500-1000 tokens, 50-100 overlap).
              Only change when you have measured retrieval failures.
            </p>
          </div>
          <Badge variant="accent">baseline</Badge>
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>Use RecursiveCharacterTextSplitter (LangChain) or similar</li>
          <li>Set chunk_size=512-1024 tokens, overlap=50-100</li>
          <li>Add metadata (source, section, page) to each chunk</li>
          <li>Test on 10 sample docs before indexing everything</li>
        </ol>
      </Card>

      {/* Interactive Chunking Visualizer */}
      <Card className="p-5">
        <p className="mb-4 text-sm font-medium">Interactive: Chunking Visualizer</p>
        <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">
          See how different strategies split the same document. Adjust parameters and observe the results.
        </p>
        <ChunkingVisualizer />
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Strategy comparison</p>
          <Badge variant="muted">decision matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-zinc-200 dark:border-white/10">
          <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                {["Strategy", "Fixes", "Use when", "Tradeoffs", "Default?"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-zinc-200 px-3 py-2 dark:border-white/10"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-zinc-800 dark:text-zinc-200">
              {ROWS.map((r) => (
                <tr key={r.strategy}>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top font-medium text-zinc-950 dark:border-white/10 dark:text-zinc-50">
                    {r.strategy}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.fixes}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.when}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.tradeoffs}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.default === "yes" ? (
                      <Badge variant="accent">yes</Badge>
                    ) : r.default === "maybe" ? (
                      <Badge variant="muted">maybe</Badge>
                    ) : (
                      <Badge variant="muted">no</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Chunk size guidelines</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Small (128-256 tokens)</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              High precision, low recall. Good for FAQ, definitions.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Medium (512-1024 tokens)</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Balanced. Good default for most RAG applications.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Large (2000+ tokens)</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              More context per chunk. Good for long-form analysis.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Next: implement it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges/simple-chunking"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Simple Chunking
          </Link>
          <Link
            href="/challenges/recursive-splitter"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Recursive Splitter
          </Link>
          <Link
            href="/challenges/sentence-chunking"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Sentence Chunking
          </Link>
          <Link
            href="/challenges/markdown-header-chunking"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Markdown Chunking
          </Link>
          <Link
            href="/playbooks/chunking-strategies"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Chunking Playbook →
          </Link>
        </div>
      </Card>
    </div>
  );
}
