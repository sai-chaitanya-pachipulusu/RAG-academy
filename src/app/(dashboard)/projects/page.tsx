import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProjectChecklist } from "@/components/projects/ProjectChecklist";

type Template = {
  name: string;
  desc: string;
  stack: string[];
  downloadUrl: string;
  features: string[];
  status: "ready" | "coming";
};

const TEMPLATES: Template[] = [
  {
    name: "Python FastAPI + LangChain",
    desc: "Production-ready RAG API with hybrid retrieval, reranking, and evaluation harness.",
    stack: ["Python 3.11+", "FastAPI", "LangChain", "OpenAI", "Chroma/Pinecone"],
    downloadUrl: "/templates/python-fastapi-rag",
    features: [
      "Hybrid retrieval (dense + BM25)",
      "Cross-encoder reranking",
      "Citation-grounded generation",
      "Golden set evaluation",
      "Rate limiting + logging",
    ],
    status: "ready",
  },
  {
    name: "Node.js/TypeScript + Express",
    desc: "TypeScript RAG baseline with the same architecture, ready for serverless deployment.",
    stack: ["Node.js 18+", "TypeScript", "Express", "OpenAI", "Chroma"],
    downloadUrl: "/templates/node-typescript-rag",
    features: [
      "Same pipeline architecture",
      "Full TypeScript types",
      "LLM-based reranking",
      "Streaming support",
      "Evaluation metrics",
    ],
    status: "ready",
  },
];

type ProjectTrack = {
  title: string;
  desc: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  challenges: Array<{ label: string; href: string }>;
  outcome: string;
  rubric: string[];
};

const PROJECT_TRACKS: ProjectTrack[] = [
  {
    title: "Build a Vector Database",
    desc: "Implement the core data structures and algorithms behind vector DBs like FAISS.",
    difficulty: "intermediate",
    challenges: [
      { label: "Dense Vector Class", href: "/challenges/dense-vector-class" },
      { label: "Naive Flat Index", href: "/challenges/naive-flat-index" },
      { label: "IVF Flat Index", href: "/challenges/ivf-flat-index" },
      { label: "HNSW Index", href: "/challenges/hnsw-index" },
    ],
    outcome: "A working vector index with approximate nearest neighbor search.",
    rubric: [
      "Correct similarity calculations",
      "Handles 10k+ vectors efficiently",
      "Proper index serialization",
      "Recall@10 > 0.95 on test set",
    ],
  },
  {
    title: "Build a RAG Pipeline",
    desc: "Create a complete retrieval-augmented generation pipeline from scratch.",
    difficulty: "beginner",
    challenges: [
      { label: "RAG Pipeline Chunker", href: "/challenges/rag-pipeline-chunker" },
      { label: "RAG Pipeline Embedder", href: "/challenges/rag-pipeline-embedder" },
      { label: "RAG Pipeline Retriever", href: "/challenges/rag-pipeline-retriever" },
      { label: "RAG Pipeline Generator", href: "/challenges/rag-pipeline-generator" },
    ],
    outcome: "A functional RAG system that can answer questions from your documents.",
    rubric: [
      "Stable chunk IDs",
      "Correct embedding generation",
      "Top-k retrieval works",
      "Cited answers from context",
    ],
  },
  {
    title: "Build a Reranker",
    desc: "Implement cross-encoder scoring and cascade reranking for precision.",
    difficulty: "intermediate",
    challenges: [
      { label: "Reranker Score Function", href: "/challenges/reranker-score-function" },
      { label: "Reranker Cascade", href: "/challenges/reranker-cascade" },
      { label: "MMR Diversity", href: "/challenges/mmr-diversity" },
    ],
    outcome: "A reranking module that improves retrieval precision measurably.",
    rubric: [
      "Correct cross-encoder scoring",
      "Cascade reduces latency vs. single reranker",
      "MMR increases diversity without hurting relevance",
      "Precision@5 improvement > 10%",
    ],
  },
  {
    title: "Build an Evaluator",
    desc: "Create a comprehensive evaluation suite for RAG systems.",
    difficulty: "beginner",
    challenges: [
      { label: "Recall@k", href: "/challenges/evaluator-recall-at-k" },
      { label: "MRR", href: "/challenges/evaluator-mrr" },
      { label: "nDCG", href: "/challenges/evaluator-ndcg" },
      { label: "Faithfulness Judge", href: "/challenges/faithfulness-judge" },
    ],
    outcome: "An evaluation harness that measures retrieval and generation quality.",
    rubric: [
      "Correct metric implementations",
      "Golden set loader works",
      "Results are reproducible",
      "Report includes confidence intervals",
    ],
  },
  {
    title: "Build an Agent",
    desc: "Create an agentic RAG system with tool use and self-correction.",
    difficulty: "advanced",
    challenges: [
      { label: "Tool Use Basics", href: "/challenges/tool-use-basics" },
      { label: "ReAct Implementation", href: "/challenges/react-implementation" },
      { label: "Self-Correction Loop", href: "/challenges/self-correction-loop" },
      { label: "Corrective RAG", href: "/challenges/corrective-rag" },
    ],
    outcome: "An agent that can plan, retrieve, verify, and retry when needed.",
    rubric: [
      "Correct ReAct loop implementation",
      "Tool calls are well-formed",
      "Self-correction improves answer quality",
      "Handles failure cases gracefully",
    ],
  },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Production templates and guided project tracks. Download a template to skip boilerplate,
          or follow a track to build core components from scratch.
        </p>
      </header>

      {/* Production Templates */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Production Templates
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Download and deploy. Each template includes hybrid retrieval, reranking, and evaluation.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {TEMPLATES.map((t) => (
            <Card key={t.name} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{t.desc}</p>
                </div>
                <Badge variant={t.status === "ready" ? "accent" : "muted"}>
                  {t.status}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {t.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {t.status === "ready" ? (
                <a
                  href={t.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  View Template →
                </a>
              ) : (
                <button
                  disabled
                  className="mt-auto inline-flex h-9 items-center justify-center rounded-full bg-zinc-200 px-4 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                >
                  Coming soon
                </button>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Project Tracks */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Project Tracks
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Build from first principles. Each track has a rubric for portfolio-grade work.
        </p>

        <div className="mt-4 space-y-4">
          {PROJECT_TRACKS.map((track) => (
            <Card key={track.title} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {track.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{track.desc}</p>
                </div>
                <Badge
                  variant={
                    track.difficulty === "beginner"
                      ? "accent"
                      : track.difficulty === "intermediate"
                        ? "muted"
                        : "default"
                  }
                >
                  {track.difficulty}
                </Badge>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Challenges
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {track.challenges.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Evaluation Rubric
                  </p>
                  <ul className="mt-2 space-y-1">
                    {track.rubric.map((r, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                      >
                        <input type="checkbox" className="mt-0.5 rounded" disabled />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Outcome
                </p>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{track.outcome}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Submission Checklist */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Submission Checklist
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Use this checklist to ensure your project meets production standards.
        </p>
        <div className="mt-4">
          <ProjectChecklist />
        </div>
      </section>

      {/* Next Steps */}
      <Card className="p-5">
        <p className="text-sm font-medium">Next steps</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/learn"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Learn the concepts →
          </Link>
          <Link
            href="/challenges"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Practice challenges →
          </Link>
          <Link
            href="/compare/evaluation"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.06]"
          >
            Evaluation frameworks →
          </Link>
        </div>
      </Card>
    </div>
  );
}
