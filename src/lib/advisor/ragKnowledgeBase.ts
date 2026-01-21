/**
 * RAG Knowledge Base
 * Comprehensive knowledge base for the RAG Problem Advisor
 * Indexes all content from the platform for intelligent querying
 */

import { getAllChallenges } from "@/lib/challenges/catalog";

// Types
export interface KnowledgeItem {
  id: string;
  type: "challenge" | "playbook" | "concept" | "technique" | "tool";
  title: string;
  content: string;
  keywords: string[];
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  url: string;
  relatedItems: string[];
}

export interface SearchMatch {
  item: KnowledgeItem;
  score: number;
  matchedTerms: string[];
}

// RAG Concept Definitions - Can be expanded
const RAG_CONCEPTS: KnowledgeItem[] = [
  {
    id: "concept-chunking",
    type: "concept",
    title: "Document Chunking",
    content: `Chunking is the process of breaking documents into smaller pieces for embedding and retrieval. 
    Common strategies include: fixed-size (simple but may cut context), sentence-based (preserves meaning), 
    paragraph-based (thematic units), recursive (tries larger separators first), semantic (AI-detected boundaries), 
    and hierarchical (multi-resolution). The optimal chunk size depends on your use case - typically 200-800 tokens 
    with 10-20% overlap. For structured documents, use section-based chunking. For code, use AST-aware chunking.`,
    keywords: ["chunk", "chunking", "split", "segment", "divide", "token", "overlap", "recursive", "semantic"],
    category: "pre-retrieval",
    difficulty: "beginner",
    url: "/playbooks/chunking-strategies",
    relatedItems: ["fixed-size-chunking-fundamentals", "recursive-chunking", "semantic-chunking"],
  },
  {
    id: "concept-embedding",
    type: "concept",
    title: "Text Embeddings",
    content: `Embeddings are dense vector representations of text that capture semantic meaning. Popular models include 
    OpenAI's text-embedding-3-small (best value), text-embedding-3-large (highest quality), and open-source options like 
    BGE-large, E5-large, and Nomic Embed. Key considerations: dimension size affects storage/speed, model quality 
    varies by domain, and you can fine-tune for specific use cases. Normalize embeddings for cosine similarity.`,
    keywords: ["embedding", "vector", "encode", "model", "semantic", "similarity", "dense", "representation"],
    category: "foundations",
    difficulty: "beginner",
    url: "/playbooks/embedding-model-selection",
    relatedItems: ["cosine-similarity", "dot-product", "embed-and-search"],
  },
  {
    id: "concept-retrieval",
    type: "concept",
    title: "Document Retrieval",
    content: `Retrieval finds relevant documents given a query. Types: Dense retrieval (embeddings + cosine similarity), 
    Sparse retrieval (BM25, keyword matching), Hybrid (combines both via RRF). Advanced patterns: HyDE (hypothetical 
    document embeddings), query expansion (add synonyms), multi-query (break into sub-questions). Always measure 
    Recall@K and Precision@K. Retrieve more (k=20-50), then rerank to top 5-10 for best results.`,
    keywords: ["retrieval", "search", "find", "query", "dense", "sparse", "hybrid", "bm25", "recall", "precision"],
    category: "retrieval",
    difficulty: "intermediate",
    url: "/learn/retrieval",
    relatedItems: ["basic-retrieval", "bm25-from-scratch", "rrf-fusion", "hyde-search"],
  },
  {
    id: "concept-reranking",
    type: "concept",
    title: "Reranking",
    content: `Reranking is a second-stage scoring using a more powerful model (cross-encoder). Initial retrieval is fast 
    but coarse; reranking is slow but precise. Options: Cohere Rerank (best quality, paid), BGE Reranker (open-source, good), 
    Cross-encoder models. Pattern: retrieve k=50 → rerank → keep top 5. Adds ~50-100ms latency but significantly 
    improves relevance. Essential for production RAG systems.`,
    keywords: ["rerank", "cross-encoder", "score", "relevance", "cohere", "bge", "second-stage"],
    category: "post-retrieval",
    difficulty: "intermediate",
    url: "/learn/post-retrieval",
    relatedItems: ["rerank-cascade", "cross-encoder-basics", "reranker-score-function"],
  },
  {
    id: "concept-hallucination",
    type: "concept",
    title: "Hallucination Prevention",
    content: `Hallucination occurs when LLMs generate content not supported by context. Prevention strategies: 
    1) Strong grounding prompts ("Answer ONLY from the context"), 2) Citation requirements, 3) Refusal policy for 
    low-confidence, 4) Temperature reduction (0.0-0.3), 5) Faithfulness evaluation. Check if answer claims are 
    supported by retrieved documents. Use LLM-as-judge for automated evaluation.`,
    keywords: ["hallucination", "grounding", "fabrication", "citation", "faithfulness", "refusal", "temperature"],
    category: "generation",
    difficulty: "intermediate",
    url: "/challenges/refusal-policy",
    relatedItems: ["refusal-policy", "citation-range-validator", "faithfulness-judge"],
  },
  {
    id: "concept-evaluation",
    type: "concept",
    title: "RAG Evaluation",
    content: `Evaluate both retrieval and generation. Retrieval metrics: Recall@K (are relevant docs retrieved?), 
    Precision@K (are retrieved docs relevant?), MRR (ranking quality), NDCG (graded relevance). Generation metrics: 
    Faithfulness (grounded in context?), Answer Relevance (addresses query?), Context Utilization. Create a 
    "golden set" of 25-50 query/answer pairs. Use RAGAS framework for automated evaluation.`,
    keywords: ["evaluation", "metrics", "recall", "precision", "mrr", "ndcg", "ragas", "faithfulness", "benchmark"],
    category: "evaluation",
    difficulty: "intermediate",
    url: "/playbooks/rag-formulas-cheatsheet",
    relatedItems: ["evaluator-recall-at-k", "evaluator-precision-at-k", "evaluator-mrr"],
  },
  {
    id: "concept-security",
    type: "concept",
    title: "RAG Security",
    content: `RAG systems face unique security challenges: Indirect prompt injection (malicious instructions in 
    retrieved documents), PII leakage, ACL bypass, toxic outputs. Defenses: Sanitize retrieved content before 
    inclusion in prompts, separate system/user message boundaries, validate outputs for leaked instructions, 
    enforce ACLs at retrieval time, implement output guardrails. Log everything for forensics.`,
    keywords: ["security", "injection", "pii", "privacy", "acl", "sanitize", "guard", "toxic"],
    category: "security",
    difficulty: "advanced",
    url: "/challenges/prompt-injection-defense",
    relatedItems: ["prompt-injection-defense", "pii-redaction", "acl-filter-enforcement"],
  },
  {
    id: "concept-scaling",
    type: "concept",
    title: "Scaling RAG Systems",
    content: `Scale challenges: Memory (vector storage), Latency (search time), Throughput (queries/sec). 
    Solutions: Quantization (INT8 reduces storage 75%), Approximate indexes (HNSW, IVF-PQ), Sharding (distribute 
    by category/date), Caching (embed cache, retrieval cache, semantic cache). At billion scale, use managed 
    solutions (Pinecone, Qdrant, Weaviate) or self-host with FAISS/Milvus.`,
    keywords: ["scale", "billion", "million", "memory", "quantization", "sharding", "hnsw", "cache"],
    category: "infrastructure",
    difficulty: "advanced",
    url: "/playbooks/multi-tenant-architecture",
    relatedItems: ["hnsw-index", "ivf-pq-index", "embedding-cache", "semantic-caching"],
  },
  {
    id: "concept-cost",
    type: "concept",
    title: "RAG Cost Optimization",
    content: `Cost breakdown: Generation (60-80%), Embedding (5-15%), Storage (5-10%), Retrieval (2-5%). 
    Optimization: Use smaller models for simple queries (GPT-4o-mini vs GPT-4o), cache everything possible, 
    compress context (fewer tokens), use open-source rerankers, quantize vectors. Cost router: route 
    simple queries to cheap models, complex ones to expensive models.`,
    keywords: ["cost", "expensive", "cheap", "budget", "token", "optimize", "cache", "compress"],
    category: "operations",
    difficulty: "intermediate",
    url: "/playbooks/rag-cost-calculator",
    relatedItems: ["cost-aware-router", "embedding-cache", "token-budget-packing"],
  },
  {
    id: "concept-agentic",
    type: "concept",
    title: "Agentic RAG",
    content: `Agentic RAG adds reasoning, tool use, and self-correction. Patterns: Self-RAG (decides when to retrieve), 
    CRAG (Corrective RAG - grades retrieval quality), ReAct (Reasoning + Acting), Multi-step reasoning. 
    Implement planning, tool calling, and error recovery. Use structured outputs for reliable tool calls. 
    Add circuit breakers to prevent infinite loops.`,
    keywords: ["agent", "agentic", "tool", "reasoning", "self-rag", "crag", "react", "multi-step", "planning"],
    category: "advanced",
    difficulty: "advanced",
    url: "/challenges/self-rag",
    relatedItems: ["self-rag", "corrective-rag", "tool-use-basics", "react-implementation"],
  },
];

