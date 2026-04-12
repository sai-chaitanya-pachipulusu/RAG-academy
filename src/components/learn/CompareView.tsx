import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const STAGE_GUIDES = [
  {
    href: "/compare/retrieval",
    label: "Retrieval",
    status: "live" as const,
    blurb: "BM25 vs dense vs hybrid, fusion methods, query transforms.",
  },
  {
    href: "/compare/reranking",
    label: "Reranking",
    status: "live" as const,
    blurb: "Cross-encoders, cascades, LLM rerank, ColBERT-style approaches.",
  },
  {
    href: "/compare/evaluation",
    label: "Evaluation",
    status: "live" as const,
    blurb: "RAG triad, golden sets, tooling comparisons (Ragas, DeepEval, Phoenix…).",
  },
  {
    href: "/compare/caching",
    label: "Caching",
    status: "live" as const,
    blurb: "Embedding/retrieval/semantic caches, invalidation, and risk tradeoffs.",
  },
  {
    href: "/compare/security",
    label: "Security",
    status: "live" as const,
    blurb: "Prompt injection, ACL, PII, logging, and RAG-specific hardening.",
  },
];

export const TOOL_LABS = [
  {
    href: "/compare/vector-dbs",
    label: "Vector DBs",
    status: "live" as const,
    blurb: "Decision wizard + benchmarks + practical matrix.",
  },
  {
    href: "/compare/embeddings",
    label: "Embeddings",
    status: "live" as const,
    blurb: "Model selection: what to pick, why, and tradeoffs.",
  },
  {
    href: "/compare/frameworks",
    label: "Frameworks",
    status: "live" as const,
    blurb: "LangChain vs LlamaIndex vs Haystack vs DSPy vs DIY.",
  },
];

export function CompareView() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Decision Guides</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Compare techniques and tools to make informed architecture decisions.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold tracking-tight">By pipeline stage</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {STAGE_GUIDES.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="rounded-2xl border border-gray-200 p-5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/40 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{lab.label}</p>
                {lab.status === "live" ? (
                  <Badge variant="accent">live</Badge>
                ) : (
                  <Badge variant="muted">scaffold</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{lab.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold tracking-tight">Tool labs</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOOL_LABS.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="rounded-2xl border border-gray-200 p-5 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/40 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{lab.label}</p>
                {lab.status === "live" ? (
                  <Badge variant="accent">live</Badge>
                ) : (
                  <Badge variant="muted">scaffold</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{lab.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
