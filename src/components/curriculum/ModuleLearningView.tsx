"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CHALLENGES } from "@/lib/challenges/catalog";
import { CHALLENGE_STAGE_BY_SLUG } from "@/lib/challenges/defs/stageBySlug";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";
import { MODULE_RESOURCES } from "@/lib/curriculum/moduleResources";
import { Reveal } from "@/components/ui/Reveal";
import type { LessonMeta } from "@/lib/lessons/fs";

const MODULES = [
  { id: "foundations", number: 1, name: "Foundations", subtitle: "Embeddings & similarity", stages: ["foundations"] },
  { id: "data-ingestion", number: 2, name: "Data Ingestion", subtitle: "Parsing & cleaning", stages: ["pre-retrieval"] },
  { id: "query-optimization", number: 3, name: "Query Analysis", subtitle: "Rewriting & expansion", stages: ["query-transforms"] },
  { id: "hybrid-retrieval", number: 4, name: "Hybrid Retrieval", subtitle: "Dense + sparse search", stages: ["retrieval"] },
  { id: "advanced-retrieval", number: 5, name: "Advanced Retrieval", subtitle: "RAPTOR, ColBERT, indexes", stages: ["advanced-retrieval"] },
  { id: "post-retrieval", number: 6, name: "Post-Retrieval", subtitle: "Reranking & compression", stages: ["post-retrieval"] },
  { id: "grounding-safety", number: 7, name: "Grounding & Safety", subtitle: "Citations & guardrails", stages: ["grounding-safety"] },
  { id: "agentic-rag", number: 8, name: "Agentic RAG", subtitle: "Tool use & self-correction", stages: ["agentic-rag"] },
  { id: "evaluation", number: 9, name: "Evaluation", subtitle: "RAG Triad metrics", stages: ["evaluation-ops"] },
  { id: "production-ops", number: 10, name: "Production", subtitle: "Caching & scaling", stages: ["production-ops", "capstone-projects", "arena"] },
  { id: "multimodal", number: 11, name: "Multimodal", subtitle: "Images, audio, tables", stages: ["multimodal", "graph-rag"] },
  { id: "fine-tuning", number: 12, name: "Fine-Tuning", subtitle: "LoRA & embeddings", stages: ["fine-tuning"] },
] as const;

interface Props {
  phaseBlocks?: { phase: string; lessons: LessonMeta[] }[];
}

