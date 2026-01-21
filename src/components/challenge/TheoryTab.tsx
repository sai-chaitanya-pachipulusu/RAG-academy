"use client";

import { useState } from "react";

interface Props {
  challengeSlug: string;
  conceptTitle: string;
  content: TheoryContent;
}

interface TheoryContent {
  overview: string;
  keyFormulas?: Formula[];
  visualExplanation?: string;
  whyItMatters: string;
  commonMistakes?: string[];
  interviewTips?: string[];
}

interface Formula {
  name: string;
  latex: string;
  explanation: string;
}

export function TheoryTab({ challengeSlug, conceptTitle, content }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-900/50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Theory: {conceptTitle}
          </span>
        </div>
        <span
          className={`text-blue-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-blue-200 p-4 dark:border-blue-900/50">
          {/* Overview */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Overview
            </h4>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {content.overview}
            </p>
          </div>

          {/* Key Formulas */}
          {content.keyFormulas && content.keyFormulas.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Key Formulas
              </h4>
              <div className="mt-2 space-y-2">
                {content.keyFormulas.map((formula, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-white p-3 dark:bg-zinc-900"
                  >
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {formula.name}
                    </p>
                    <code className="mt-1 block rounded bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {formula.latex}
                    </code>
                    <p className="mt-1 text-xs text-zinc-500">
                      {formula.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Explanation */}
          {content.visualExplanation && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Visual Intuition
              </h4>
              <div className="mt-2 rounded-lg bg-white p-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {content.visualExplanation}
              </div>
            </div>
          )}

          {/* Why It Matters */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              🎯 Why This Matters
            </h4>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              {content.whyItMatters}
            </p>
          </div>

          {/* Common Mistakes */}
          {content.commonMistakes && content.commonMistakes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                ⚠️ Common Mistakes
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {content.commonMistakes.map((mistake, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-500">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview Tips */}
          {content.interviewTips && content.interviewTips.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                💼 Interview Tips
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                {content.interviewTips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-purple-500">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Theory content database
export const CHALLENGE_THEORY: Record<string, { title: string; content: TheoryContent }> = {
  "dot-product": {
    title: "Dot Product",
    content: {
      overview:
        "The dot product is a fundamental operation that measures the similarity between two vectors. It's the sum of element-wise products.",
      keyFormulas: [
        {
          name: "Dot Product Formula",
          latex: "a · b = Σ(aᵢ × bᵢ) = a₁b₁ + a₂b₂ + ... + aₙbₙ",
          explanation: "Multiply corresponding elements and sum them all",
        },
        {
          name: "Geometric Interpretation",
          latex: "a · b = |a| × |b| × cos(θ)",
          explanation: "The dot product equals the product of magnitudes times the cosine of the angle",
        },
      ],
      visualExplanation:
        "Imagine two arrows. When they point in the same direction, the dot product is large and positive. When perpendicular, it's zero. When opposite, it's negative.",
      whyItMatters:
        "Every embedding similarity computation in RAG systems uses dot product. When you call OpenAI's embedding API and compare vectors, you're computing dot products.",
      commonMistakes: [
        "Forgetting to handle vectors of different lengths",
        "Not normalizing vectors before comparison (use cosine similarity instead)",
        "Integer overflow with large vectors",
      ],
      interviewTips: [
        "Explain the geometric interpretation (projection)",
        "Know when to use dot product vs cosine similarity",
        "Mention SIMD optimizations for production",
      ],
    },
  },
  "cosine-similarity": {
    title: "Cosine Similarity",
    content: {
      overview:
        "Cosine similarity measures the angle between two vectors, not their magnitude. It's the dot product divided by the product of magnitudes.",
      keyFormulas: [
        {
          name: "Cosine Similarity",
          latex: "cos(θ) = (a · b) / (|a| × |b|)",
          explanation: "Normalize by magnitudes to get a value between -1 and 1",
        },
      ],
      whyItMatters:
        "Most vector databases use cosine similarity as the default metric because it's scale-invariant. Two documents with different lengths but similar topics will have high cosine similarity.",
      commonMistakes: [
        "Dividing by zero when a vector has zero magnitude",
        "Confusing cosine similarity with cosine distance (1 - similarity)",
        "Not handling edge cases for zero vectors",
      ],
      interviewTips: [
        "Explain why it's preferred over Euclidean for text embeddings",
        "Know that OpenAI embeddings are already normalized",
        "Mention that for normalized vectors, cosine similarity = dot product",
      ],
    },
  },
  "euclidean-distance": {
    title: "Euclidean Distance",
    content: {
      overview:
        "Euclidean distance measures the straight-line distance between two points in n-dimensional space. It's the L2 norm of the difference vector.",
      keyFormulas: [
        {
          name: "Euclidean Distance",
          latex: "d(a, b) = √(Σ(aᵢ - bᵢ)²)",
          explanation: "Square root of sum of squared differences",
        },
      ],
      visualExplanation:
        "Think of the Pythagorean theorem extended to n dimensions. The classic 3-4-5 right triangle: distance from (0,0) to (3,4) is 5.",
      whyItMatters:
        "While less common than cosine for text, Euclidean distance is essential for clustering (K-means), image embeddings, and any application where absolute position matters.",
      commonMistakes: [
        "Confusing distance with similarity (lower distance = more similar)",
        "Not normalizing vectors first (magnitudes affect distance)",
        "Forgetting sqrt at the end",
      ],
      interviewTips: [
        "Know how it relates to L2 norm: ||a - b||",
        "Explain when to use Euclidean vs Cosine",
        "Mention it's used in K-means clustering",
      ],
    },
  },
  "dense-vector-class": {
    title: "Dense Vector Class",
    content: {
      overview:
        "A DenseVector encapsulates a vector with its metadata and operations. Caching magnitude improves repeated similarity computations.",
      keyFormulas: [
        {
          name: "Magnitude (L2 Norm)",
          latex: "|v| = √(Σvᵢ²)",
          explanation: "Length of the vector in n-dimensional space",
        },
      ],
      visualExplanation:
        "Think of wrapping a raw list in a class that 'remembers' its length. Once computed, the magnitude is cached, so asking twice is instant.",
      whyItMatters:
        "Production vector databases like Weaviate and Qdrant use similar abstractions. Caching magnitude is a micro-optimization that adds up with millions of comparisons.",
      commonMistakes: [
        "Recomputing magnitude every time",
        "Not invalidating cache when vector changes",
        "Mixing up self.dim with len(self.values)",
      ],
      interviewTips: [
        "Explain the caching pattern",
        "Know that pre-normalization avoids magnitude computation",
        "Mention how Pinecone stores pre-normalized vectors",
      ],
    },
  },
  "naive-flat-index": {
    title: "Flat Index (Brute Force Search)",
    content: {
      overview:
        "A flat index stores all vectors and computes similarity with every single one during search. It's the simplest but slowest approach.",
      keyFormulas: [
        {
          name: "Time Complexity",
          latex: "O(n × d)",
          explanation: "n = number of vectors, d = dimensionality",
        },
      ],
      visualExplanation:
        "Imagine searching a library by reading every book title. Simple but slow. The flat index is the baseline that all other indexes improve upon.",
      whyItMatters:
        "Understanding flat index is essential because: 1) It gives you the ground truth for evaluation, 2) It's still used for small datasets (<10k vectors), 3) All ANN algorithms compare against it.",
      commonMistakes: [
        "Using flat index for large datasets (>100k vectors)",
        "Not pre-computing vector magnitudes for cosine similarity",
        "Returning indices instead of the actual vectors",
      ],
      interviewTips: [
        "Know when flat index is actually optimal (small datasets)",
        "Explain the memory vs speed tradeoff",
        "Mention that FAISS IndexFlatL2 is the production version",
      ],
    },
  },
  "ivf-flat-index": {
    title: "IVF (Inverted File Index)",
    content: {
      overview:
        "IVF partitions vectors into clusters using k-means. During search, we only check the nearest clusters instead of all vectors.",
      keyFormulas: [
        {
          name: "Search Complexity",
          latex: "O(nprobe × n/nlist × d)",
          explanation: "nprobe = clusters to search, nlist = total clusters",
        },
      ],
      visualExplanation:
        "Imagine dividing a city into neighborhoods. Instead of searching every house, you first identify the relevant neighborhoods, then search within them.",
      whyItMatters:
        "IVF is the foundation of most production vector databases. Pinecone, Weaviate, and FAISS all use IVF variants. Understanding it unlocks understanding of production systems.",
      commonMistakes: [
        "Setting nprobe too low (missing relevant results)",
        "Setting nlist too high for small datasets",
        "Forgetting to train centroids before adding vectors",
      ],
      interviewTips: [
        "Explain the recall vs speed tradeoff with nprobe",
        "Know typical values (nlist = sqrt(n), nprobe = 1-10%)",
        "Mention IVF-PQ for memory-constrained scenarios",
      ],
    },
  },
  "rag-pipeline-chunker": {
    title: "Text Chunking",
    content: {
      overview:
        "Chunking splits documents into smaller pieces that fit in the LLM context window. Overlap prevents losing context at boundaries.",
      keyFormulas: [
        {
          name: "Number of Chunks",
          latex: "n_chunks ≈ len(doc) / (chunk_size - overlap)",
          explanation: "More overlap = more chunks = more storage but better context",
        },
      ],
      visualExplanation:
        "Think of a sliding window moving across text. With overlap, windows share some content, like a Venn diagram ensuring no sentence is orphaned at a boundary.",
      whyItMatters:
        "Chunking strategy directly affects RAG quality. Too small and you lose context. Too large and you waste tokens. LangChain's RecursiveCharacterTextSplitter is just a fancy chunker.",
      commonMistakes: [
        "Setting overlap = chunk_size (infinite loop!)",
        "Ignoring sentence/paragraph boundaries",
        "Not tracking chunk position for citations",
      ],
      interviewTips: [
        "Explain semantic vs fixed-size chunking",
        "Know typical sizes: 200-500 chars for embeddings",
        "Mention recursive splitting by separators",
      ],
    },
  },
  "rag-pipeline-embedder": {
    title: "Text Embedding",
    content: {
      overview:
        "An embedder converts text to dense vectors. In production, this calls OpenAI or a local model. Our mock uses bag-of-words.",
      keyFormulas: [
        {
          name: "Embedding Dimension",
          latex: "dim ∈ {384, 768, 1536, 3072}",
          explanation: "Common dimensions for different models",
        },
      ],
      visualExplanation:
        "Each word activates certain 'neurons' in the vector. Similar texts light up similar patterns, making their vectors point in similar directions.",
      whyItMatters:
        "The embedder is the heart of semantic search. OpenAI's text-embedding-3-small costs ~$0.02/1M tokens. Understanding how it works helps you optimize RAG systems.",
      commonMistakes: [
        "Not batching embedding calls (API latency)",
        "Mixing embeddings from different models",
        "Forgetting to normalize for cosine similarity",
      ],
      interviewTips: [
        "Know popular models: OpenAI, Cohere, BGE, E5",
        "Explain contrastive learning (how embeddings are trained)",
        "Mention dimension tradeoffs: 1536 vs 384",
      ],
    },
  },
  "reranker-score-function": {
    title: "Cross-Encoder Reranking",
    content: {
      overview:
        "A cross-encoder takes (query, document) pairs and outputs a relevance score. Unlike bi-encoders, it sees both texts together.",
      keyFormulas: [
        {
          name: "Relevance Score",
          latex: "score = CrossEncoder(query ⊕ document)",
          explanation: "The model sees concatenated input and outputs a single score",
        },
      ],
      visualExplanation:
        "Imagine a judge who reads both the question and the answer before scoring. Slower but much more accurate than comparing pre-computed embeddings.",
      whyItMatters:
        "Two-stage retrieval (embed + rerank) is standard in production RAG. Retrieve 100 candidates fast, then rerank to top 5. Cohere Rerank and MS Marco models are popular.",
      commonMistakes: [
        "Reranking too many candidates (slow)",
        "Not reranking at all (poor precision)",
        "Using bi-encoder scores instead of cross-encoder",
      ],
      interviewTips: [
        "Explain bi-encoder vs cross-encoder tradeoff",
        "Know that cross-encoders are 10-100x slower but more accurate",
        "Mention Cohere Rerank, MS MARCO MiniLM",
      ],
    },
  },
  "evaluator-recall-at-k": {
    title: "Recall@K",
    content: {
      overview:
        "Recall@K measures what fraction of relevant items appear in the top K results. It answers: 'Did we find the relevant documents?'",
      keyFormulas: [
        {
          name: "Recall@K Formula",
          latex: "Recall@K = |relevant ∩ retrieved@K| / |relevant|",
          explanation: "Relevant items found in top K divided by total relevant items",
        },
      ],
      whyItMatters:
        "Recall@K is THE metric for RAG retrieval. If your retriever misses relevant documents, your LLM has no chance of generating a correct answer. Every production RAG system tracks Recall@5 or Recall@10.",
      commonMistakes: [
        "Confusing with Precision@K (which penalizes irrelevant results)",
        "Not handling edge case where there are fewer than K relevant items",
        "Using K that's too small for evaluation",
      ],
      interviewTips: [
        "Explain the recall vs precision tradeoff",
        "Know that RAG systems prioritize recall over precision",
        "Mention that reranking improves precision after high-recall retrieval",
      ],
    },
  },
  "evaluator-mrr": {
    title: "Mean Reciprocal Rank (MRR)",
    content: {
      overview:
        "MRR measures how quickly you find the first relevant result. Score is 1/rank of the first relevant item.",
      keyFormulas: [
        {
          name: "MRR Formula",
          latex: "MRR = 1/rank_first_relevant",
          explanation: "Rank 1 = 1.0, Rank 2 = 0.5, Rank 3 = 0.33...",
        },
      ],
      visualExplanation:
        "If the answer is on page 1 of Google, you're happy (score ~1). Page 2? Annoyed (score ~0.1). MRR captures this user experience.",
      whyItMatters:
        "MRR is critical for single-answer queries like Q&A systems. If users only look at the top result, MRR tells you how often that top result is correct.",
      commonMistakes: [
        "Averaging MRR wrong across multiple queries",
        "Forgetting to return 0 when no relevant found",
        "Confusing with MAP (Mean Average Precision)",
      ],
      interviewTips: [
        "Explain when MRR vs Recall@K is appropriate",
        "Know that search engines optimize for MRR@1",
        "Mention connection to user click behavior",
      ],
    },
  },
  "evaluator-ndcg": {
    title: "Normalized Discounted Cumulative Gain (nDCG)",
    content: {
      overview:
        "nDCG measures ranking quality when you have graded relevance (not just binary). It rewards putting highly relevant items at the top.",
      keyFormulas: [
        {
          name: "DCG Formula",
          latex: "DCG = Σ(relᵢ / log₂(i+1))",
          explanation: "Discount by log of position - top results matter more",
        },
        {
          name: "nDCG Formula",
          latex: "nDCG = DCG / IDCG",
          explanation: "Normalize by ideal DCG (best possible ordering)",
        },
      ],
      visualExplanation:
        "Imagine Google search results. A perfect answer at position 1 is worth more than at position 10. nDCG captures this positional importance.",
      whyItMatters:
        "nDCG is the gold standard for search engine evaluation. Google, Bing, and academic IR research all use nDCG. It handles graded relevance (3 stars vs 1 star).",
      commonMistakes: [
        "Using log base 10 instead of log base 2",
        "Forgetting +1 in log denominator (log2(1) = 0!)",
        "Not computing IDCG correctly (sort descending first)",
      ],
      interviewTips: [
        "Explain why log discount makes sense (position decay)",
        "Know that nDCG = 1.0 means perfect ranking",
        "Mention that it's differentiable (used in learning-to-rank)",
      ],
    },
  },
};
