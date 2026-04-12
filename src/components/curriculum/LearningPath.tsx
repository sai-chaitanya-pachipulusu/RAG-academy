"use client";

import { useState } from "react";
import Link from "next/link";
import { FAST_TRACK, DEEP_TRACK, type PlanWeek } from "@/lib/curriculum/plan";

type PathType = "fast" | "deep";

interface PathInfo {
  title: string;
  subtitle: string;
  description: string;
  weeks: PlanWeek[];
  color: "emerald" | "indigo";
  totalHours: number;
  features: string[];
  ideal: string[];
}

const PATH_INFO: Record<PathType, PathInfo> = {
  fast: {
    title: "Fast Track",
    subtitle: "4 weeks to production RAG",
    description: "Essential skills to build and ship a production RAG system. Perfect for engineers who need results quickly. Covers the 80/20: the techniques that solve 80% of real-world problems.",
    weeks: FAST_TRACK,
    color: "emerald",
    totalHours: 40,
    features: [
      "Core vector math and similarity",
      "Production chunking strategies",
      "Hybrid retrieval (BM25 + dense)",
      "Reranking and context shaping",
      "Safety and evaluation basics",
    ],
    ideal: [
      "ML engineers adding RAG to products",
      "Backend engineers building AI features",
      "Startups shipping fast",
      "Interview preparation",
    ],
  },
  deep: {
    title: "Deep Track",
    subtitle: "12 weeks to RAG mastery",
    description: "Comprehensive curriculum covering advanced patterns, fine-tuning, multimodal, GraphRAG, and agentic systems. For those who want to become experts and push the boundaries.",
    weeks: DEEP_TRACK,
    color: "indigo",
    totalHours: 120,
    features: [
      "Everything in Fast Track, plus:",
      "Advanced retrieval patterns (RAPTOR, parent-child)",
      "Agentic RAG (Self-RAG, CRAG, ReAct)",
      "GraphRAG and knowledge graphs",
      "Fine-tuning embeddings and rerankers",
      "Multimodal RAG (images, tables, PDFs)",
      "Production optimization and scaling",
      "Capstone projects with live data",
    ],
    ideal: [
      "Senior ML engineers specializing in RAG",
      "AI architects designing systems",
      "Researchers exploring advanced patterns",
      "Career transition to AI engineering",
    ],
  },
};