export function ModuleLearningView({ phaseBlocks = [] }: Props) {
  const { state } = useLocalProgress();
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const moduleData = useMemo(() => {
    return MODULES.map((mod) => {
      const stages = mod.stages as readonly string[];
      const challenges = CHALLENGES.filter((c) => stages.includes(CHALLENGE_STAGE_BY_SLUG[c.slug]));
      const completed = challenges.filter((c) => state.challenges[c.slug]?.status === "completed").length;
      return { 
        ...mod, 
        challenges, 
        completed, 
        total: challenges.length, 
        progress: challenges.length > 0 ? Math.round((completed / challenges.length) * 100) : 0 
      };
    });
  }, [state.challenges]);

  const totalCompleted = moduleData.reduce((sum, m) => sum + m.completed, 0);
  const totalChallenges = CHALLENGES.length;
  const overallProgress = Math.round((totalCompleted / totalChallenges) * 100);

  // Find next recommended module
  const nextModule = moduleData.find(m => m.progress < 100);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <Reveal>
        <header className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-gray-900 lg:text-5xl">
              Curriculum
            </h1>
            <p className="text-lg text-gray-500 max-w-xl">
              Twelve modules from embeddings to scalable production.
            </p>
          </div>

          {/* Progress Summary */}
          <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6] text-white">
                <span className="text-lg font-semibold">{overallProgress}%</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{totalCompleted}/{totalChallenges}</p>
                <p className="text-sm text-gray-500">completed</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="h-2.5 w-44 overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full rounded-full bg-gray-900 transition-all duration-200-all duration-700 cursor-pointer"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              {nextModule && (
                <button
                  onClick={() => setExpandedModule(nextModule.id)}
                  className="rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#2563EB] cursor-pointer"
                >
                  Continue: {nextModule.name}
                </button>
              )}
            </div>
          </div>
        </header>
      </Reveal>

      {/* Module List */}
      <div className="space-y-3">
        {moduleData.map((mod, i) => {
          const isExpanded = expandedModule === mod.id;
          const resources = MODULE_RESOURCES[mod.id];
          
          return (
            <Reveal key={mod.id} delayMs={Math.min(i * 30, 300)}>
              <div className="group">
                {/* Module Row */}
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  className={`w-full rounded-2xl border transition-all duration-200-all duration-200 ${
                    isExpanded 
                      ? 'border-gray-300 bg-white shadow-xl shadow-zinc-100' 
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-zinc-100/50'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Module Number */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-sm transition-all duration-200-all duration-200 ${
                      mod.progress === 100
                        ? 'bg-emerald-50 text-emerald-600'
                        : mod.progress > 0
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-gray-50 text-gray-400'
                    }`}>
                      {mod.progress === 100 ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        String(mod.number).padStart(2, '0')
                      )}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-bold text-gray-900">{mod.name}</h3>
                      <p className="text-sm text-gray-500">{mod.subtitle}</p>
                    </div>

                    {/* Progress */}
                    <div className="hidden items-center gap-6 sm:flex">
                      <div className="w-24">
                        <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">Progress</span>
                          <span className={mod.progress === 100 ? 'text-emerald-600' : 'text-gray-900'}>{mod.progress}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-200-all duration-200 ${mod.progress === 100 ? 'bg-emerald-500' : 'bg-gray-900'}`} 
                            style={{ width: `${mod.progress}%` }} 
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-500">
                        {mod.completed}/{mod.total}
                      </span>
                    </div>

                    {/* Expand Icon */}
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200-all duration-200 ${
                      isExpanded 
                        ? 'rotate-180 border-[#3B82F6] bg-[#3B82F6] text-white' 
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                    }`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-1 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                      {/* Challenges */}
                      <div className="lg:col-span-2">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Challenges</h4>
                          <Link href="/challenges" className="text-[10px] font-semibold text-gray-600 hover:text-gray-900 cursor-pointer">
                            View All →
                          </Link>
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2">
                          {mod.challenges.slice(0, 6).map((challenge) => {
                            const status = state.challenges[challenge.slug]?.status;
                            return (
                              <Link
                                key={challenge.slug}
                                href={`/challenges/${challenge.slug}`}
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-all duration-200-all duration-200 hover:border-gray-200 hover:shadow-md cursor-pointer"
                              >
                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                                  status === "completed" 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : "bg-gray-50 text-gray-400"
                                }`}>
                                  {status === "completed" ? (
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                                  )}
                                </div>
                                <span className="truncate text-sm font-medium text-gray-700">
                                  {challenge.title}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Resources</h4>
                        {resources ? (
                          <div className="space-y-2">
                            {resources.videos.slice(0, 2).map((v, i) => (
                              <a
                                key={i}
                                href={v.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-xs font-medium transition-all duration-200-all duration-200 hover:border-gray-200 hover:shadow-sm cursor-pointer"
                              >
                                <span className="text-red-600">▶</span>
                                <span className="truncate text-gray-600">{v.title}</span>
                              </a>
                            ))}
                            {resources.blogs.slice(0, 2).map((b, i) => (
                              <a
                                key={i}
                                href={b.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-xs font-medium transition-all duration-200-all duration-200 hover:border-gray-200 hover:shadow-sm cursor-pointer"
                              >
                                <span className="text-blue-600">◆</span>
                                <span className="truncate text-gray-600">{b.title}</span>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Resources coming soon</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
