import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type Row = {
  layer: string;
  cacheKey: string;
  invalidation: string;
  risk: string;
  bestFor: string;
};

const ROWS: Row[] = [
  {
    layer: "Embedding cache",
    cacheKey: "(model, normalized_text_hash)",
    invalidation: "Change model/version → new namespace.",
    risk: "Low",
    bestFor: "Cheap, safe speedups. Do this early.",
  },
  {
    layer: "Retrieval results cache",
    cacheKey: "(normalized_query, filters, index_version)",
    invalidation: "Bump index_version on ingestion updates.",
    risk: "Low–Medium",
    bestFor: "High-QPS systems; avoids repeated ANN work.",
  },
  {
    layer: "Rerank cache",
    cacheKey: "(query, candidate_ids, reranker_version)",
    invalidation: "Bump reranker_version when model/prompt changes.",
    risk: "Medium",
    bestFor: "When reranking dominates latency/cost and candidates repeat.",
  },
  {
    layer: "Semantic answer cache",
    cacheKey: "(query_embedding_cluster, filters, policy_version)",
    invalidation: "Hard: requires strict versioning + safety constraints.",
    risk: "High",
    bestFor: "When queries repeat heavily and you have strong governance.",
  },
  {
    layer: "Prompt/context caching (provider feature)",
    cacheKey: "Provider-specific",
    invalidation: "Automatic/TTL (provider-specific).",
    risk: "Medium",
    bestFor: "Large shared contexts (system prompts, long doc packs).",
  },
];

export default function CompareCachingPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Compare / Caching</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Caching (latency + cost control)
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Caching is how production RAG stays fast and affordable. Start with low-risk caches (embeddings),
          then graduate to higher-risk caches (semantic answers) only with strong versioning and safety gates.
        </p>
      </header>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Rule of thumb</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Cache as low in the stack as possible. The higher you cache (closer to “final answer”),
              the harder invalidation and safety become.
            </p>
          </div>
          <Badge variant="accent">baseline</Badge>
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 p-5">
          <p className="text-sm font-medium">Cache layer comparison</p>
          <Badge variant="muted">quick matrix</Badge>
        </div>
        <div className="overflow-x-auto border-t border-zinc-200 dark:border-white/10">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400">
                {["Layer", "Cache key", "Invalidation", "Risk", "Best for"].map((h) => (
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
                <tr key={r.layer}>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top font-medium text-zinc-950 dark:border-white/10 dark:text-zinc-50">
                    {r.layer}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.cacheKey}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.invalidation}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.risk}
                  </td>
                  <td className="border-b border-zinc-200 px-3 py-3 align-top dark:border-white/10">
                    {r.bestFor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium">Next: implement it</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges/embedding-cache"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Embedding Cache
          </Link>
          <Link
            href="/challenges/retrieval-cache-key"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Retrieval Cache Key
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