function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div 
        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-200-all duration-500 cursor-pointer"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function WeekCard({ 
  week, 
  index, 
  color, 
  isOpen,
  onToggle 
}: { 
  week: PlanWeek; 
  index: number; 
  color: "emerald" | "indigo";
  isOpen: boolean;
  onToggle: () => void;
}) {
  const colorClasses = {
    emerald: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      accent: "border-l-emerald-500",
      hover: "hover:border-emerald-200",
      ship: "bg-emerald-50 border-emerald-100",
      shipText: "text-emerald-700",
    },
    indigo: {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      accent: "border-l-indigo-500",
      hover: "hover:border-indigo-200",
      ship: "bg-indigo-50 border-indigo-100",
      shipText: "text-indigo-700",
    },
  }[color];

  const totalItems = week.learn.length + week.labs.length + week.challenges.length;
  const estimatedHours = Math.ceil(totalItems * 0.5 + 2); // Rough estimate

  return (
    <div 
      className={`rounded-xl border transition-all duration-200-all duration-200 ${colorClasses.hover} ${
        isOpen ? `border-l-4 ${colorClasses.accent} bg-white shadow-md` : "border-gray-200 bg-white"
      }`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${colorClasses.badge}`}>
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{week.title}</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                ~{estimatedHours}h
              </span>
            </div>
            <p className="text-sm text-gray-500">{week.week}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs text-gray-400 sm:block">
            <span>{week.challenges.length} challenges</span>
          </div>
          <svg 
            className={`h-5 w-5 text-gray-400 transition-all duration-200-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="space-y-5 border-t border-gray-100 p-4 pt-4">
          {/* Outcome */}
          <div className="rounded-lg bg-gray-50 p-3">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Learning Outcome</span>
            <p className="mt-1 text-sm text-gray-700">{week.outcome}</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Learn */}
            {week.learn.length > 0 && (
              <div>
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <span>📚</span> Learn
                </span>
                <ul className="mt-2 space-y-1">
                  {week.learn.map((item, i) => (
                    <li key={i}>
                      <Link 
                        href={item.href}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Labs */}
            {week.labs.length > 0 && (
              <div>
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <span>🔬</span> Labs
                </span>
                <ul className="mt-2 space-y-1">
                  {week.labs.map((item, i) => (
                    <li key={i}>
                      <Link 
                        href={item.href}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Challenges */}
            {week.challenges.length > 0 && (
              <div>
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <span>💻</span> Challenges
                </span>
                <ul className="mt-2 space-y-1">
                  {week.challenges.map((item, i) => (
                    <li key={i}>
                      <Link 
                        href={item.href}
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Ship */}
          <div className={`rounded-lg border p-3 ${colorClasses.ship}`}>
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              <span>🚀</span> You&apos;ll Ship
            </span>
            <p className={`mt-1 text-sm font-medium ${colorClasses.shipText}`}>{week.ship}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function LearningPath() {
  const [selectedPath, setSelectedPath] = useState<PathType>("fast");
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({ 0: true });
  const path = PATH_INFO[selectedPath];

  const toggleWeek = (index: number) => {
    setOpenWeeks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const expandAll = () => {
    const allOpen: Record<number, boolean> = {};
    path.weeks.forEach((_, i) => allOpen[i] = true);
    setOpenWeeks(allOpen);
  };

  const collapseAll = () => {
    setOpenWeeks({});
  };

  return (
    <div className="space-y-8">
      {/* Path Selector Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(["fast", "deep"] as PathType[]).map((pathType) => {
          const info = PATH_INFO[pathType];
          const isSelected = selectedPath === pathType;
          
          return (
            <button
              key={pathType}
              onClick={() => {
                setSelectedPath(pathType);
                setOpenWeeks({ 0: true });
              }}
              className={`rounded-xl border-2 p-5 text-left transition-all duration-200-all duration-200 ${
                isSelected
                  ? pathType === "fast" 
                    ? "border-emerald-500 bg-emerald-50/50" 
                    : "border-indigo-500 bg-indigo-50/50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{pathType === "fast" ? "⚡" : "🎓"}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{info.title}</h3>
                  <p className="text-sm text-gray-500">{info.subtitle}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>{info.weeks.length} weeks</span>
                    <span>•</span>
                    <span>~{info.totalHours} hours</span>
                    <span>•</span>
                    <span>{info.weeks.reduce((sum, w) => sum + w.challenges.length, 0)} challenges</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Path Details */}
      <div className={`rounded-xl border-2 p-6 ${
        selectedPath === "fast" 
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white" 
          : "border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white"
      }`}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{path.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{path.description}</p>
            
            <div className="mt-4">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Ideal for</span>
              <ul className="mt-2 space-y-1">
                {path.ideal.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={selectedPath === "fast" ? "text-emerald-500" : "text-indigo-500"}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Features */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">What you&apos;ll learn</span>
            <ul className="mt-2 space-y-1">
              {path.features.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className={selectedPath === "fast" ? "text-emerald-500" : "text-indigo-500"}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Curriculum</h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Week Cards */}
      <div className="space-y-3">
        {path.weeks.map((week, index) => (
          <WeekCard 
            key={`${selectedPath}-${index}`}
            week={week} 
            index={index} 
            color={path.color}
            isOpen={openWeeks[index] || false}
            onToggle={() => toggleWeek(index)}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 rounded-xl bg-gray-50 p-6 text-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Ready to start?</h3>
          <p className="text-sm text-gray-600">Begin with the first challenge and build your way up</p>
        </div>
        <Link
          href="/challenges/dot-product"
          className={`rounded-xl px-8 py-3 font-semibold text-white transition-all duration-200-all duration-200 hover:scale-105 ${
            selectedPath === "fast" 
              ? "bg-emerald-600 hover:bg-emerald-700" 
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Start First Challenge →
        </Link>
      </div>
    </div>
  );
}