// Build search index from challenges
function buildChallengeIndex(): KnowledgeItem[] {
  const challenges = getAllChallenges();
  
  return challenges.map(c => ({
    id: c.slug,
    type: "challenge" as const,
    title: c.title,
    content: `${c.description}\n${c.hints?.join(" ") || ""}\n${c.realWorld?.description || ""}`,
    keywords: [
      c.slug.split("-"),
      c.group.toLowerCase().split(/\s+/),
      c.difficulty,
      c.realWorld?.companies || [],
      c.realWorld?.useCases || [],
    ].flat().filter(Boolean),
    category: c.stage,
    difficulty: c.difficulty as "beginner" | "intermediate" | "advanced",
    url: `/challenges/${c.slug}`,
    relatedItems: [...(c.prerequisites || []), ...(c.relatedChallenges || [])],
  }));
}

// Full knowledge base
let KNOWLEDGE_BASE: KnowledgeItem[] | null = null;

export function getKnowledgeBase(): KnowledgeItem[] {
  if (!KNOWLEDGE_BASE) {
    KNOWLEDGE_BASE = [...RAG_CONCEPTS, ...buildChallengeIndex()];
  }
  return KNOWLEDGE_BASE;
}

// Simple BM25-like scoring
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function calculateScore(queryTerms: string[], item: KnowledgeItem): { score: number; matchedTerms: string[] } {
  const contentLower = `${item.title} ${item.content} ${item.keywords.join(" ")}`.toLowerCase();
  let score = 0;
  const matchedTerms: string[] = [];
  
  for (const term of queryTerms) {
    // Title matches worth more
    if (item.title.toLowerCase().includes(term)) {
      score += 10;
      matchedTerms.push(term);
    }
    // Keyword matches
    if (item.keywords.some(k => k.includes(term))) {
      score += 5;
      if (!matchedTerms.includes(term)) matchedTerms.push(term);
    }
    // Content matches
    const matches = (contentLower.match(new RegExp(term, "g")) || []).length;
    if (matches > 0) {
      score += Math.min(matches, 5);
      if (!matchedTerms.includes(term)) matchedTerms.push(term);
    }
  }
  
  return { score, matchedTerms };
}

