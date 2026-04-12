"use client";

import { useState, useMemo } from "react";
import { useLocalProgress } from "@/components/providers/LocalProgressProvider";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

// Quick quiz questions covering core RAG concepts - 35 questions across all categories
const QUIZ_QUESTIONS: QuizQuestion[] = [
  // === CHUNKING (5 questions) ===
  {
    id: "chunk-size",
    question: "What's the ideal chunk size for most RAG applications?",
    options: ["100 tokens", "256-512 tokens", "1024+ tokens", "Entire documents"],
    correctIndex: 1,
    explanation: "256-512 tokens typically balance context and precision. Too small loses context, too large adds noise.",
    category: "Chunking",
  },
  {
    id: "semantic-chunking",
    question: "What is semantic chunking?",
    options: [
      "Splitting by fixed character count",
      "Splitting based on meaning/topic boundaries",
      "Splitting by sentences only",
      "Splitting by file type",
    ],
    correctIndex: 1,
    explanation: "Semantic chunking splits documents at natural topic boundaries using embeddings to detect meaning shifts.",
    category: "Chunking",
  },
  {
    id: "chunk-overlap",
    question: "Why use overlapping chunks?",
    options: [
      "To increase storage costs",
      "To preserve context at chunk boundaries",
      "To speed up retrieval",
      "To reduce embedding dimensions",
    ],
    correctIndex: 1,
    explanation: "Overlap ensures that information at chunk boundaries isn't lost, improving retrieval for queries spanning chunks.",
    category: "Chunking",
  },
  {
    id: "parent-document",
    question: "What is the parent document retrieval strategy?",
    options: [
      "Only retrieve the largest documents",
      "Retrieve small chunks but return their parent context",
      "Skip child documents entirely",
      "Merge all chunks into one",
    ],
    correctIndex: 1,
    explanation: "Small chunks improve retrieval precision, then parent context is returned to give the LLM more complete information.",
    category: "Chunking",
  },
  {
    id: "late-chunking",
    question: "What's the key idea behind late chunking?",
    options: [
      "Chunk after retrieval instead of before",
      "Embed full document first, then chunk with context-aware embeddings",
      "Chunk only when the user requests",
      "Use larger chunks for late queries",
    ],
    correctIndex: 1,
    explanation: "Late chunking embeds the full document, then creates chunks that retain the full document's contextual understanding.",
    category: "Chunking",
  },

  // === RETRIEVAL (7 questions) ===
  {
    id: "top-k",
    question: "What does increasing top-k in retrieval do?",
    options: [
      "Improves precision",
      "Improves recall but may reduce precision",
      "Speeds up retrieval",
      "Reduces context window usage",
    ],
    correctIndex: 1,
    explanation: "Higher top-k retrieves more documents (better recall) but may include less relevant ones (lower precision).",
    category: "Retrieval",
  },
  {
    id: "hybrid-search",
    question: "What is hybrid search in RAG?",
    options: [
      "Using multiple LLMs",
      "Combining dense (vector) and sparse (keyword) retrieval",
      "Using multiple vector databases",
      "Combining different chunk sizes",
    ],
    correctIndex: 1,
    explanation: "Hybrid search combines dense embeddings for semantic similarity with sparse methods (BM25) for exact keyword matching.",
    category: "Retrieval",
  },
  {
    id: "colbert",
    question: "How does ColBERT differ from standard bi-encoder retrieval?",
    options: [
      "It uses larger models",
      "It computes token-level similarity instead of single embedding",
      "It's faster",
      "It doesn't use embeddings",
    ],
    correctIndex: 1,
    explanation: "ColBERT computes late interaction between query and document token embeddings for more nuanced matching.",
    category: "Retrieval",
  },
  {
    id: "bm25",
    question: "What type of retrieval is BM25?",
    options: [
      "Dense retrieval using neural embeddings",
      "Sparse retrieval using term frequency statistics",
      "Graph-based retrieval",
      "Image-based retrieval",
    ],
    correctIndex: 1,
    explanation: "BM25 is a sparse retrieval method that scores documents based on term frequency, inverse document frequency, and document length.",
    category: "Retrieval",
  },
  {
    id: "ann-vs-exact",
    question: "Why use Approximate Nearest Neighbor (ANN) instead of exact search?",
    options: [
      "ANN is always more accurate",
      "ANN is much faster at scale with minimal accuracy loss",
      "Exact search doesn't work with embeddings",
      "ANN uses less memory",
    ],
    correctIndex: 1,
    explanation: "ANN algorithms like HNSW trade tiny accuracy loss for orders of magnitude speed improvement at scale.",
    category: "Retrieval",
  },
  {
    id: "metadata-filtering",
    question: "When should you use metadata filtering in retrieval?",
    options: [
      "Never, it reduces recall",
      "When you need to scope results by date, source, or category",
      "Only for small datasets",
      "To improve embedding quality",
    ],
    correctIndex: 1,
    explanation: "Metadata filtering narrows the search space before vector search, useful for multi-tenant apps or time-sensitive queries.",
    category: "Retrieval",
  },
  {
    id: "multi-query",
    question: "What is the multi-query retrieval technique?",
    options: [
      "Run the same query multiple times",
      "Generate multiple query variations to improve recall",
      "Query multiple databases",
      "Ask multiple LLMs the same question",
    ],
    correctIndex: 1,
    explanation: "Multi-query generates several phrasings of the original query, retrieves for each, then merges results for better coverage.",
    category: "Retrieval",
  },

  // === QUERY TRANSFORM (5 questions) ===
  {
    id: "hyde",
    question: "What is HyDE (Hypothetical Document Embeddings)?",
    options: [
      "A vector database",
      "Generate a hypothetical answer, then embed and retrieve",
      "A chunking strategy",
      "A reranking model",
    ],
    correctIndex: 1,
    explanation: "HyDE generates a hypothetical answer to the query, embeds it, and uses that embedding to retrieve relevant docs.",
    category: "Query Transform",
  },
  {
    id: "query-expansion",
    question: "What is query expansion?",
    options: [
      "Making the query longer",
      "Adding synonyms or related terms to improve retrieval",
      "Splitting the query into parts",
      "Translating the query to another language",
    ],
    correctIndex: 1,
    explanation: "Query expansion enriches the original query with related terms to capture documents using different vocabulary.",
    category: "Query Transform",
  },
  {
    id: "step-back-prompting",
    question: "What is step-back prompting in RAG?",
    options: [
      "Asking simpler questions first",
      "Generate a more abstract question to retrieve broader context",
      "Going back to previous queries",
      "Reducing query complexity",
    ],
    correctIndex: 1,
    explanation: "Step-back prompting asks a higher-level question to retrieve foundational context before answering the specific query.",
    category: "Query Transform",
  },
  {
    id: "query-decomposition",
    question: "When should you use query decomposition?",
    options: [
      "For simple factual questions",
      "For complex multi-part questions requiring multiple retrievals",
      "To reduce latency",
      "When the database is small",
    ],
    correctIndex: 1,
    explanation: "Complex questions like 'Compare X and Y' should be split into sub-queries for targeted retrieval of each component.",
    category: "Query Transform",
  },
  {
    id: "conversation-condense",
    question: "What is conversation condensing in RAG chatbots?",
    options: [
      "Shortening responses",
      "Rewriting follow-up queries to be standalone",
      "Compressing chat history",
      "Removing old messages",
    ],
    correctIndex: 1,
    explanation: "Follow-up queries like 'What about the second one?' are rewritten to include context: 'What about [specific item]?'",
    category: "Query Transform",
  },

  // === POST-RETRIEVAL (5 questions) ===
  {
    id: "reranking",
    question: "Why use reranking after initial retrieval?",
    options: [
      "To speed up retrieval",
      "To reduce costs",
      "Cross-encoders are more accurate but expensive for initial search",
      "To increase chunk size",
    ],
    correctIndex: 2,
    explanation: "Cross-encoders jointly encode query-document pairs for higher accuracy but are too slow for initial search on large corpora.",
    category: "Post-Retrieval",
  },
  {
    id: "context-compression",
    question: "What is context compression in RAG?",
    options: [
      "Reducing embedding dimensions",
      "Extracting only relevant sentences from retrieved documents",
      "Compressing the vector database",
      "Using smaller LLMs",
    ],
    correctIndex: 1,
    explanation: "Context compression removes irrelevant parts of retrieved documents to fit more useful information in the context window.",
    category: "Post-Retrieval",
  },
  {
    id: "diversity-reranking",
    question: "Why include diversity in reranking?",
    options: [
      "To make responses more creative",
      "To avoid redundant information from similar documents",
      "To increase retrieval speed",
      "To improve embedding quality",
    ],
    correctIndex: 1,
    explanation: "Diversity reranking (like MMR) balances relevance with novelty, ensuring retrieved docs cover different aspects.",
    category: "Post-Retrieval",
  },
  {
    id: "relevance-threshold",
    question: "What's the purpose of a relevance score threshold?",
    options: [
      "To speed up queries",
      "To filter out low-quality retrievals before generation",
      "To limit database size",
      "To improve embeddings",
    ],
    correctIndex: 1,
    explanation: "Setting a minimum similarity threshold prevents the LLM from being misled by irrelevant but retrieved documents.",
    category: "Post-Retrieval",
  },
  {
    id: "lost-middle",
    question: "What is the 'lost in the middle' problem?",
    options: [
      "LLMs losing context halfway through generation",
      "LLMs paying less attention to middle documents in context",
      "Embeddings losing precision",
      "Chunks being too long",
    ],
    correctIndex: 1,
    explanation: "Research shows LLMs attend more to documents at the start and end of context, missing important info in the middle.",
    category: "Post-Retrieval",
  },

  // === EMBEDDINGS (5 questions) ===
  {
    id: "embedding-dim",
    question: "What's the main tradeoff with higher embedding dimensions?",
    options: [
      "Better accuracy but higher storage/compute costs",
      "Faster retrieval",
      "Smaller index size",
      "Better compression",
    ],
    correctIndex: 0,
    explanation: "Higher dimensions capture more semantic nuance but increase storage, memory, and compute requirements.",
    category: "Embeddings",
  },
  {
    id: "matryoshka",
    question: "What's special about Matryoshka embeddings?",
    options: [
      "They're always 1536 dimensions",
      "You can truncate them to smaller dims while preserving quality",
      "They're faster to compute",
      "They don't require normalization",
    ],
    correctIndex: 1,
    explanation: "Matryoshka embeddings are trained to be truncatable - you can use fewer dimensions with graceful quality degradation.",
    category: "Embeddings",
  },
  {
    id: "embedding-normalize",
    question: "Why normalize embeddings before cosine similarity?",
    options: [
      "To make them smaller",
      "Cosine similarity requires unit vectors for correct computation",
      "To improve accuracy",
      "Normalization is optional",
    ],
    correctIndex: 1,
    explanation: "Cosine similarity measures the angle between vectors; normalizing to unit length ensures this works correctly.",
    category: "Embeddings",
  },
  {
    id: "embedding-model-choice",
    question: "What's the most important factor in choosing an embedding model?",
    options: [
      "Always pick the highest dimensions",
      "Match the model to your domain and use case",
      "Use the cheapest option",
      "Pick the newest model",
    ],
    correctIndex: 1,
    explanation: "Domain match matters most - a code-trained model for code search, multilingual model for multi-language, etc.",
    category: "Embeddings",
  },
  {
    id: "bi-encoder-vs-cross",
    question: "Bi-encoder vs cross-encoder: which is faster for retrieval?",
    options: [
      "Cross-encoder is faster",
      "Bi-encoder is faster because embeddings are pre-computed",
      "They're equally fast",
      "Depends on the query length",
    ],
    correctIndex: 1,
    explanation: "Bi-encoders pre-compute document embeddings, while cross-encoders must process each query-doc pair at query time.",
    category: "Embeddings",
  },

  // === GENERATION (4 questions) ===
  {
    id: "context-window",
    question: "What happens when retrieved context exceeds the LLM's context window?",
    options: [
      "The LLM automatically summarizes",
      "Tokens are truncated (lost)",
      "The query is split",
      "Retrieval is rerun with lower k",
    ],
    correctIndex: 1,
    explanation: "Most LLMs truncate input that exceeds their context window, potentially losing important retrieved information.",
    category: "Generation",
  },
  {
    id: "grounding",
    question: "What is 'grounding' in RAG generation?",
    options: [
      "Connecting to the internet",
      "Ensuring responses are based only on retrieved context",
      "Using ground truth labels",
      "Reducing hallucinations via fine-tuning",
    ],
    correctIndex: 1,
    explanation: "Grounding constrains the LLM to answer based on retrieved documents, reducing hallucination risk.",
    category: "Generation",
  },
  {
    id: "citation",
    question: "Why add citations to RAG responses?",
    options: [
      "To increase response length",
      "To enable fact-checking and build trust",
      "To improve retrieval accuracy",
      "To reduce costs",
    ],
    correctIndex: 1,
    explanation: "Citations let users verify claims, increasing trust and making the system more transparent and debuggable.",
    category: "Generation",
  },
  {
    id: "chain-of-thought-rag",
    question: "How does chain-of-thought help RAG?",
    options: [
      "It speeds up generation",
      "It helps the LLM reason through retrieved context step-by-step",
      "It reduces token usage",
      "It improves embeddings",
    ],
    correctIndex: 1,
    explanation: "Chain-of-thought prompting helps the model systematically process retrieved information before answering.",
    category: "Generation",
  },

  // === EVALUATION (4 questions) ===
  {
    id: "recall-at-k",
    question: "What does Recall@K measure in RAG evaluation?",
    options: [
      "Speed of retrieval",
      "Percentage of relevant docs in top K results",
      "User satisfaction",
      "Token efficiency",
    ],
    correctIndex: 1,
    explanation: "Recall@K measures what fraction of relevant documents appear in the top K retrieved results.",
    category: "Evaluation",
  },
  {
    id: "mrr",
    question: "What does MRR (Mean Reciprocal Rank) measure?",
    options: [
      "Average retrieval latency",
      "How high the first relevant document ranks on average",
      "Total number of relevant documents",
      "Query complexity",
    ],
    correctIndex: 1,
    explanation: "MRR averages the reciprocal of the rank at which the first relevant document appears across queries.",
    category: "Evaluation",
  },
  {
    id: "faithfulness",
    question: "What does 'faithfulness' measure in RAG evaluation?",
    options: [
      "User trust in the system",
      "Whether the response is supported by retrieved context",
      "Retrieval speed",
      "Embedding quality",
    ],
    correctIndex: 1,
    explanation: "Faithfulness measures if every claim in the response can be traced back to the retrieved documents.",
    category: "Evaluation",
  },
  {
    id: "ragas",
    question: "What is RAGAS in RAG evaluation?",
    options: [
      "A vector database",
      "A framework for evaluating RAG pipelines with multiple metrics",
      "A chunking strategy",
      "An embedding model",
    ],
    correctIndex: 1,
    explanation: "RAGAS is a popular evaluation framework measuring faithfulness, answer relevancy, context precision, and context recall.",
    category: "Evaluation",
  },

  // === PRODUCTION (5 questions) ===
  {
    id: "semantic-cache",
    question: "How does semantic caching reduce RAG costs?",
    options: [
      "By compressing embeddings",
      "By caching similar queries' results",
      "By reducing chunk size",
      "By using smaller models",
    ],
    correctIndex: 1,
    explanation: "Semantic caching stores responses for queries and returns cached results for semantically similar new queries.",
    category: "Production",
  },
  {
    id: "guardrails",
    question: "What are guardrails in production RAG?",
    options: [
      "Physical server protections",
      "Input/output validation to prevent misuse and errors",
      "Rate limiting only",
      "Backup systems",
    ],
    correctIndex: 1,
    explanation: "Guardrails include PII detection, prompt injection defense, toxicity filtering, and topic boundaries.",
    category: "Production",
  },
  {
    id: "model-routing",
    question: "What is model routing in RAG?",
    options: [
      "Using multiple databases",
      "Selecting different LLMs based on query complexity",
      "Rotating API keys",
      "Load balancing",
    ],
    correctIndex: 1,
    explanation: "Simple queries can use cheaper/faster models while complex queries route to more capable (expensive) models.",
    category: "Production",
  },
  {
    id: "observability",
    question: "Why is observability critical for production RAG?",
    options: [
      "To increase costs",
      "To debug failures, monitor quality, and optimize performance",
      "To add more features",
      "To reduce latency only",
    ],
    correctIndex: 1,
    explanation: "Logging retrievals, generations, and user feedback enables debugging, A/B testing, and continuous improvement.",
    category: "Production",
  },
  {
    id: "streaming",
    question: "Why use streaming responses in RAG applications?",
    options: [
      "To reduce accuracy",
      "To improve perceived latency by showing partial results",
      "To use less memory",
      "Streaming is always slower",
    ],
    correctIndex: 1,
    explanation: "Streaming shows tokens as they're generated, making the wait feel shorter even if total time is the same.",
    category: "Production",
  },
];

