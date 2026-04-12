"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  detectProblemCategory, 
  getRecommendations, 
  type SolutionRecommendation,
  type ProblemCategory 
} from "@/lib/advisor/problemSolver";
import { searchKnowledgeBase, getSuggestedPath, type SearchMatch } from "@/lib/advisor/ragKnowledgeBase";

// Types for conversation
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url: string; type: string }>;
  timestamp: Date;
}

interface AdvisorState {
  messages: Message[];
  isLoading: boolean;
  recommendation: SolutionRecommendation | null;
  category: ProblemCategory | null;
  searchResults: SearchMatch[];
  error: string | null;
}

const EXAMPLE_PROBLEMS = [
  "My RAG system is not finding the right documents",
  "The LLM keeps making things up that aren't in my documents",
  "How do I handle millions of documents efficiently?",
  "My RAG pipeline is too slow, taking 3+ seconds",
  "How do I evaluate if my RAG system is working well?",
  "I'm worried about prompt injection attacks",
  "My costs are too high, spending $50K/month on AI",
  "How should I chunk my documents for best results?",
  "What's the difference between dense and sparse retrieval?",
  "How do I implement HyDE for better query understanding?",
  "What reranker should I use for production?",
  "How do I compare RAG with fine-tuning?",
];

// Category styling - clean professional look without emojis
const CATEGORY_CONFIG: Record<ProblemCategory, { label: string; color: string }> = {
  "retrieval-quality": { label: "Retrieval Quality", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "hallucination": { label: "Hallucination", color: "bg-red-100 text-red-700 border-red-200" },
  "performance": { label: "Performance", color: "bg-amber-100 text-amber-700 border-amber-200" },
  "scale": { label: "Scale", color: "bg-purple-100 text-purple-700 border-purple-200" },
  "security": { label: "Security", color: "bg-rose-100 text-rose-700 border-rose-200" },
  "evaluation": { label: "Evaluation", color: "bg-teal-100 text-teal-700 border-teal-200" },
  "cost": { label: "Cost", color: "bg-green-100 text-green-700 border-green-200" },
  "chunking": { label: "Chunking", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  "embedding": { label: "Embeddings", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  "query-understanding": { label: "Query Understanding", color: "bg-sky-100 text-sky-700 border-sky-200" },
  "agentic": { label: "Agentic RAG", color: "bg-violet-100 text-violet-700 border-violet-200" },
  "multimodal": { label: "Multimodal", color: "bg-pink-100 text-pink-700 border-pink-200" },
  "general": { label: "General", color: "bg-gray-100 text-gray-700 border-gray-200" },
};


const DIFFICULTY_STYLES = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-rose-50 text-rose-700 border-rose-200",
};

export function EnhancedRagAdvisor() {
  const [state, setState] = useState<AdvisorState>({
    messages: [],
    isLoading: false,
    recommendation: null,
    category: null,
    searchResults: [],
    error: null,
  });
  const [input, setInput] = useState("");
  const [showSources, setShowSources] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Analyze input for real-time suggestions
  useEffect(() => {
    if (input.length > 15) {
      const results = searchKnowledgeBase(input, 5);
      setState(s => ({ ...s, searchResults: results }));
    } else {
      setState(s => ({ ...s, searchResults: [] }));
    }
  }, [input]);

  const analyze = useCallback(async (problemText: string) => {
    if (!problemText.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: problemText,
      timestamp: new Date(),
    };

    setState(s => ({
      ...s,
      messages: [...s.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    setInput("");

    // Detect category and get recommendations
    const detectedCategory = detectProblemCategory(problemText);
    const rec = getRecommendations(problemText);
    
    // Search knowledge base for additional context
    const kbResults = searchKnowledgeBase(problemText, 8);
    
    // Build comprehensive response
    const responseContent = buildResponse(rec, kbResults, detectedCategory);
    
    // Collect sources
    const sources = [
      ...kbResults.slice(0, 3).map(r => ({
        title: r.item.title,
        url: r.item.url,
        type: r.item.type,
      })),
      ...rec.playbooks.map(p => ({
        title: p.title,
        url: `/playbooks/${p.slug}`,
        type: "playbook",
      })),
    ];

    // Simulate brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseContent,
      sources,
      timestamp: new Date(),
    };

    setState(s => ({
      ...s,
      messages: [...s.messages, assistantMessage],
      isLoading: false,
      recommendation: rec,
      category: detectedCategory,
      searchResults: [],
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyze(input);
  };

  const handleExampleClick = (example: string) => {
    analyze(example);
  };

  const clearConversation = () => {
    setState({
      messages: [],
      isLoading: false,
      recommendation: null,
      category: null,
      searchResults: [],
      error: null,
    });
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              RAG Problem Advisor
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Describe your RAG problem and get personalized recommendations, challenges, and resources
            </p>
          </div>
          {state.messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              New Conversation
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {state.messages.length === 0 ? (
          <div className="space-y-6">
            {/* Quick Categories */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Browse by Category
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Object.entries(CATEGORY_CONFIG).slice(0, 8).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleExampleClick(`Help me with ${config.label.toLowerCase()} in RAG`)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200-all duration-200 hover:shadow-md ${config.color}`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Example Problems */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                Common Problems (click to explore)
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROBLEMS.slice(0, 8).map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(example)}
                    className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-all duration-200-all duration-200 hover:bg-gray-100 hover:shadow-sm cursor-pointer"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {state.messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                showSources={showSources}
                onToggleSources={() => setShowSources(!showSources)}
              />
            ))}
            {state.isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="animate-pulse flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                Analyzing your problem...
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Real-time Suggestions */}
      {state.searchResults.length > 0 && !state.isLoading && (
        <div className="mb-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2">Related Resources:</p>
          <div className="flex flex-wrap gap-2">
            {state.searchResults.slice(0, 4).map((result, i) => (
              <Link
                key={i}
                href={result.item.url}
                className="rounded-lg bg-white border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-gray-300 hover:shadow-sm cursor-pointer"
              >
                {result.item.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Panel */}
      {state.recommendation && !state.isLoading && (
        <RecommendationPanel 
          recommendation={state.recommendation} 
          category={state.category}
        />
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe your RAG problem... e.g., 'My retrieval quality is poor' or 'How do I reduce hallucinations?'"
            className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-white p-4 pr-24 text-sm outline-none transition-all duration-200-all duration-200 focus:border-[#8B5CF6]400 focus:ring-2 focus:ring-[#8B5CF6]100 resize-none cursor-pointer"
          />
          <div className="absolute right-3 bottom-3 flex gap-2">
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || state.isLoading}
              className="rounded-lg bg-[#8B5CF6] px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] disabled:opacity-50 cursor-pointer"
            >
              {state.isLoading ? "..." : "Ask →"}
            </button>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ 
  message, 
  showSources, 
  onToggleSources 
}: { 
  message: Message; 
  showSources: boolean;
  onToggleSources: () => void;
}) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser 
          ? "bg-[#8B5CF6] text-white" 
          : "bg-gray-50 border border-gray-200 text-gray-700"
      }`}>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={onToggleSources}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
            >
              {showSources ? "▼" : "►"} {message.sources.length} sources
            </button>
            {showSources && (
              <div className="mt-2 space-y-1">
                {message.sources.map((source, i) => (
                  <Link
                    key={i}
                    href={source.url}
                    className="block text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    [{i + 1}] {source.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Recommendation Panel
function RecommendationPanel({ 
  recommendation, 
  category 
}: { 
  recommendation: SolutionRecommendation;
  category: ProblemCategory | null;
}) {
  const config = category ? CATEGORY_CONFIG[category] : CATEGORY_CONFIG.general;
  
  return (
    <div className="mb-4 p-4 bg-gradient-to-br from-[#8B5CF6]-50 to-white rounded-xl border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[recommendation.difficulty]}`}>
          {recommendation.difficulty}
        </span>
      </div>
      
      {/* Challenges */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Challenges</h4>
        <div className="grid grid-cols-2 gap-2">
          {recommendation.challenges.slice(0, 4).map((c, i) => (
            <Link
              key={i}
              href={`/challenges/${c.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-2 hover:border-gray-300 hover:shadow-sm transition-all duration-200-all duration-200 cursor-pointer"
            >
              <div className="text-xs font-medium text-gray-800 group-hover:text-gray-600 cursor-pointer">{c.title}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{c.reason}</div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Playbooks */}
      <div className="flex flex-wrap gap-2">
        {recommendation.playbooks.map((p, i) => (
          <Link
            key={i}
            href={`/playbooks/${p.slug}`}
            className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 cursor-pointer"
          >
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Helper to build response text
function buildResponse(
  rec: SolutionRecommendation, 
  kbResults: SearchMatch[], 
  category: ProblemCategory
): string {
  const lines: string[] = [];
  
  lines.push(`**${rec.problem}**\n`);
  lines.push(rec.diagnosis);
  lines.push("");
  
  if (rec.quickTips.length > 0) {
    lines.push("**Quick Tips:**");
    rec.quickTips.forEach((tip, i) => {
      lines.push(`${i + 1}. ${tip}`);
    });
    lines.push("");
  }
  
  if (rec.challenges.length > 0) {
    lines.push(`**Practice these ${rec.challenges.length} challenges to master this topic.**`);
  }
  
  return lines.join("\n");
}

export default EnhancedRagAdvisor;