export function searchKnowledgeBase(query: string, limit: number = 10): SearchMatch[] {
  const kb = getKnowledgeBase();
  const queryTerms = tokenize(query);
  
  if (queryTerms.length === 0) return [];
  
  const results: SearchMatch[] = [];
  
  for (const item of kb) {
    const { score, matchedTerms } = calculateScore(queryTerms, item);
    if (score > 0) {
      results.push({ item, score, matchedTerms });
    }
  }
  
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

// Get related items
export function getRelatedItems(itemId: string): KnowledgeItem[] {
  const kb = getKnowledgeBase();
  const item = kb.find(k => k.id === itemId);
  if (!item) return [];
  
  return item.relatedItems
    .map(relId => kb.find(k => k.id === relId))
    .filter(Boolean) as KnowledgeItem[];
}

// Get items by category
export function getItemsByCategory(category: string): KnowledgeItem[] {
  const kb = getKnowledgeBase();
  return kb.filter(k => k.category === category);
}

// Get suggested learning path
export function getSuggestedPath(problemType: string): KnowledgeItem[] {
  const kb = getKnowledgeBase();
  
  // Map problem types to relevant categories and order
  const pathMap: Record<string, string[]> = {
    "retrieval-quality": ["foundations", "retrieval", "post-retrieval"],
    "hallucination": ["generation", "post-retrieval", "evaluation"],
    "performance": ["pre-retrieval", "retrieval", "operations"],
    "scale": ["infrastructure", "pre-retrieval", "retrieval"],
    "security": ["security", "generation"],
    "evaluation": ["evaluation", "foundations"],
    "cost": ["operations", "pre-retrieval"],
    "chunking": ["pre-retrieval"],
    "embedding": ["foundations"],
    "agentic": ["advanced", "retrieval", "generation"],
    "general": ["foundations", "pre-retrieval", "retrieval"],
  };
  
  const categories = pathMap[problemType] || pathMap["general"];
  
  const path: KnowledgeItem[] = [];
  for (const category of categories) {
    const items = kb.filter(k => k.category === category && k.difficulty === "beginner");
    path.push(...items.slice(0, 2));
  }
  
  return path.slice(0, 6);
}
