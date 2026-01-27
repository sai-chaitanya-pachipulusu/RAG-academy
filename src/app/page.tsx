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
  { name: "Foundations", count: 4, color: "bg-zinc-900" },
  { name: "Retrieval", count: 6, color: "bg-zinc-700" },
  { name: "Post-Retrieval", count: 8, color: "bg-zinc-600" },
  { name: "Evaluation", count: 6, color: "bg-zinc-500" },
  { name: "Production", count: 5, color: "bg-zinc-400" },
];

// Dynamic stats from actual challenge data
const platformStats = getPlatformStats();
const roundedChallenges = Math.floor(platformStats.totalChallenges / 5) * 5;
const STATS = [
  { value: `${platformStats.totalLessons}`, label: "Lessons" },
  { value: `${roundedChallenges}+`, label: "Challenges" },
  { value: `${platformStats.totalModules}`, label: "Modules" },
];

export default function Home() {
  const { user } = useSupabaseAuth();

  return (
    <div className="relative min-h-screen bg-white text-zinc-900">
      {/* Pricing Banner */}
      <PricingBanner />

      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-8 pt-24 pb-32 lg:px-16 lg:pt-32 lg:pb-40">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            {/* Left: Text */}
            <div className="space-y-10">
              <Reveal>
                <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-xs font-medium tracking-wide text-zinc-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400/60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-900" />
                  </span>
                  Production-Ready RAG • 2025
                </div>
              </Reveal>

              <Reveal delayMs={80}>
                <h1 className="text-[3.5rem] font-semibold tracking-[-0.035em] leading-[1.08] text-zinc-900 lg:text-[4.5rem]">
                  Master RAG
                  <br />
                  <span className="text-zinc-400">engineering.</span>
                </h1>
              </Reveal>

              <Reveal delayMs={150}>
                <p className="max-w-md text-[1.125rem] leading-[1.7] text-zinc-500 font-normal">
                  From fundamentals to cutting-edge research. Build production-ready 
                  RAG systems with interactive labs and real-world challenges.
                </p>
              </Reveal>

              <Reveal delayMs={220}>
                <div className="flex items-center gap-4">
                  <Link
                    href={user ? "/learn" : "/login"}
                    className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-zinc-900 px-8 text-[15px] font-medium text-white transition-all duration-200 hover:bg-zinc-800"
                  >
                    {user ? "Continue Learning" : "Get Started Free"}
                    <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/challenges"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-[15px] font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    Explore Challenges
                  </Link>
                </div>
              </Reveal>

              {/* Stats Row */}
              <Reveal delayMs={300}>
                <div className="flex items-center gap-12 pt-4">
                  {STATS.map((stat, i) => (
                    <div key={i}>
                      <p className="text-3xl font-semibold tracking-tight text-zinc-900">{stat.value}</p>
                      <p className="text-sm font-medium text-zinc-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right: Visual */}
            <Reveal delayMs={200}>
              <div className="relative hidden lg:block">
                <div className="relative aspect-[4/3] rounded-3xl border border-zinc-100 bg-zinc-50/50 p-10">
                  <div className="flex h-full flex-col items-center justify-center gap-10">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-zinc-900 text-white">
                      <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                        <path d="M2 17L12 22L22 17" />
                        <path d="M2 12L12 17L22 12" />
                      </svg>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">RAG Academy</p>
                      <p className="text-sm text-zinc-500">Learn by building production systems</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                      {["Retrieve", "Augment", "Generate"].map((step, i) => (
                        <div key={i} className="rounded-xl border border-zinc-100 bg-white px-4 py-4 text-center">
                          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{step}</p>
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

      {/* Features Section */}
      <section className="border-t border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          {/* Section Header */}
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl">
                What's Included
              </h2>
              <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
                Everything you need to master RAG engineering, from fundamentals to production deployment.
              </p>
            </div>
          </Reveal>
          
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delayMs={i * 60}>
                <div className="group rounded-2xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:border-zinc-200 hover:shadow-lg">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="text-[15px] leading-relaxed text-zinc-500">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Challenges Section */}
      <section className="border-t border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          <Reveal>
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl">
                  Popular Challenges
                </h2>
                <p className="mt-3 text-lg text-zinc-500">
                  Start with these community favorites
                </p>
              </div>
              <Link 
                href="/challenges" 
                className="hidden sm:inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
              >
                View all challenges
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </Reveal>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CHALLENGES.map((challenge, i) => (
              <Reveal key={challenge.slug} delayMs={i * 60}>
                <Link 
                  href={`/challenges/${challenge.slug}`}
                  className="group block rounded-2xl border border-zinc-200/60 bg-white p-8 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
                >
                  <div className="mb-6">
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      challenge.difficulty === 'hard' 
                        ? 'bg-zinc-900 text-white' 
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-2 group-hover:text-zinc-600 transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{challenge.category}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced RAG 2025 Section */}
      <section className="border-t border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-10 lg:p-16">
              <div className="flex items-center gap-4 mb-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white uppercase tracking-wide">
                  New in 2025
                </span>
                <span className="text-sm text-zinc-500">Latest research techniques</span>
              </div>
              
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl mb-4">
                Advanced RAG Architectures
              </h2>
              <p className="text-lg text-zinc-500 mb-12 max-w-3xl">
                Master cutting-edge techniques from the latest research papers including 
                MiA-RAG, QuCo-RAG, HiFi-RAG, and more.
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {ADVANCED_2025.map((tech, i) => (
                  <Reveal key={tech.title} delayMs={i * 60}>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:shadow-lg">
                      <h3 className="text-base font-semibold text-zinc-900 mb-2">{tech.title}</h3>
                      <p className="text-sm text-zinc-400 mb-3">{tech.subtitle}</p>
                      <p className="text-sm text-zinc-500 leading-relaxed">{tech.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-12 flex items-center gap-6 flex-wrap">
                <Link
                  href="/challenges?search=rag"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-[15px] font-medium text-white transition-all duration-200 hover:bg-zinc-800"
                >
                  Explore Advanced Challenges
                </Link>
                <Link
                  href="/playbooks"
                  className="text-[15px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Read Playbooks →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="border-t border-zinc-100 bg-zinc-50/30">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl">
                Your Learning Journey
              </h2>
              <p className="mt-4 text-lg text-zinc-500 max-w-xl mx-auto">
                Progress through carefully designed stages from fundamentals to production
              </p>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {LEARNING_PATH.map((stage, i) => (
                <div key={stage.name} className="flex items-center">
                  <div className="rounded-full border border-zinc-200 bg-white px-6 py-3 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{stage.name}</p>
                        <p className="text-xs text-zinc-400">{stage.count} challenges</p>
                      </div>
                    </div>
                  </div>
                  {i < LEARNING_PATH.length - 1 && (
                    <div className="hidden sm:flex items-center justify-center mx-4">
                      <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delayMs={200}>
            <div className="text-center mt-12">
              <Link
                href="/learn"
                className="text-[15px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                View full curriculum →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* RAG Pipeline Section */}
      <section className="border-t border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          <Reveal>
            <div className="mb-12 max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl">
                A production RAG system,
                <span className="text-zinc-400"> step by step.</span>
              </h2>
              <p className="mt-4 text-lg text-zinc-500">
                Scroll through the pipeline to understand how each component works together.
              </p>
            </div>
          </Reveal>
          <RAGScrollStory />
        </div>
      </section>

      {/* Resources Grid */}
      <section className="border-t border-zinc-100 bg-zinc-50/50">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          <Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              <Link 
                href="/playbooks" 
                className="group rounded-2xl border border-zinc-200/60 bg-white p-8 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2 text-lg">Production Playbooks</h3>
                <p className="text-[15px] text-zinc-500">Decision matrices, troubleshooting guides, and best practices</p>
              </Link>

              <Link 
                href="/compare/vector-dbs" 
                className="group rounded-2xl border border-zinc-200/60 bg-white p-8 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2 text-lg">Tool Comparisons</h3>
                <p className="text-[15px] text-zinc-500">Vector databases, embedding models, and framework comparisons</p>
              </Link>

              <Link 
                href="/learn" 
                className="group rounded-2xl border border-zinc-200/60 bg-white p-8 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
              >
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-2 text-lg">Structured Curriculum</h3>
                <p className="text-[15px] text-zinc-500">15 stages from foundations to advanced production patterns</p>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-8 py-24 lg:px-16 lg:py-32">
          <Reveal>
            <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center lg:p-20 shadow-sm">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 lg:text-4xl">
                Ready to build production RAG?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-500">
                Join engineers building reliable, scalable RAG systems with the most comprehensive platform available.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href={user ? "/learn" : "/login"}
                  className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-zinc-900 px-8 text-[15px] font-medium text-white transition-all duration-200 hover:bg-zinc-800"
                >
                  Start Learning Free
                  <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/challenges"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-zinc-300 px-8 text-[15px] font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-50"
                >
                  Browse Challenges
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100">
        <div className="mx-auto max-w-[1400px] px-8 py-16 lg:px-16 lg:py-20">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <span className="font-semibold text-zinc-900">RAG Academy</span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                The complete platform for learning production RAG systems.
              </p>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-semibold text-zinc-900 mb-5">Learn</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link href="/learn" className="hover:text-zinc-900 transition-colors">Curriculum</Link></li>
                <li><Link href="/challenges" className="hover:text-zinc-900 transition-colors">Challenges</Link></li>
                <li><Link href="/playbooks" className="hover:text-zinc-900 transition-colors">Playbooks</Link></li>
              </ul>
            </div>

            {/* Compare */}
            <div>
              <h4 className="font-semibold text-zinc-900 mb-5">Compare</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link href="/compare/vector-dbs" className="hover:text-zinc-900 transition-colors">Vector DBs</Link></li>
                <li><Link href="/compare/embeddings" className="hover:text-zinc-900 transition-colors">Embeddings</Link></li>
                <li><Link href="/compare/frameworks" className="hover:text-zinc-900 transition-colors">Frameworks</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-zinc-900 mb-5">Resources</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><Link href="/papers" className="hover:text-zinc-900 transition-colors">Research Papers</Link></li>
                <li><Link href="/analytics" className="hover:text-zinc-900 transition-colors">Your Progress</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
            <p>© 2025 RAG Academy. All rights reserved.</p>
            <p>Built for production RAG engineers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
