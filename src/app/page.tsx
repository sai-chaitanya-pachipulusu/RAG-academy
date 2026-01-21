"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { RAGScrollStory } from "@/components/landing/RAGScrollStory";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getPlatformStats } from "@/lib/challenges/catalog";
import { PricingBanner } from "@/components/pricing/PricingBanner";


const FEATURES = [
  {
    title: "12-Module Curriculum",
    description: "Production-focused learning path from embeddings to scalable operations.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Interactive Labs",
    description: "Executable environments for chunking, vector search, and reranking.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: "Decision Playbooks",
    description: "Matrices for choosing retrieval models, LLMs, and guardrails.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

// Featured challenges - curated selection
const FEATURED_CHALLENGES = [
  { slug: "hyde-search", title: "HyDE Search", difficulty: "medium", category: "Query Transforms" },
  { slug: "rerank-cascade", title: "Rerank Cascade", difficulty: "medium", category: "Post-Retrieval" },
  { slug: "graphrag-knowledge-graph", title: "GraphRAG", difficulty: "hard", category: "Graph RAG" },
  { slug: "mia-rag-mindscape", title: "MiA-RAG", difficulty: "hard", category: "Advanced 2025" },
];

// Advanced RAG 2025 techniques
const ADVANCED_2025 = [
  { 
    title: "MiA-RAG", 
    subtitle: "Mindscape-Aware Context",
    description: "Hierarchical summarization for global document understanding",
  },
  { 
    title: "QuCo-RAG", 
    subtitle: "Corpus-Based Uncertainty",
    description: "Trigger retrieval using pre-training corpus statistics",
  },
  { 
    title: "HiFi-RAG", 
    subtitle: "Hierarchical Filtering",
    description: "Multi-stage filtering for maximum context precision",
  },
  { 
    title: "Graph-O1", 
    subtitle: "MCTS Reasoning",
    description: "Monte Carlo Tree Search for graph exploration",
  },
];

// Learning path stages
const LEARNING_PATH = [
  { name: "Foundations", count: 4, color: "bg-blue-500" },
  { name: "Retrieval", count: 6, color: "bg-emerald-500" },
  { name: "Post-Retrieval", count: 8, color: "bg-amber-500" },
  { name: "Evaluation", count: 6, color: "bg-purple-500" },
  { name: "Production", count: 5, color: "bg-rose-500" },
];

// Dynamic stats from actual challenge data
const platformStats = getPlatformStats();
const roundedChallenges = Math.floor(platformStats.totalChallenges / 5) * 5;
const STATS = [
  { value: `${roundedChallenges}+`, label: "Challenges" },
  { value: `${platformStats.totalModules}`, label: "Modules" },
  { value: `${platformStats.totalStages}`, label: "Stages" },
];

export default function Home() {
  const { user } = useSupabaseAuth();

  return (
    <div className="relative min-h-screen bg-white text-black">
      {/* Sophisticated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.02)_0%,_transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-transparent via-white/95 to-white" />
      </div>

      {/* Pricing Banner */}
      <PricingBanner />

<div className="relative mx-auto max-w-6xl px-6 pt-16 lg:pt-24">
        {/* Hero Section */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16">
          {/* Left Column: Text */}
          <div className="flex-1 space-y-6">
            <Reveal>
              <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-black/5 backdrop-blur px-6 py-3 text-xs font-medium text-black/70">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
                </span>
                Production-Ready RAG • 2025
              </div>
            </Reveal>

            <Reveal delayMs={100}>
              <h1 className="text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl">
                Master RAG
                <br />
                <span className="font-light">engineering.</span>
              </h1>
            </Reveal>

            <Reveal delayMs={200}>
              <p className="max-w-lg text-lg leading-relaxed text-black/60 font-light">
                From fundamentals to cutting-edge research. Build production-ready 
                RAG systems with interactive labs and real-world challenges.
              </p>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="flex flex-col items-start gap-3 sm:flex-row">
                <Link
                  href={user ? "/learn" : "/login"}
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-base font-medium text-white transition-all hover:bg-black/90"
                >
                  {user ? "Continue Learning" : "Get Started Free"}
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/challenges"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-base font-medium text-black transition-all hover:border-black/20 hover:bg-black/5"
                >
                  Explore Challenges
                </Link>
              </div>
            </Reveal>

            {/* Stats */}
            <Reveal delayMs={400}>
              <div className="flex items-center gap-8 pt-6">
                {STATS.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-bold text-black">{stat.value}</p>
                    <p className="text-sm font-medium uppercase tracking-wider text-black/40">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Visual */}
          <Reveal delayMs={300}>
            <div className="relative flex-1 hidden lg:block">
              <div className="absolute -inset-12 rounded-[60px] bg-black/[0.02] blur-2xl" />
              <div className="relative aspect-[4/3] max-w-md rounded-2xl border border-black/10 bg-white/90 backdrop-blur-xl shadow-xl p-8">
                {/* Sophisticated RAG Diagram */}
                <div className="flex h-full flex-col items-center justify-center gap-12">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-white shadow-lg">
                    <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                      <path d="M2 17L12 22L22 17" />
                      <path d="M2 12L12 17L22 12" />
                    </svg>
                  </div>
<div className="space-y-2 text-center">
                    <p className="text-sm font-light uppercase tracking-wider text-black/40">RAG Academy</p>
                    <p className="text-xs text-black/60 font-light">Learn by building production systems</p>
                  </div>
                  <div className="grid grid-cols-3 gap-8 w-full">
                    {["Retrieve", "Augment", "Generate"].map((step, i) => (
                      <div key={i} className="rounded-2xl border border-black/5 bg-black/[0.02] p-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-black/50">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

{/* Feature Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delayMs={300 + i * 50}>
              <div className="group rounded-3xl border border-black/10 bg-white p-8 transition-all hover:border-black/20 hover:shadow-2xl hover:scale-[1.02] hover:bg-black/[0.02]">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black/60 transition-all group-hover:bg-black/10 group-hover:text-black">
                  {feature.icon}
                </div>
<h3 className="mb-2 text-lg font-medium text-black">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-black/60 font-light">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

{/* Featured Challenges Section */}
        <div className="mt-16">
          <Reveal>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                  Popular Challenges
                </h2>
                <p className="mt-2 text-lg text-black/60 font-light">
                  Start with these community favorites
                </p>
              </div>
              <Link 
                href="/challenges" 
                className="text-lg font-medium text-black/60 hover:text-black transition-colors hidden sm:block"
              >
                View all →
              </Link>
            </div>
          </Reveal>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CHALLENGES.map((challenge, i) => (
              <Reveal key={challenge.slug} delayMs={i * 50}>
                <Link 
                  href={`/challenges/${challenge.slug}`}
                  className="group block rounded-3xl border border-black/10 bg-white p-8 transition-all hover:border-black/20 hover:shadow-2xl hover:scale-[1.02] hover:bg-black/[0.02]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      challenge.difficulty === 'hard' 
                        ? 'bg-black/10 text-black/80' 
                        : 'bg-black/5 text-black/60'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-black group-hover:text-black/80 transition-colors mb-3">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-black/50 font-light">{challenge.category}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Advanced RAG 2025 Section */}
        <div className="mt-40">
          <Reveal>
            <div className="rounded-4xl border border-black/10 bg-black/[0.02] p-12 sm:p-16 shadow-2xl">
              <div className="flex items-center gap-6 mb-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white">
                  NEW IN 2025
                </span>
                <span className="text-sm text-black/60 font-light">Latest research techniques</span>
              </div>
              
              <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl mb-6">
                Advanced RAG Architectures
              </h2>
              <p className="text-xl text-black/60 font-light mb-16 max-w-4xl">
                Master cutting-edge techniques from the latest research papers including 
                MiA-RAG, QuCo-RAG, HiFi-RAG, and more.
              </p>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {ADVANCED_2025.map((tech, i) => (
                  <Reveal key={tech.title} delayMs={i * 50}>
                    <div className="rounded-3xl border border-black/10 bg-white p-8 hover:shadow-2xl transition-all hover:scale-[1.02] hover:bg-black/[0.02]">
                      <h3 className="text-lg font-medium text-black mb-3">{tech.title}</h3>
                      <p className="text-sm font-light text-black/50 mb-4">{tech.subtitle}</p>
                      <p className="text-sm text-black/60 leading-relaxed font-light">{tech.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-16 flex items-center gap-8">
                <Link
                  href="/challenges?search=rag"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-black px-8 text-lg font-medium text-white transition-all hover:bg-black/90 hover:scale-[1.02]"
                >
                  Explore Advanced Challenges
                </Link>
                <Link
                  href="/playbooks"
                  className="text-lg font-medium text-black/60 hover:text-black transition-colors font-light"
                >
                  Read Playbooks →
                </Link>
              </div>
            </div>
          </Reveal>
</div>

        {/* Curriculum Section - Combined Learning Path & Advanced */}
        <div className="mt-16">
          <Reveal>
            <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-8 sm:p-12 shadow-lg">
              <div className="flex items-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                  2025 CURRICULUM
                </span>
                <span className="text-sm text-black/60 font-light">Complete learning path</span>
              </div>
              
              <div className="grid gap-12 lg:grid-cols-2">
                {/* Learning Path */}
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-black mb-6">
                    Your Learning Journey
                  </h3>
                  <p className="text-base text-black/60 font-light mb-8">
                    Progress through carefully designed stages from fundamentals to production
                  </p>

                  <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
                    {LEARNING_PATH.map((stage, i) => (
                      <div key={stage.name} className="flex items-center">
                        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 hover:shadow-md transition-all">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                            <div>
                              <p className="text-sm font-semibold text-black">{stage.name}</p>
                              <p className="text-[10px] text-black/50">{stage.count} challenges</p>
                            </div>
                          </div>
                        </div>
                        {i < LEARNING_PATH.length - 1 ? (
                          <svg className="h-3 w-3 text-black/30 mx-1 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <Link
                      href="/learn"
                      className="text-base font-medium text-black/60 hover:text-black transition-colors font-light"
                    >
                      View full curriculum →
                    </Link>
                  </div>
                </div>

                {/* Advanced Techniques */}
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-black mb-6">
                    Advanced Techniques
                  </h3>
                  <p className="text-base text-black/60 font-light mb-8">
                    Master cutting-edge techniques from latest research
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {ADVANCED_2025.slice(0, 4).map((tech, i) => (
                      <Reveal key={tech.title} delayMs={i * 50}>
                        <div className="rounded-2xl border border-black/10 bg-white p-4 hover:shadow-md transition-all hover:bg-black/[0.02]">
                          <h4 className="text-sm font-medium text-black mb-2">{tech.title}</h4>
                          <p className="text-xs font-light text-black/50 mb-2">{tech.subtitle}</p>
                          <p className="text-xs text-black/60 leading-relaxed font-light">{tech.description}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <Link
                      href="/challenges?search=rag"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition-all hover:bg-black/90"
                    >
                      Explore Advanced
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Scroll Section */}
        <div className="my-16">
          <Reveal>
            <div className="mb-8 max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
                A production RAG system,
                <span className="font-light"> step by step.</span>
              </h2>
              <p className="mt-2 text-sm text-black/60">
                Scroll through the pipeline to understand how each component works together.
              </p>
            </div>
          </Reveal>
          <RAGScrollStory />
        </div>
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Your Learning Journey
              </h2>
              <p className="mt-2 text-sm text-zinc-600 max-w-lg mx-auto">
                Progress through carefully designed stages from fundamentals to production
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {LEARNING_PATH.map((stage, i) => (
                <div key={stage.name} className="flex items-center">
                  <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{stage.name}</p>
                        <p className="text-[10px] text-zinc-500">{stage.count} challenges</p>
                      </div>
                    </div>
                  </div>
                  {i < LEARNING_PATH.length - 1 && (
                    <svg className="h-4 w-4 text-zinc-300 mx-1 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="text-center mt-8">
              <Link
                href="/learn"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                View full curriculum →
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Scroll Section */}
        <div className="my-24">
          <Reveal>
            <div className="mb-10 max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                A production RAG system,
                <span className="gradient-text"> step by step.</span>
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Scroll through the pipeline to understand how each component works together.
              </p>
            </div>
          </Reveal>
          <RAGScrollStory />
        </div>

        {/* Resources Grid */}
        <div className="mb-24">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link 
                href="/playbooks" 
                className="group rounded-2xl border border-zinc-100 bg-white p-6 hover:border-zinc-200 hover:shadow-lg transition-all"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">Production Playbooks</h3>
                <p className="text-sm text-zinc-600">Decision matrices, troubleshooting guides, and best practices</p>
              </Link>

              <Link 
                href="/compare/vector-dbs" 
                className="group rounded-2xl border border-zinc-100 bg-white p-6 hover:border-zinc-200 hover:shadow-lg transition-all"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">Tool Comparisons</h3>
                <p className="text-sm text-zinc-600">Vector databases, embedding models, and framework comparisons</p>
              </Link>

              <Link 
                href="/learn" 
                className="group rounded-2xl border border-zinc-100 bg-white p-6 hover:border-zinc-200 hover:shadow-lg transition-all"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="font-bold text-zinc-900 mb-1">Structured Curriculum</h3>
                <p className="text-sm text-zinc-600">15 stages from foundations to advanced production patterns</p>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* CTA Section */}
        <Reveal>
          <div className="mb-32 rounded-4xl bg-black p-16 text-center sm:p-20 shadow-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to build production RAG?
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-white/70 font-light">
              Join engineers building reliable, scalable RAG systems with the most comprehensive platform available.
            </p>
            <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
              <Link
                href={user ? "/learn" : "/login"}
                className="inline-flex h-16 items-center justify-center gap-4 rounded-2xl bg-white px-10 text-lg font-medium text-black transition-all hover:bg-black/10 hover:scale-[1.02]"
              >
                Start Learning Free
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/challenges"
                className="inline-flex h-16 items-center justify-center rounded-2xl border border-white/20 px-10 text-lg font-medium text-white transition-all hover:border-white/30 hover:bg-white/10"
              >
                Browse Challenges
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-screen-xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <span className="font-bold text-zinc-900">RAG Academy</span>
              </div>
              <p className="text-sm text-zinc-600">
                The complete platform for learning production RAG systems.
              </p>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Learn</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><Link href="/learn" className="hover:text-zinc-900 transition-colors">Curriculum</Link></li>
                <li><Link href="/challenges" className="hover:text-zinc-900 transition-colors">Challenges</Link></li>
                <li><Link href="/playbooks" className="hover:text-zinc-900 transition-colors">Playbooks</Link></li>
              </ul>
            </div>

            {/* Compare */}
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Compare</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><Link href="/compare/vector-dbs" className="hover:text-zinc-900 transition-colors">Vector DBs</Link></li>
                <li><Link href="/compare/embeddings" className="hover:text-zinc-900 transition-colors">Embeddings</Link></li>
                <li><Link href="/compare/frameworks" className="hover:text-zinc-900 transition-colors">Frameworks</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><Link href="/papers" className="hover:text-zinc-900 transition-colors">Research Papers</Link></li>
                <li><Link href="/analytics" className="hover:text-zinc-900 transition-colors">Your Progress</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-200 flex items-center justify-between text-sm text-zinc-500">
            <p>© 2025 RAG Academy. All rights reserved.</p>
            <p>Built for production RAG engineers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
