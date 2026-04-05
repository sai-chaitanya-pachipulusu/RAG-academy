import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProjectChecklist } from "@/components/projects/ProjectChecklist";
import { LIVE_DATA_CHALLENGES } from "@/lib/challenges/defs/liveProjects";

type Template = {
  name: string;
  desc: string;
  stack: string[];
  repoUrl: string;
  features: string[];
  status: "ready" | "coming";
  difficulty: string;
};

const TEMPLATES: Template[] = [
  {
    name: "Python FastAPI + LangChain",
    desc: "Production-ready RAG API with hybrid retrieval, reranking, and evaluation harness.",
    stack: ["Python 3.11+", "FastAPI", "LangChain", "OpenAI", "Chroma/Pinecone"],
    repoUrl: "https://github.com/sai-chaitanya-pachipulusu/RAG-academy-templates/tree/main/python-fastapi-rag",
    features: [
      "Hybrid retrieval (dense + BM25)",
      "Cross-encoder reranking",
      "Citation-grounded generation",
      "Golden set evaluation",
      "Rate limiting + logging",
    ],
    status: "coming",
    difficulty: "Intermediate",
  },
  {
    name: "Node.js/TypeScript + Express",
    desc: "TypeScript RAG baseline with the same architecture, ready for serverless deployment.",
    stack: ["Node.js 18+", "TypeScript", "Express", "OpenAI", "Chroma"],
    repoUrl: "https://github.com/sai-chaitanya-pachipulusu/RAG-academy-templates/tree/main/node-typescript-rag",
    features: [
      "Same pipeline architecture",
      "Full TypeScript types",
      "LLM-based reranking",
      "Streaming support",
      "Evaluation metrics",
    ],
    status: "coming",
    difficulty: "Intermediate",
  },
  {
    name: "Next.js Full-Stack RAG",
    desc: "Complete RAG application with UI, API, and database — the same architecture as RAG Academy.",
    stack: ["Next.js 16", "React", "Supabase", "Polar.sh", "Vercel"],
    repoUrl: "https://github.com/sai-chaitanya-pachipulusu/RAG-academy",
    features: [
      "Full-stack RAG pipeline",
      "Auth + subscriptions",
      "Progress tracking",
      "Admin dashboard",
      "Production deployment",
    ],
    status: "ready",
    difficulty: "Advanced",
  },
];

type ProjectTrack = {
  id: string;
  title: string;
  desc: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  challenges: Array<{ slug: string; label: string }>;
  outcome: string;
  rubric: string[];
  icon: string;
};

