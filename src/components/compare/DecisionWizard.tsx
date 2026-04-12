"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Question = {
  id: string;
  question: string;
  options: Array<{
    label: string;
    value: string;
    nextQuestion?: string;
    recommendation?: string;
  }>;
};

type WizardConfig = {
  title: string;
  description: string;
  questions: Question[];
  recommendations: Record<string, {
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    links: Array<{ label: string; href: string }>;
  }>;
};

interface DecisionWizardProps {
  config: WizardConfig;
}

export function DecisionWizard({ config }: DecisionWizardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(config.questions[0]?.id || "");

  const question = config.questions.find((q) => q.id === currentQuestion);
  const selectedOption = question?.options.find((o) => o.value === answers[currentQuestion]);
  const recommendation = selectedOption?.recommendation
    ? config.recommendations[selectedOption.recommendation]
    : null;

  const handleSelect = (value: string) => {
    const option = question?.options.find((o) => o.value === value);
    setAnswers({ ...answers, [currentQuestion]: value });

    if (option?.nextQuestion) {
      setCurrentQuestion(option.nextQuestion);
    }
  };

  const reset = () => {
    setAnswers({});
    setCurrentQuestion(config.questions[0]?.id || "");
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{config.title}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
        </div>
        {answeredCount > 0 && (
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            Start over
          </button>
        )}
      </div>

      {/* Progress */}
      {answeredCount > 0 && !recommendation && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-[#2563EB]">
            <div
              className="h-1 rounded-full bg-gray-900 transition-all duration-200-all duration-200 dark:bg-gray-100 cursor-pointer"
              style={{
                width: `${(answeredCount / config.questions.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {answeredCount}/{config.questions.length}
          </span>
        </div>
      )}

      {/* Current question */}
      {question && !recommendation && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {question.question}
          </p>
          <div className="mt-3 space-y-2">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-all duration-200-all duration-200 ${
                  answers[currentQuestion] === option.value
                    ? "border-[#3B82F6] bg-[#3B82F6] text-white dark:border-gray-100 dark:bg-[#3B82F6] dark:text-white"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-[#2563EB] dark:hover:border-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2">
            <Badge variant="accent">Recommendation</Badge>
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              {recommendation.title}
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {recommendation.description}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Pros
              </p>
              <ul className="mt-1 space-y-1">
                {recommendation.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-emerald-500">✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Cons / Watch out
              </p>
              <ul className="mt-1 space-y-1">
                {recommendation.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-amber-500">!</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {recommendation.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recommendation.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/30 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Pre-built wizard configs
export const EMBEDDING_WIZARD_CONFIG: WizardConfig = {
  title: "Embedding Model Decision Wizard",
  description: "Answer a few questions to find the right embedding model.",
  questions: [
    {
      id: "privacy",
      question: "Can you send data to external APIs?",
      options: [
        { label: "Yes, cloud APIs are fine", value: "cloud", nextQuestion: "scale" },
        { label: "No, must run locally/on-prem", value: "local", recommendation: "local-model" },
      ],
    },
    {
      id: "scale",
      question: "How many documents will you embed?",
      options: [
        { label: "Small (<100k docs)", value: "small", nextQuestion: "budget" },
        { label: "Large (>100k docs)", value: "large", nextQuestion: "budget" },
      ],
    },
    {
      id: "budget",
      question: "What's your budget priority?",
      options: [
        { label: "Minimize cost", value: "cost", recommendation: "openai-small" },
        { label: "Maximize quality", value: "quality", recommendation: "openai-large" },
        { label: "Balance both", value: "balance", recommendation: "openai-small" },
      ],
    },
  ],
  recommendations: {
    "local-model": {
      title: "BGE-M3 or nomic-embed-text",
      description: "High-quality open-source models you can run locally.",
      pros: ["No API costs", "Full data privacy", "No rate limits"],
      cons: ["Requires GPU for speed", "More ops overhead", "Slightly lower quality than top APIs"],
      links: [
        { label: "Compare: Embeddings", href: "/compare/embeddings" },
        { label: "Challenge: Embedding Basics", href: "/challenges/embed-and-search" },
      ],
    },
    "openai-small": {
      title: "text-embedding-3-small (OpenAI)",
      description: "Best cost/quality ratio for most use cases.",
      pros: ["Very cheap ($0.02/1M tokens)", "Good quality", "Easy to use"],
      cons: ["API dependency", "Data leaves your infra"],
      links: [
        { label: "Compare: Embeddings", href: "/compare/embeddings" },
        { label: "OpenAI Pricing", href: "https://openai.com/pricing" },
      ],
    },
    "openai-large": {
      title: "text-embedding-3-large (OpenAI)",
      description: "Highest quality from OpenAI, 3072 dimensions.",
      pros: ["Best quality from OpenAI", "Matryoshka support (truncatable)", "Good for fine-grained similarity"],
      cons: ["Higher cost", "More storage needed"],
      links: [
        { label: "Compare: Embeddings", href: "/compare/embeddings" },
        { label: "OpenAI Docs", href: "https://platform.openai.com/docs/guides/embeddings" },
      ],
    },
  },
};

export const RERANKING_WIZARD_CONFIG: WizardConfig = {
  title: "Reranking Strategy Wizard",
  description: "Find the right reranking approach for your use case.",
  questions: [
    {
      id: "latency",
      question: "What's your latency budget?",
      options: [
        { label: "< 100ms (very strict)", value: "strict", recommendation: "no-rerank" },
        { label: "100-500ms (typical)", value: "normal", nextQuestion: "volume" },
        { label: "> 500ms (flexible)", value: "flexible", nextQuestion: "quality" },
      ],
    },
    {
      id: "volume",
      question: "What's your query volume?",
      options: [
        { label: "Low (<1k/day)", value: "low", recommendation: "cross-encoder" },
        { label: "Medium (1k-100k/day)", value: "medium", recommendation: "cross-encoder" },
        { label: "High (>100k/day)", value: "high", recommendation: "cascade" },
      ],
    },
    {
      id: "quality",
      question: "How critical is answer quality?",
      options: [
        { label: "Mission-critical (legal, medical)", value: "critical", recommendation: "llm-rerank" },
        { label: "Important but not critical", value: "important", recommendation: "cross-encoder" },
      ],
    },
  ],
  recommendations: {
    "no-rerank": {
      title: "Skip reranking, optimize retrieval",
      description: "At <100ms budget, focus on better first-stage retrieval instead.",
      pros: ["Lowest latency", "Simplest architecture", "No additional cost"],
      cons: ["May have lower precision", "Relies heavily on embedding quality"],
      links: [
        { label: "Compare: Retrieval", href: "/compare/retrieval" },
        { label: "Challenge: Hybrid Search", href: "/challenges/hybrid-search-tuning" },
      ],
    },
    "cross-encoder": {
      title: "Cross-encoder reranking (top-20 → 5)",
      description: "The default choice for most production RAG systems.",
      pros: ["Good quality boost", "Predictable latency (~100-300ms)", "Many model options"],
      cons: ["Adds latency", "Needs GPU for best speed"],
      links: [
        { label: "Compare: Reranking", href: "/compare/reranking" },
        { label: "Challenge: Reranker Score", href: "/challenges/reranker-score-function" },
      ],
    },
    "cascade": {
      title: "Cascade reranking (cheap → expensive)",
      description: "Use a fast model first, expensive model only on top results.",
      pros: ["Balances cost and quality", "Scales to high volume", "Tunable stages"],
      cons: ["More complex", "Requires tuning cutoffs"],
      links: [
        { label: "Compare: Reranking", href: "/compare/reranking" },
        { label: "Challenge: Reranker Cascade", href: "/challenges/reranker-cascade" },
      ],
    },
    "llm-rerank": {
      title: "LLM listwise reranking",
      description: "Use GPT-4 or similar to rank candidates—highest quality, highest cost.",
      pros: ["Best quality for hard queries", "Can explain ranking decisions", "No special model needed"],
      cons: ["Slow (500ms-2s)", "Expensive at scale", "Prompt engineering required"],
      links: [
        { label: "Compare: Reranking", href: "/compare/reranking" },
        { label: "Challenge: LLM Reranker", href: "/challenges/llm-reranker" },
      ],
    },
  },
};
