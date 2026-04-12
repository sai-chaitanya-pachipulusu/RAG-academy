"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { RAGScrollStory } from "@/components/landing/RAGScrollStory";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getPlatformStats, CHALLENGES } from "@/lib/challenges/catalog";
import { PricingBanner } from "@/components/pricing/PricingBanner";

const FEATURES = [
  {
    title: "13-Phase Curriculum",
    description: "From vector math to production ops.",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Interactive Labs",
    description: "Write code, run tests, instant feedback.",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Decision Playbooks",
    description: "Matrices for models, LLMs, guardrails.",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Project Certificates",
    description: "Earn certificates for completed tracks.",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
];

const FEATURED_CHALLENGES = [
  { slug: "hyde-search", title: "HyDE Search", difficulty: "medium", category: "Query Transforms" },
  { slug: "reranker-cascade", title: "Rerank Cascade", difficulty: "medium", category: "Post-Retrieval" },
  { slug: "graphrag-knowledge-graph", title: "GraphRAG", difficulty: "hard", category: "Graph RAG" },
  { slug: "end-to-end-rag-pipeline", title: "End-to-End RAG", difficulty: "hard", category: "Capstone" },
];

const ADVANCED_2026 = [
  { title: "MiA-RAG", subtitle: "Mindscape-Aware Context", description: "Hierarchical summarization for global document understanding" },
  { title: "QuCo-RAG", subtitle: "Corpus-Based Uncertainty", description: "Trigger retrieval using pre-training corpus statistics" },
  { title: "HiFi-RAG", subtitle: "Hierarchical Filtering", description: "Multi-stage filtering for maximum context precision" },
  { title: "Graph-O1", subtitle: "MCTS Reasoning", description: "Monte Carlo Tree Search for graph exploration" },
];

const WHATS_NEW = [
  { title: "Voice RAG", desc: "Audio-based retrieval and generation", phase: "Phase 7" },
  { title: "MCP Integration", desc: "Model Context Protocol support", phase: "Phase 5" },
  { title: "Project Certificates", desc: "Earn certificates for completed tracks", phase: "Projects" },
  { title: "Peer Reviews", desc: "Community feedback on submissions", phase: "Projects" },
];

const stageCounts = CHALLENGES.reduce((acc, challenge) => {
  const stage = challenge.stage;
  acc[stage] = (acc[stage] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const LEARNING_PATH = [
  { name: "Foundations", count: stageCounts["foundations"] || 0, color: "bg-gray-900" },
  { name: "Pre-Retrieval", count: stageCounts["pre-retrieval"] || 0, color: "bg-[#2563EB]" },
  { name: "Retrieval", count: stageCounts["retrieval"] || 0, color: "bg-gray-700" },
  { name: "Query Transforms", count: stageCounts["query-transforms"] || 0, color: "bg-gray-600" },
  { name: "Advanced Retrieval", count: stageCounts["advanced-retrieval"] || 0, color: "bg-gray-500" },
  { name: "Post-Retrieval", count: stageCounts["post-retrieval"] || 0, color: "bg-gray-400" },
  { name: "Grounding & Safety", count: stageCounts["grounding-safety"] || 0, color: "bg-gray-500" },
  { name: "Agentic RAG", count: stageCounts["agentic-rag"] || 0, color: "bg-gray-600" },
  { name: "Graph RAG", count: stageCounts["graph-rag"] || 0, color: "bg-gray-700" },
  { name: "Multimodal", count: stageCounts["multimodal"] || 0, color: "bg-gray-600" },
  { name: "Fine-tuning", count: stageCounts["fine-tuning"] || 0, color: "bg-gray-500" },
  { name: "Production Ops", count: stageCounts["production-ops"] || 0, color: "bg-gray-400" },
  { name: "Evaluation Ops", count: stageCounts["evaluation-ops"] || 0, color: "bg-gray-300" },
];

const platformStats = getPlatformStats();
const STATS = [
  { value: `${platformStats.totalLessons}`, label: "Lessons" },
  { value: `${platformStats.totalChallenges}+`, label: "Challenges" },
  { value: `${platformStats.totalModules}`, label: "Modules" },
  { value: `${platformStats.totalStages}`, label: "Phases" },
];

export default function Home() {
  const { user } = useSupabaseAuth();

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      <PricingBanner />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:items-center">
            <div className="space-y-6">
              <Reveal>
                <h1 className="text-4xl font-medium tracking-tight lg:text-5xl text-gray-900 font-heading">
                  Master RAG engineering
                </h1>
              </Reveal>

              <Reveal delayMs={60}>
                <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
                  Build production-ready RAG systems from fundamentals to cutting-edge research. 
                  Learn through interactive labs and real-world challenges.
                </p>
              </Reveal>

              <Reveal delayMs={120}>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={user ? "/learn" : "/login"}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 text-sm font-medium text-white transition-colors hover:bg-gray-800 cursor-pointer"
                  >
                    {user ? "Continue Learning" : "Get Started"}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/challenges"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-6 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
                  >
                    Browse Challenges
                  </Link>
                </div>
              </Reveal>

              <Reveal delayMs={180}>
                <div className="flex items-center gap-8 pt-4">
                  {STATS.map((stat, i) => (
                    <div key={i}>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delayMs={120}>
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl" />
                <div className="relative bg-gray-50/50 rounded-2xl p-8 border border-gray-100/50">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                          <path d="M2 17L12 22L22 17" />
                          <path d="M2 12L12 17L22 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">RAG Academy</p>
                        <p className="text-xs text-gray-400">Interactive Learning</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { label: "Lessons", value: "68" },
                        { label: "Challenges", value: "263+" },
                        { label: "Phases", value: "13" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delayMs={i * 40}>
                <div className="bg-white rounded-xl p-5 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <div className="mb-3 text-gray-900">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Challenges */}
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 font-heading">Popular Challenges</h2>
              <p className="mt-2 text-gray-500">Community favorites to get started</p>
            </div>
            <Link
              href="/challenges"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CHALLENGES.map((challenge, i) => (
              <Reveal key={challenge.slug} delayMs={i * 40}>
                <Link
                  href={`/challenges/${challenge.slug}`}
                  className="group block rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200-all duration-200 hover:border-[#3B82F6]/30 hover:shadow-md cursor-pointer"
                >
                  <div className="mb-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                      challenge.difficulty === 'hard'
                        ? 'bg-[#3B82F6] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5 group-hover:text-[#3B82F6] transition-all duration-200-all duration-200 font-heading cursor-pointer">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-gray-400">{challenge.category}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced RAG 2026 */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3B82F6] px-2.5 py-1 text-[11px] font-semibold text-white uppercase tracking-wide">
                New in 2026
              </span>
              <span className="text-xs text-gray-400">Latest research techniques</span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight mb-2 font-heading">Advanced RAG Architectures</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-2xl">
              Master cutting-edge techniques from the latest research papers.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ADVANCED_2026.map((tech, i) => (
                <Reveal key={tech.title} delayMs={i * 40}>
                  <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200-all duration-200 hover:border-[#3B82F6]/30 hover:shadow-md cursor-pointer">
                    <h3 className="text-sm font-semibold mb-0.5 font-heading">{tech.title}</h3>
                    <p className="text-[11px] text-gray-400 mb-1.5">{tech.subtitle}</p>
                    <p className="text-xs text-gray-500 leading-snug">{tech.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <Link
                href="/challenges?search=rag"
                className="inline-flex h-8 items-center justify-center rounded-full bg-[#3B82F6] px-5 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#2563EB] cursor-pointer"
              >
                Explore Advanced Challenges
              </Link>
              <Link
                href="/playbooks"
                className="text-sm font-medium text-[#3B82F6] hover:underline underline-offset-2 cursor-pointer"
              >
                Read Playbooks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What's New */}
      <section className="border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight font-heading">What's New</h2>
              <p className="mt-1 text-sm text-gray-500">Recent additions to the platform</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WHATS_NEW.map((item, i) => (
              <Reveal key={item.title} delayMs={i * 40}>
                <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200-all duration-200 hover:shadow-sm cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <span className="text-[10px] font-medium text-gray-400 uppercase">{item.phase}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Your Learning Journey</h2>
            <p className="mt-1 text-sm text-gray-500">13 phases from fundamentals to production</p>
          </div>

          <Reveal delayMs={60}>
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-1.5 min-w-max justify-center">
                {LEARNING_PATH.map((stage, i) => (
                  <div key={stage.name} className="flex items-center">
                    <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 transition-all duration-200-all duration-200 hover:shadow-sm cursor-pointer">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${stage.color}`} />
                        <div>
                          <p className="text-xs font-semibold">{stage.name}</p>
                          <p className="text-[10px] text-gray-400">{stage.count}</p>
                        </div>
                      </div>
                    </div>
                    {i < LEARNING_PATH.length - 1 && (
                      <svg className="h-3 w-3 text-gray-300 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="text-center mt-6">
              <Link href="/learn" className="text-sm font-medium text-blue-600 hover:underline underline-offset-2 cursor-pointer">
                View full curriculum
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section className="border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Hands-On Projects</h2>
              <p className="mt-1 text-sm text-gray-500">Build production systems, earn certificates</p>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200-all duration-200 hover:bg-gray-50 cursor-pointer"
            >
              View all
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Build a Vector Database", challenges: 6, difficulty: "Intermediate", icon: "DB", desc: "Implement FAISS-like algorithms" },
              { title: "Build a RAG Pipeline", challenges: 5, difficulty: "Beginner", icon: "RAG", desc: "End-to-end retrieval augmented generation" },
              { title: "Build an Agent", challenges: 5, difficulty: "Advanced", icon: "AG", desc: "Agentic RAG with tool use" },
            ].map((project, i) => (
              <Reveal key={project.title} delayMs={i * 40}>
                <Link
                  href="/projects"
                  className="group block rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-50 text-[10px] font-bold text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all duration-200-all duration-200 cursor-pointer">
                      {project.icon}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      project.difficulty === 'Advanced'
                        ? 'bg-[#3B82F6] text-white'
                        : project.difficulty === 'Intermediate'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5 group-hover:text-blue-600 transition-all duration-200-all duration-200 cursor-pointer">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{project.desc}</p>
                  <p className="text-[11px] text-gray-400">{project.challenges} challenges with certificate</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RAG Pipeline */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
          <Reveal>
            <div className="mb-6 max-w-lg">
              <h2 className="text-xl font-semibold tracking-tight">
                A production RAG system, <span className="text-gray-300">step by step.</span>
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Scroll through the pipeline to understand how each component works together.
              </p>
            </div>
          </Reveal>
          <RAGScrollStory />
        </div>
      </section>

      {/* Resources */}
      <section className="border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-8">
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/playbooks"
              className="group rounded-lg border border-gray-200 bg-white p-5 transition-all duration-200-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">Production Playbooks</h3>
              <p className="text-xs text-gray-500">Decision matrices, troubleshooting guides, best practices</p>
            </Link>

            <Link
              href="/compare/vector-dbs"
              className="group rounded-lg border border-gray-200 bg-white p-5 transition-all duration-200-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">Tool Comparisons</h3>
              <p className="text-xs text-gray-500">Vector databases, embedding models, framework comparisons</p>
            </Link>

            <Link
              href="/learn"
              className="group rounded-lg border border-gray-200 bg-white p-5 transition-all duration-200-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">Structured Curriculum</h3>
              <p className="text-xs text-gray-500">13 stages from foundations to advanced production patterns</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-8">
          <Reveal>
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center lg:p-12 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                Build production RAG systems
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
                Master retrieval, grounding, agents, and evaluation through 260+ interactive challenges. Earn certificates. Ship with confidence.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={user ? "/learn" : "/login"}
                  className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#3B82F6] px-6 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#2563EB] cursor-pointer"
                >
                  Start Learning Free
                  <svg className="h-3.5 w-3.5 transition-all duration-200-transform group-hover:translate-x-0.5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-medium text-gray-700 transition-all duration-200-all duration-200 hover:bg-gray-50 cursor-pointer"
                >
                  View Projects
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3B82F6] text-white">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <span className="font-semibold text-sm">RAG Academy</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                The complete platform for learning production RAG systems.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Learn</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link href="/learn" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Curriculum</Link></li>
                <li><Link href="/challenges" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Challenges</Link></li>
                <li><Link href="/projects" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Projects</Link></li>
                <li><Link href="/playbooks" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Playbooks</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Compare</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link href="/compare/vector-dbs" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Vector DBs</Link></li>
                <li><Link href="/compare/embeddings" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Embeddings</Link></li>
                <li><Link href="/compare/frameworks" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Frameworks</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-gray-500">
                <li><Link href="/papers" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Research Papers</Link></li>
                <li><Link href="/analytics" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Your Progress</Link></li>
                <li><Link href="/leaderboard" className="hover:text-gray-900 transition-all duration-200-all duration-200 cursor-pointer">Leaderboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <p>© 2026 RAG Academy. All rights reserved.</p>
            <p>Built for production RAG engineers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
