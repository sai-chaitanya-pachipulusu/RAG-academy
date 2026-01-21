import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type CompareSection = {
  title: string;
  desc: string;
  pages: Array<{
    href: string;
    label: string;
    status: "live" | "stub";
    blurb: string;
  }>;
};

const SECTIONS: CompareSection[] = [
  {
    title: "Pipeline Stages",
    desc: "Compare techniques at each stage of the RAG pipeline.",
    pages: [
      {
        href: "/compare/chunking",
        label: "Chunking",
        status: "live",
        blurb: "Fixed vs recursive vs semantic. How to split documents.",
      },
      {
        href: "/compare/retrieval",
        label: "Retrieval",
        status: "live",
        blurb: "Dense vs sparse vs hybrid. When to use each.",
      },
      {
        href: "/compare/reranking",
        label: "Reranking",
        status: "live",
        blurb: "Cross-encoders, LLM reranking, cascade patterns.",
      },
      {
        href: "/compare/caching",
        label: "Caching",
        status: "live",
        blurb: "Semantic caching, embedding caching, query normalization.",
      },
      {
        href: "/compare/security",
        label: "Security",
        status: "live",
        blurb: "Prompt injection, PII, access control.",
      },
    ],
  },
  {
    title: "Tool Labs",
    desc: "Interactive comparisons of specific tools and vendors.",
    pages: [
      {
        href: "/compare/vector-dbs",
        label: "Vector Databases",
        status: "live",
        blurb: "Pinecone vs Weaviate vs Qdrant vs Chroma vs pgvector.",
      },
      {
        href: "/compare/embeddings",
        label: "Embedding Models",
        status: "live",
        blurb: "OpenAI vs Cohere vs BGE vs local models.",
      },
      {
        href: "/compare/frameworks",
        label: "Frameworks",
        status: "live",
        blurb: "LangChain vs LlamaIndex vs Haystack vs DIY.",
      },
      {
        href: "/compare/evaluation",
        label: "Evaluation",
        status: "live",
        blurb: "Ragas vs DeepEval vs LangSmith vs Phoenix.",
      },
    ],
  },
];

const DECISION_PRINCIPLES = [
  {
    question: "How should I chunk documents?",
    default: "Recursive chunking, 512-1000 tokens, 50-100 overlap.",
    unless: "Markdown/code → use structure-aware. Short answers → sentence-based.",
    href: "/compare/chunking",
  },
  {
    question: "Which vector DB should I use?",
    default: "Start with Chroma (local) or pgvector (if you have Postgres).",
    unless: "You need serverless scale → Pinecone. Multi-tenant → Qdrant.",
    href: "/compare/vector-dbs",
  },
  {
    question: "Which embedding model?",
    default: "text-embedding-3-small (OpenAI) for most use cases.",
    unless: "Privacy/cost → local models (BGE, nomic). Domain-specific → fine-tune.",
    href: "/compare/embeddings",
  },
  {
    question: "Should I rerank?",
    default: "Yes, cross-encoder on top-20→5 is almost always worth it.",
    unless: "Latency budget < 100ms and you can't batch.",
    href: "/compare/reranking",
  },
  {
    question: "Which framework?",
    default: "LangChain for prototypes, DIY for production control.",
    unless: "Complex document parsing → LlamaIndex. Enterprise → Haystack.",
    href: "/compare/frameworks",
  },
];

export default function ComparePage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Decision-first comparisons. Each page helps you pick a default, understand when to deviate,
          and link to challenges where you implement the technique.
        </p>
      </header>

      {/* Quick Decisions */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Quick Decisions
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          &quot;Pick this default unless...&quot; — stop rabbit holes.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DECISION_PRINCIPLES.map((d) => (
            <Link key={d.question} href={d.href}>
              <Card className="h-full p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {d.question}
                </p>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Default:</span>{" "}
                  {d.default}
                </p>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-amber-600 dark:text-amber-400">Unless:</span>{" "}
                  {d.unless}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparison Pages */}
      {SECTIONS.map((section) => (
        <section key={section.title}>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{section.desc}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {section.pages.map((page) => (
              <Link key={page.href} href={page.href}>
                <Card className="h-full p-4 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {page.label}
                    </p>
                    <Badge variant={page.status === "live" ? "accent" : "muted"}>
                      {page.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{page.blurb}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Next Steps */}
      <Card className="p-5">
        <p className="text-sm font-medium">After comparing, implement</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/challenges"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Practice challenges →
          </Link>
          <Link
            href="/projects"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Production templates →
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
