"use client";

import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";

const PROJECTS = [
  {
    id: 1,
    title: "LegalDiscovery Pro",
    tagline: "Precision in Legal Context",
    description: "Build a RAG system for lawyers to query 10,000+ case files with precise clause precedent citations.",
    objective: "Implement 'Lost-in-the-Middle' mitigation and deterministic citation mapping.",
    difficulty: "Beginner",
    timeline: "3-5 days",
    tech: ["FastAPI", "Qdrant", "Cohere"],
    keyFeatures: ["Stable Chunk IDs", "Overlapping Windows", "Exact Citations"],
    metric: "Recall@10 > 92%",
    whyItMatters: "'Lost-in-the-middle' kills 70% of legal LLM pilots.",
  },
  {
    id: 2,
    title: "FinPulse 360",
    tagline: "Real-time Quantitative RAG",
    description: "Extract insights from SEC filings and earnings calls containing mixed table and text data.",
    objective: "Master table parsing and hybrid retrieval for ticker symbols and financial metrics.",
    difficulty: "Intermediate",
    timeline: "5-7 days",
    tech: ["Next.js", "Pinecone", "Unstructured"],
    keyFeatures: ["Table-to-Markdown", "BM25 Fusion", "Ticker Filtering"],
    metric: "95% accuracy on numerical QA",
    whyItMatters: "Tables are the 'final boss' of financial RAG.",
  },
  {
    id: 3,
    title: "Med-Tech Compliance",
    tagline: "Hallucination-Free Safety",
    description: "Verify if medical marketing claims are backed by clinical papers. No mistakes allowed.",
    objective: "Build an agentic self-reflection loop with RAGAS factuality scoring.",
    difficulty: "Advanced",
    timeline: "10-14 days",
    tech: ["LangGraph", "Weaviate", "RAGAS"],
    keyFeatures: ["Multi-step Reasoning", "Guardrails", "Confidence Scoring"],
    metric: "Hallucination < 0.5%",
    whyItMatters: "Verification loops are required for regulated deployments.",
  },
  {
    id: 4,
    title: "DevDoc Sync",
    tagline: "Incremental Learning",
    description: "Build a RAG system that updates as open-source documentation changes daily.",
    objective: "Implement production-grade change detection and TTL-based caching.",
    difficulty: "Intermediate",
    timeline: "4-6 days",
    tech: ["Python", "Redis", "ChromaDB"],
    keyFeatures: ["Document Hashing", "TTL Invalidation", "Webhooks"],
    metric: "Sync latency < 60s",
    whyItMatters: "Static RAG is a toy; real systems require continuous sync.",
  },
];

const QUALITY_CRITERIA = [
  { title: "Deterministic Citations", description: "Every answer maps to a verified chunk ID with offset metadata." },
  { title: "Hybrid Retrieval", description: "Combine BM25 + dense vectors to avoid semantic drift." },
  { title: "Graceful Refusal", description: "Correctly refuse when context is insufficient." },
  { title: "Eval Pipeline", description: "Golden test sets and RAGAS metrics in CI/CD." },
];

export function ProjectsView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="max-w-xl space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Portfolio Projects
        </h2>
        <p className="text-sm leading-relaxed text-gray-500">
          End-to-end builds for your GitHub portfolio.
        </p>
      </div>

      {/* Quality Criteria */}
      <Reveal>
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5">
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Professional Standards
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUALITY_CRITERIA.map((criteria, i) => (
              <div key={i} className="space-y-1">
                <div className="h-px w-4 bg-gray-200" />
                <h4 className="text-xs font-bold text-gray-900">{criteria.title}</h4>
                <p className="text-[11px] leading-relaxed text-gray-500">{criteria.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Project Cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {PROJECTS.map((project, i) => (
          <Reveal key={project.id} delayMs={i * 50}>
            <Card className="group h-full overflow-hidden !p-0 transition-all duration-200-all duration-200 hover:shadow-lg hover:shadow-zinc-100/50 cursor-pointer">
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="border-b border-gray-100 bg-gray-50/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6] text-white text-sm font-bold">
                        {String(project.id).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{project.title}</h3>
                        <p className="text-xs text-gray-500">{project.tagline}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      project.difficulty === "Beginner"
                        ? "bg-emerald-50 text-emerald-600"
                        : project.difficulty === "Intermediate"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs leading-relaxed text-gray-600">
                    {project.description}
                  </p>

                  {/* Key Features */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.keyFeatures.map((feature) => (
                      <span key={feature} className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-auto pt-4">
                    <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Time</p>
                        <p className="mt-0.5 text-xs font-bold text-gray-900">{project.timeline}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Target</p>
                        <p className="mt-0.5 text-xs font-bold text-gray-900">{project.metric}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Stack</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-gray-600 truncate">{project.tech.join("+")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* Pro Tip */}
      <Reveal>
        <div className="mx-auto max-w-xl rounded-xl border border-gray-100 bg-white p-5 text-center">
          <h3 className="text-sm font-bold text-gray-900">Portfolio Tip</h3>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            Include an Architecture Diagram and Benchmarking Table with Recall@k metrics.
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 underline underline-offset-4"
          >
            Learn the fundamentals first
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