interface QuickQuizProps {
  questionCount?: number;
  categories?: string[];
}

export function QuickQuiz({ questionCount = 5, categories }: QuickQuizProps) {
  const { setState } = useLocalProgress();
  
  // Select random questions
  const questions = useMemo(() => {
    let pool = QUIZ_QUESTIONS;
    if (categories?.length) {
      pool = pool.filter((q) => categories.includes(q.category));
    }
    return pool.sort(() => Math.random() - 0.5).slice(0, questionCount);
  }, [questionCount, categories]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return; // Already answered
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
      // Award XP based on score
      const xpEarned = score * 5;
      setState((prev) => ({
        ...prev,
        xp: (prev.xp || 0) + xpEarned,
      }));
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-3xl">
          {percentage >= 80 ? "🎉" : percentage >= 60 ? "👏" : "💪"}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Quiz Complete!
        </h3>
        
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 dark:from-emerald-900/30 dark:to-teal-900/30">
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {score}/{questions.length}
          </span>
          <span className="text-sm text-emerald-700 dark:text-emerald-300">
            ({percentage}%)
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {percentage >= 80
            ? "Excellent! You've mastered these concepts."
            : percentage >= 60
            ? "Good job! Review the missed topics."
            : "Keep practicing! Try the related challenges."}
        </p>

        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          +{score * 5} XP earned
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200-all duration-200 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-[#7C3AED] cursor-pointer"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = "/challenges"}
            className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-sm font-medium text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] dark:bg-[#8B5CF6] dark:text-white dark:hover:bg-[#7C3AED] cursor-pointer"
          >
            Practice Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      {/* Progress bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-[#7C3AED]">
            {currentQuestion.category}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="h-1 bg-gray-100 dark:bg-[#7C3AED]">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-200-all duration-300 cursor-pointer"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-6">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {currentQuestion.question}
        </p>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctIndex;
            const showResult = selectedAnswer !== null;

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`w-full rounded-xl border-2 p-4 text-left text-sm font-medium transition-all duration-200-all duration-200 ${
                  showResult
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : isSelected
                      ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      : "border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-500"
                    : isSelected
                    ? "border-[#8B5CF6] bg-gray-50 dark:border-gray-100 dark:bg-[#7C3AED]"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-gray-700 dark:hover:bg-[#7C3AED]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && isCorrect && (
                    <span className="text-emerald-500">✓</span>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <span className="text-red-500">✗</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-[#7C3AED]">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              💡 {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {selectedAnswer !== null && (
          <button
            onClick={handleNext}
            className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-all duration-200-all duration-200 hover:bg-[#7C3AED] dark:bg-[#8B5CF6] dark:text-white dark:hover:bg-[#7C3AED] cursor-pointer"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}

// Daily quiz widget for dashboard
export function DailyQuizWidget() {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return <QuickQuiz questionCount={3} />;
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧠</span>
        <div>
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
            Daily Quiz
          </h3>
          <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70">
            Test your RAG knowledge in 2 minutes
          </p>
        </div>
      </div>
      <button
        onClick={() => setShowQuiz(true)}
        className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all duration-200-all duration-200 hover:bg-indigo-500 cursor-pointer"
      >
        Start Quiz
      </button>
    </div>
  );
}
