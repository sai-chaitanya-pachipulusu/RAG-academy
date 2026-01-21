"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  detectProblemCategory, 
  getRecommendations, 
  type SolutionRecommendation,
  type ProblemCategory 
} from "@/lib/advisor/problemSolver";

const EXAMPLE_PROBLEMS = [
  "My RAG system is not finding the right documents",
  "The LLM keeps making things up that aren't in my documents",
  "How do I handle millions of documents efficiently?",
  "My RAG pipeline is too slow, taking 3+ seconds",
  "How do I evaluate if my RAG system is working well?",
  "I'm worried about prompt injection attacks",
  "My costs are too high, spending $50K/month on AI",
  "How should I chunk my documents for best results?",
];

// Category names for display
const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  "retrieval-quality": "Retrieval Quality",
  "hallucination": "Hallucination",
  "performance": "Performance",
  "scale": "Scale",
  "security": "Security",
  "evaluation": "Evaluation",
  "cost": "Cost",
  "chunking": "Chunking",
  "embedding": "Embeddings",
  "query-understanding": "Query Understanding",
  "agentic": "Agentic RAG",
  "multimodal": "Multimodal",
  "general": "General",
};

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-rose-100 text-rose-700",
};

export function RagAdvisor() {
  const [input, setInput] = useState("");
  const [recommendation, setRecommendation] = useState<SolutionRecommendation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [category, setCategory] = useState<ProblemCategory | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const analyze = useCallback((problemText: string) => {
    if (!problemText.trim()) {
      setRecommendation(null);
      setCategory(null);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate a brief delay for UX
    setTimeout(() => {
      const detectedCategory = detectProblemCategory(problemText);
      const rec = getRecommendations(problemText);
      setCategory(detectedCategory);
      setRecommendation(rec);
      setIsAnalyzing(false);
    }, 300);
  }, []);

  // Debounced analysis as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.length > 10) {
        analyze(input);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input, analyze]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze(input);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
    analyze(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-zinc-900">RAG Problem Advisor</h2>
        <p className="mt-2 text-zinc-600">
          Describe your RAG problem and get personalized recommendations
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your RAG problem... e.g., 'My retrieval quality is poor' or 'How do I reduce hallucinations?'"
            className="w-full min-h-[120px] rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 resize-none"
          />
          {input && (
            <button
              type="button"
              onClick={() => {
                setInput("");
                setRecommendation(null);
                setCategory(null);
              }}
              className="absolute right-3 top-3 rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200"
            >
              Clear
            </button>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!input.trim() || isAnalyzing}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3 font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50"
        >
          {isAnalyzing ? "Analyzing..." : "Get Recommendations"}
        </button>
      </form>

      {/* Example Problems */}
      {!recommendation && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Common Problems (click to try)
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROBLEMS.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(example)}
                className="rounded-lg bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 transition-all hover:bg-zinc-100"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {recommendation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Diagnosis Card */}
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {category ? CATEGORY_LABELS[category] : "General"}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[recommendation.difficulty]}`}>
                {recommendation.difficulty}
              </span>
            </div>
            <h3 className="font-bold text-zinc-900">{recommendation.problem}</h3>
            <p className="mt-2 text-sm text-zinc-600">{recommendation.diagnosis}</p>
          </div>

          {/* Quick Tips */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <h4 className="font-semibold text-emerald-800">
              Quick Tips
            </h4>
            <ul className="mt-3 space-y-2">
              {recommendation.quickTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                  <span className="text-emerald-500">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Challenges */}
          <div>
            <h4 className="font-semibold text-zinc-900">
              Recommended Challenges
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {recommendation.challenges.map((challenge, i) => (
                <Link
                  key={i}
                  href={`/challenges/${challenge.slug}`}
                  className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <h5 className="font-semibold text-zinc-900 group-hover:text-zinc-700">
                      {challenge.title}
                    </h5>
                    <span className="text-zinc-400 transition-transform group-hover:translate-x-1">→</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">{challenge.reason}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Related Playbooks */}
          <div>
            <h4 className="font-semibold text-zinc-900">
              Related Playbooks
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {recommendation.playbooks.map((playbook, i) => (
                <Link
                  key={i}
                  href={`/playbooks/${playbook.slug}`}
                  className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100"
                >
                  {playbook.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Ask Another */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setInput("");
                setRecommendation(null);
                setCategory(null);
                inputRef.current?.focus();
              }}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-200"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