const PROJECT_TRACKS: ProjectTrack[] = [
  {
    id: "vector-db",
    title: "Build a Vector Database",
    desc: "Implement the core data structures and algorithms behind vector DBs like FAISS.",
    difficulty: "intermediate",
    duration: "~3 hours",
    challenges: [
      { slug: "dense-vector-class", label: "Dense Vector Class" },
      { slug: "cosine-similarity", label: "Cosine Similarity" },
      { slug: "naive-flat-index", label: "Naive Flat Index" },
      { slug: "ivf-flat-index", label: "IVF Flat Index" },
      { slug: "hnsw-index", label: "HNSW Index" },
      { slug: "product-quantization", label: "Product Quantization" },
    ],
    outcome: "A working vector index with approximate nearest neighbor search.",
    rubric: [
      "Correct similarity calculations",
      "Handles 10k+ vectors efficiently",
      "Proper index serialization",
      "Recall@10 > 0.95 on test set",
    ],
    icon: "🗄️",
  },
  {
    id: "rag-pipeline",
    title: "Build a RAG Pipeline",
    desc: "Create a complete retrieval-augmented generation pipeline from scratch.",
    difficulty: "beginner",
    duration: "~2 hours",
    challenges: [
      { slug: "end-to-end-rag-pipeline", label: "End-to-End RAG" },
      { slug: "chunking-strategies", label: "Chunking Strategies" },
      { slug: "embedding-model-selection", label: "Embedding Selection" },
      { slug: "basic-retrieval", label: "Basic Retrieval" },
      { slug: "hybrid-search", label: "Hybrid Search" },
    ],
    outcome: "A functional RAG system that can answer questions from your documents.",
    rubric: [
      "Stable chunk IDs",
      "Correct embedding generation",
      "Top-k retrieval works",
      "Cited answers from context",
    ],
    icon: "🔗",
  },
  {
    id: "reranker",
    title: "Build a Reranker",
    desc: "Implement cross-encoder scoring and cascade reranking for precision.",
    difficulty: "intermediate",
    duration: "~2.5 hours",
    challenges: [
      { slug: "reranker-score-function", label: "Reranker Score" },
      { slug: "reranker-cascade", label: "Reranker Cascade" },
      { slug: "mmr-diversity", label: "MMR Diversity" },
      { slug: "reranker-selection", label: "Reranker Selection" },
    ],
    outcome: "A reranking module that improves retrieval precision measurably.",
    rubric: [
      "Correct cross-encoder scoring",
      "Cascade reduces latency vs. single reranker",
      "MMR increases diversity without hurting relevance",
      "Precision@5 improvement > 10%",
    ],
    icon: "🎯",
  },
  {
    id: "evaluator",
    title: "Build an Evaluator",
    desc: "Create a comprehensive evaluation suite for RAG systems.",
    difficulty: "beginner",
    duration: "~2 hours",
    challenges: [
      { slug: "evaluator-recall-at-k", label: "Recall@k" },
      { slug: "evaluator-mrr", label: "MRR" },
      { slug: "evaluator-ndcg", label: "nDCG" },
      { slug: "evaluator-f1-score", label: "F1 Score" },
      { slug: "faithfulness-judge", label: "Faithfulness Judge" },
      { slug: "llm-as-judge", label: "LLM-as-Judge" },
    ],
    outcome: "An evaluation harness that measures retrieval and generation quality.",
    rubric: [
      "Correct metric implementations",
      "Golden set loader works",
      "Results are reproducible",
      "Report includes confidence intervals",
    ],
    icon: "📊",
  },
  {
    id: "agent",
    title: "Build an Agent",
    desc: "Create an agentic RAG system with tool use and self-correction.",
    difficulty: "advanced",
    duration: "~4 hours",
    challenges: [
      { slug: "tool-use-basics", label: "Tool Use Basics" },
      { slug: "react-implementation", label: "ReAct Implementation" },
      { slug: "self-correction-loop", label: "Self-Correction Loop" },
      { slug: "corrective-rag", label: "Corrective RAG" },
      { slug: "agentic-rag-workflows", label: "Agentic Workflows" },
    ],
    outcome: "An agent that can plan, retrieve, verify, and retry when needed.",
    rubric: [
      "Correct ReAct loop implementation",
      "Tool calls are well-formed",
      "Self-correction improves answer quality",
      "Handles failure cases gracefully",
    ],
    icon: "🤖",
  },
  {
    id: "graph-rag",
    title: "Build GraphRAG",
    desc: "Implement knowledge graphs and multi-hop reasoning for complex queries.",
    difficulty: "advanced",
    duration: "~4 hours",
    challenges: [
      { slug: "entity-extraction", label: "Entity Extraction" },
      { slug: "knowledge-graph-extraction", label: "KG Extraction" },
      { slug: "graphrag-knowledge-graph", label: "GraphRAG KG" },
      { slug: "graph-traversal-rag", label: "Graph Traversal" },
      { slug: "multi-hop-qa", label: "Multi-Hop QA" },
    ],
    outcome: "A graph-based RAG system that can answer multi-hop reasoning questions.",
    rubric: [
      "Correct entity/relation extraction",
      "Graph traversal finds multi-hop paths",
      "Answers require reasoning across nodes",
      "Handles missing edges gracefully",
    ],
    icon: "🕸️",
  },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          Build production-grade RAG systems. Start with live interactive projects, follow guided
          tracks, or download templates to skip boilerplate.
        </p>
      </header>

      {/* Live Interactive Projects */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Live Projects
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Interactive capstone challenges. Write code, run tests, get instant feedback — all in your browser.
            </p>
          </div>
          <Badge variant="accent">{LIVE_DATA_CHALLENGES.length} projects</Badge>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {LIVE_DATA_CHALLENGES.map((project) => (
            <Card key={project.slug} className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {project.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {project.description}
                  </p>
                </div>
                <Badge
                  variant={
                    project.difficulty === "easy"
                      ? "accent"
                      : project.difficulty === "medium"
                        ? "muted"
                        : "default"
                  }
                >
                  {project.difficulty}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(project as any).stack ? (project as any).stack.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {s}
                  </span>
                )) : (
                  <>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      Python
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      In-Browser
                    </span>
                  </>
                )}
              </div>

              {project.realWorld && (
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Real-World Impact
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {project.realWorld.description}
                  </p>
                  {project.realWorld.companies && project.realWorld.companies.length > 0 && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      Used by: {project.realWorld.companies.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {project.xpReward} XP · {project.timeEstimate?.label ?? "~45 min"}
                </span>
                <Link
                  href={`/challenges/${project.slug}`}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Start Project →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Tracks */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Project Tracks
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Build from first principles. Each track chains related challenges into a portfolio-grade project.
            </p>
          </div>
          <Badge variant="muted">{PROJECT_TRACKS.length} tracks</Badge>
        </div>

        <div className="mt-4 space-y-4">
          {PROJECT_TRACKS.map((track) => (
            <Card key={track.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{track.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {track.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{track.desc}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                      {track.duration} · {track.challenges.length} challenges
                    </p>
                  </div>
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
                        key={c.slug}
                        href={`/challenges/${c.slug}`}
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

      {/* Production Templates */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Production Templates
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Ready-to-deploy starter kits. Clone, configure, and ship your RAG system in hours.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
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
                  {t.status === "ready" ? "Live" : "Coming"}
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
                  href={t.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  View on GitHub →
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
