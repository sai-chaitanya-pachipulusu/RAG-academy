import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RRFFusionAnimator } from "@/components/visualizers/RRFFusionAnimator";
import { RetrievalHeatmap } from "@/components/visualizers/RetrievalHeatmap";

type Row = {
  technique: string;
  fixes: string;
  when: string;
  tradeoffs: string;
  default: "yes" | "maybe" | "no";
};

const ROWS: Row[] = [
  {
    technique: "BM25 (sparse / lexical)",
    fixes: "Exact term matching (IDs, acronyms, error codes).",
    when: "Your corpus is technical and users search with keywords.",
    tradeoffs: "Misses paraphrases; needs analyzers/field boosts to shine.",
    default: "yes",
  },
  {
    technique: "Dense embeddings (bi-encoder)",
    fixes: "Semantic matching (synonyms, paraphrases).",
    when: "Queries are natural language; content is prose-heavy.",
    tradeoffs: "Can miss exact terms; model choice matters a lot.",
    default: "yes",
  },
  {
    technique: "Hybrid (BM25 + dense) + fusion",
    fixes: "Robust recall across keyword + semantic queries.",
    when: "Production default for mixed corpora.",
    tradeoffs: "More moving parts; must fuse ranks/scores correctly.",
    default: "yes",
  },
  {
    technique: "Learned sparse (SPLADE / ELSER)",
    fixes: "“Semantic lexical” retrieval with inverted-index speed.",
    when: "Search-heavy domains and you want sparse explainability + quality.",
    tradeoffs: "Model + infra complexity; not always worth it vs hybrid.",
    default: "maybe",
  },
  {
    technique: "Multi-vector / late interaction (ColBERT-style)",
    fixes: "Higher precision retrieval without full cross-encoder cost.",
    when: "Large corpora where first-stage quality is limiting.",
    tradeoffs: "Bigger index footprint; more complex serving.",
    default: "maybe",
  },
  {
    technique: "Graph retrieval / GraphRAG",
    fixes: "Relationship queries (multi-hop, entity links).",
    when: "Users ask “how is X related to Y?” and vectors fail.",
    tradeoffs: "Extraction + graph maintenance cost; harder to evaluate.",
    default: "maybe",
  },
];

export default function CompareRetrievalPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Compare / Retrieval</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Retrieval techniques (what to use when)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Retrieval is the highest-leverage layer. If the right evidence isn’t in your candidate set,
          generation cannot fix it.
        </p>
      </header>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Production default</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Start with hybrid retrieval, then add reranking. Only reach for “frontier” techniques when you
              have measured failures.
            </p>
          </div>
          <Badge variant="accent">baseline</Badge>
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>BM25 + dense retrieval</li>
          <li>Fuse candidates (RRF is the safest default)</li>
          <li>Rerank top‑20/50 → keep 5–10</li>
          <li>Log retrieved ids + scores; measure Recall@k on a golden set</li>
        </ol>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Technique comparison</p>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-zinc-200 dark:border-white/10">
          <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                {["Technique", "Fixes", "Use when", "Tradeoffs", "Default?"].map((h) => (
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
                <tr key={r.technique}>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top font-medium text-zinc-950 dark:border-white/10 dark:text-zinc-50">
                    {r.technique}
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
        <p className="text-sm font-medium">Fusion methods (for hybrid)</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-zinc-700 dark:text-zinc-300">
          <li>
            <span className="font-medium text-zinc-950 dark:text-zinc-50">RRF (Reciprocal Rank Fusion)</span>: robust,
            parameter-light. Best default when combining retrievers.
          </li>
          <li>
            <span className="font-medium text-zinc-950 dark:text-zinc-50">Weighted score fusion</span>: can win when tuned,
            but requires score normalization and careful evaluation.
          </li>
        </ul>
      </Card>

      {/* Interactive Visualizers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-4 text-sm font-medium">RRF Fusion Animation</p>
          <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">
            Watch how RRF combines rankings from BM25 and dense retrieval.
          </p>
          <RRFFusionAnimator />
        </Card>
        
        <Card className="p-5">
          <p className="mb-4 text-sm font-medium">Retrieval Score Heatmap</p>
          <p className="mb-4 text-xs text-zinc-600 dark:text-zinc-400">
            Visualize how queries match different documents.
          </p>
          <RetrievalHeatmap />
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-sm font-medium">Next: implement it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges/bm25-from-scratch"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            BM25 from Scratch
          </Link>
          <Link
            href="/challenges/bm25-field-boosting"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            BM25 Field Boosting
          </Link>
          <Link
            href="/challenges/rrf-fusion"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            RRF Fusion
          </Link>
          <Link
            href="/challenges/weighted-rrf-fusion"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Weighted RRF Fusion
          </Link>
          <Link
            href="/challenges/hyde-search"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            HyDE Search
          </Link>
          <Link
            href="/playbooks/rag-techniques-encyclopedia"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Technique encyclopedia →
          </Link>
        </div>
      </Card>
    </div>
  );
}


