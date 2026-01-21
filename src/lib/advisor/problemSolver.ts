// Problem patterns mapped to solutions
// This acts as our "knowledge base" for the RAG Advisor

export type ProblemCategory = 
  | "retrieval-quality"
  | "hallucination"
  | "performance"
  | "scale"
  | "security"
  | "evaluation"
  | "cost"
  | "chunking"
  | "embedding"
  | "query-understanding"
  | "agentic"
  | "multimodal"
  | "general";

export type SolutionRecommendation = {
  problem: string;
  diagnosis: string;
  challenges: Array<{ slug: string; title: string; reason: string }>;
  playbooks: Array<{ slug: string; title: string }>;
  quickTips: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
};

// Keywords that map to problem categories
export const PROBLEM_KEYWORDS: Record<string, ProblemCategory> = {
  // Retrieval quality
  "wrong results": "retrieval-quality",
  "not finding": "retrieval-quality",
  "missing documents": "retrieval-quality",
  "low recall": "retrieval-quality",
  "can't find": "retrieval-quality",
  "irrelevant": "retrieval-quality",
  "wrong documents": "retrieval-quality",
  "precision": "retrieval-quality",
  "recall": "retrieval-quality",
  
  // Hallucination
  "hallucination": "hallucination",
  "makes up": "hallucination",
  "inventing": "hallucination",
  "not grounded": "hallucination",
  "fabricating": "hallucination",
  "wrong answer": "hallucination",
  "incorrect": "hallucination",
  "lies": "hallucination",
  
  // Performance
  "slow": "performance",
  "latency": "performance",
  "speed": "performance",
  "takes too long": "performance",
  "timeout": "performance",
  "performance": "performance",
  "faster": "performance",
  
  // Scale
  "scale": "scale",
  "million": "scale",
  "billion": "scale",
  "large corpus": "scale",
  "many documents": "scale",
  "memory": "scale",
  "out of memory": "scale",
  
  // Security
  "injection": "security",
  "security": "security",
  "prompt injection": "security",
  "pii": "security",
  "privacy": "security",
  "attack": "security",
  "vulnerable": "security",
  
  // Evaluation
  "evaluate": "evaluation",
  "measure": "evaluation",
  "metrics": "evaluation",
  "testing": "evaluation",
  "benchmark": "evaluation",
  "quality": "evaluation",
  
  // Cost
  "cost": "cost",
  "expensive": "cost",
  "budget": "cost",
  "cheaper": "cost",
  "pricing": "cost",
  "tokens": "cost",
  
  // Chunking
  "chunk": "chunking",
  "chunking": "chunking",
  "split": "chunking",
  "too small": "chunking",
  "too large": "chunking",
  "fragment": "chunking",
  
  // Embedding
  "embedding": "embedding",
  "vector": "embedding",
  "similarity": "embedding",
  "model": "embedding",
  "encode": "embedding",
  
  // Agentic
  "agent": "agentic",
  "tool": "agentic",
  "multi-step": "agentic",
  "reasoning": "agentic",
  "plan": "agentic",
  
  // Multimodal  
  "image": "multimodal",
  "pdf": "multimodal",
  "table": "multimodal",
  "audio": "multimodal",
  "video": "multimodal",
  
  // Query Understanding
  "query": "query-understanding",
  "hyde": "query-understanding",
  "hypothetical": "query-understanding",
  "expansion": "query-understanding",
  "reformulate": "query-understanding",
  "intent": "query-understanding",
  "vague": "query-understanding",
  "unclear": "query-understanding",
  "ambiguous": "query-understanding",
  "what does the user mean": "query-understanding",
};

// Pre-defined solutions for each problem category
export const PROBLEM_SOLUTIONS: Record<ProblemCategory, SolutionRecommendation> = {
  "retrieval-quality": {
    problem: "Poor retrieval quality - not finding relevant documents",
    diagnosis: "Your retrieval pipeline may be missing relevant documents due to vocabulary mismatch, poor chunking, or lack of hybrid search.",
    challenges: [
      { slug: "bm25-from-scratch", title: "BM25 from Scratch", reason: "Add lexical search for exact term matching" },
      { slug: "rrf-fusion", title: "RRF Fusion", reason: "Combine multiple retrieval methods" },
      { slug: "hyde-search", title: "HyDE Search", reason: "Handle vague queries with hypothetical documents" },
      { slug: "rerank-cascade", title: "Rerank Cascade", reason: "Improve precision with cross-encoder reranking" },
      { slug: "evaluator-recall-at-k", title: "Recall@K", reason: "Measure and track retrieval quality" },
    ],
    playbooks: [
      { slug: "rag-techniques-encyclopedia", title: "RAG Techniques Encyclopedia" },
      ],
    quickTips: [
      "Try hybrid search: BM25 + dense retrieval with RRF fusion",
      "Increase k (retrieve 20-50), then rerank to top 5-10",
      "Check if your chunks are too small (fragments) or too large (diluted)",
      "Add metadata filtering to narrow search scope",
    ],
    difficulty: "intermediate",
  },
  
  "hallucination": {
    problem: "LLM hallucinating or generating ungrounded answers",
    diagnosis: "The model is generating content not supported by retrieved context. This is often due to irrelevant context, poor grounding instructions, or missing refusal policy.",
    challenges: [
      { slug: "citation-range-validator", title: "Citation Validator", reason: "Verify claims are grounded in sources" },
      { slug: "refusal-policy", title: "Refusal Policy", reason: "Teach model to say 'I don't know'" },
      { slug: "faithfulness-judge", title: "Faithfulness Judge", reason: "Evaluate groundedness automatically" },
      { slug: "evaluator-precision-at-k", title: "Precision@K", reason: "Ensure context quality" },
      { slug: "rerank-cascade", title: "Rerank Cascade", reason: "Filter out irrelevant documents" },
    ],
    playbooks: [
      { slug: "production-rag-blueprint", title: "Production RAG Blueprint" },
    ],
    quickTips: [
      "Add explicit grounding instructions: 'Answer ONLY from the context'",
      "Implement citation requirements: 'Cite [Source X] for each claim'",
      "Rerank aggressively to keep only highly relevant docs",
      "Add a refusal policy for low-confidence scenarios",
      "Use lower temperature (0.0-0.3) for factual responses",
    ],
    difficulty: "intermediate",
  },
  
  "performance": {
    problem: "RAG pipeline is too slow",
    diagnosis: "Latency issues can stem from embedding, retrieval, reranking, or generation steps. Identify the bottleneck first.",
    challenges: [
      { slug: "embedding-cache", title: "Embedding Cache", reason: "Cache expensive embedding calls" },
      { slug: "retrieval-cache-key", title: "Retrieval Cache Key", reason: "Cache retrieval results" },
      { slug: "hnsw-index", title: "HNSW Index", reason: "Use fast approximate search" },
      { slug: "rag-cost-calculator", title: "Cost Calculator", reason: "Understand where time is spent" },
    ],
    playbooks: [
      ],
    quickTips: [
      "Profile each step: embed(20ms) → search(5ms) → rerank(80ms) → LLM(500ms)",
      "Cache embeddings for repeated queries",
      "Use async/parallel when possible",
      "Consider smaller models: GPT-4o-mini vs GPT-4o",
      "Reduce context size (fewer, more relevant chunks)",
    ],
    difficulty: "intermediate",
  },
  
  "scale": {
    problem: "Need to handle millions or billions of documents",
    diagnosis: "At scale, memory and indexing become critical. You need efficient index structures and possibly sharding.",
    challenges: [
      { slug: "ivf-pq-index", title: "IVF-PQ Index", reason: "Memory-efficient indexing for billions of vectors" },
      { slug: "hnsw-index", title: "HNSW Index", reason: "Fast queries with good recall" },
      { slug: "index-sharding", title: "Index Sharding", reason: "Distribute across machines" },
      { slug: "async-batch-processor", title: "Async Batch Processor", reason: "Handle large ingestion loads" },
    ],
    playbooks: [
      ],
    quickTips: [
      "Use IVF-PQ for billion-scale: 10-50x memory reduction",
      "Shard by date/category for better query locality",
      "Implement two-stage retrieval: coarse → fine",
      "Consider managed solutions: Pinecone, Weaviate, Qdrant Cloud",
    ],
    difficulty: "advanced",
  },
  
  "security": {
    problem: "Concerned about prompt injection or data leakage",
    diagnosis: "RAG systems are vulnerable to indirect prompt injection through retrieved content. Defense-in-depth is required.",
    challenges: [
      { slug: "prompt-injection-defense", title: "Prompt Injection Defense", reason: "Core security patterns" },
      { slug: "prompt-injection-sanitizer", title: "Injection Sanitizer", reason: "Input sanitization" },
      { slug: "pii-redaction", title: "PII Redaction", reason: "Protect sensitive data" },
      { slug: "acl-filter-enforcement", title: "ACL Enforcement", reason: "Document-level access control" },
      { slug: "toxicity-guard", title: "Toxicity Guard", reason: "Filter harmful outputs" },
    ],
    playbooks: [
      { slug: "production-rag-blueprint", title: "Production Blueprint" },
    ],
    quickTips: [
      "Sanitize all retrieved content before inclusion in prompt",
      "Use separate system/user message boundaries",
      "Implement output validation for leaked instructions",
      "Enforce ACLs at retrieval time, not just UI",
      "Log everything for forensics",
    ],
    difficulty: "intermediate",
  },
  
  "evaluation": {
    problem: "Not sure how to evaluate RAG quality",
    diagnosis: "RAG evaluation requires both retrieval metrics and generation quality assessment.",
    challenges: [
      { slug: "evaluator-recall-at-k", title: "Recall@K", reason: "Primary retrieval metric" },
      { slug: "evaluator-precision-at-k", title: "Precision@K", reason: "Context quality metric" },
      { slug: "evaluator-mrr", title: "MRR", reason: "Ranking quality" },
      { slug: "evaluator-ndcg", title: "nDCG", reason: "Graded relevance" },
      { slug: "evaluator-map", title: "MAP", reason: "Overall ranking quality" },
      { slug: "faithfulness-judge", title: "Faithfulness Judge", reason: "Generation quality" },
    ],
    playbooks: [
      { slug: "rag-formulas-cheatsheet", title: "Formulas Cheat Sheet" },
      { slug: "rag-interview-questions", title: "Interview Questions" },
    ],
    quickTips: [
      "Create a golden set: 25-50 query/answer pairs",
      "Track Recall@10 for retrieval, Faithfulness for generation",
      "Use RAGAS for automated evaluation",
      "Log top-k retrieved chunks for every query",
      "Review failures manually to find patterns",
    ],
    difficulty: "beginner",
  },
  
  "cost": {
    problem: "RAG system is too expensive",
    diagnosis: "Costs come from embeddings, reranking, and LLM generation. Understanding unit economics is key.",
    challenges: [
      { slug: "rag-cost-calculator", title: "Cost Calculator", reason: "Understand your unit economics" },
      { slug: "embedding-model-selection", title: "Embedding Selection", reason: "Compare cost vs quality tradeoffs" },
      { slug: "reranker-selection", title: "Reranker Selection", reason: "Compare reranker costs" },
      { slug: "cost-aware-router", title: "Cost-Aware Router", reason: "Route queries by complexity" },
      { slug: "embedding-cache", title: "Embedding Cache", reason: "Reduce redundant API calls" },
    ],
    playbooks: [
      ],
    quickTips: [
      "GPT-4o-mini is 20x cheaper than GPT-4o with 90%+ quality",
      "Cache embeddings: most queries are repeated/similar",
      "Use open-source rerankers (BGE) instead of Cohere",
      "Reduce context size: fewer tokens = lower cost",
      "Route simple queries to cheaper models",
    ],
    difficulty: "beginner",
  },
  
  "chunking": {
    problem: "Chunking strategy issues",
    diagnosis: "Poor chunking leads to fragmented or diluted retrieval. The right strategy depends on your document types. Start with first principles: understand WHY each strategy exists.",
    challenges: [
      { slug: "fixed-size-chunking-fundamentals", title: "Fixed-Size Chunking", reason: "Foundation - understand token-based splitting" },
      { slug: "overlapping-chunking-explained", title: "Overlapping Chunking", reason: "Preserve context at boundaries" },
      { slug: "semantic-chunking", title: "Semantic Chunking", reason: "AI-detected natural boundaries" },
      { slug: "recursive-chunking", title: "Recursive Chunking", reason: "Handle nested document structure" },
      { slug: "hierarchical-chunking", title: "Hierarchical Chunking", reason: "Multi-resolution indexing" },
      { slug: "parent-document-chunking", title: "Parent Document", reason: "Small retrieval, big context" },
    ],
    playbooks: [
      { slug: "chunking-strategies", title: "Chunking Strategies Masterclass" },
      { slug: "rag-techniques-encyclopedia", title: "RAG Techniques Encyclopedia" },
    ],
    quickTips: [
      "Start with 400-600 tokens, 10-20% overlap",
      "Use structure-aware chunking for Markdown/HTML/Code",
      "Keep tables and code blocks intact (table-aware-chunking)",
      "Test different sizes on YOUR data with a golden set",
      "Consider parent-child for complex documents",
      "Use chunking router for document-type-aware splitting",
    ],
    difficulty: "beginner",
  },

  
  "embedding": {
    problem: "Embedding model selection or quality issues",
    diagnosis: "Different embedding models have different strengths. MTEB benchmarks help, but test on YOUR data.",
    challenges: [
      { slug: "embedding-model-selection", title: "Embedding Model Selection", reason: "Complete comparison guide" },
      { slug: "cosine-similarity", title: "Cosine Similarity", reason: "Understand similarity metrics" },
      { slug: "dot-product", title: "Dot Product", reason: "Foundation math" },
      { slug: "embedding-finetuning", title: "Embedding Fine-tuning", reason: "Domain adaptation" },
    ],
    playbooks: [
      ],
    quickTips: [
      "text-embedding-3-small is great value ($0.02/1M tokens)",
      "voyage-3 leads on quality but costs more",
      "Open-source (BGE, Nomic) works well if you have GPUs",
      "Test on YOUR data - MTEB doesn't always transfer",
      "Consider dimension reduction (Matryoshka) for cost savings",
    ],
    difficulty: "intermediate",
  },
  
  "agentic": {
    problem: "Building agentic RAG systems (multi-step, tools, reasoning)",
    diagnosis: "Agentic RAG adds planning, tool use, and self-correction on top of basic retrieval.",
    challenges: [
      { slug: "self-rag", title: "Self-RAG", reason: "Self-reflective retrieval" },
      { slug: "corrective-rag", title: "Corrective RAG", reason: "Correct bad retrievals" },
      { slug: "tool-use-basics", title: "Tool Use Basics", reason: "Foundation for agents" },
      { slug: "react-implementation", title: "ReAct", reason: "Reasoning + Acting pattern" },
      { slug: "self-correction-loop", title: "Self-Correction", reason: "Retry on failure" },
    ],
    playbooks: [
      { slug: "rag-techniques-encyclopedia", title: "RAG Techniques Encyclopedia" },
    ],
    quickTips: [
      "Start with simple tool use before full agents",
      "Self-RAG adds ~10ms + extra LLM calls per query",
      "CRAG: grade retrieval quality before generation",
      "Use structured outputs for reliable tool calling",
      "Add circuit breakers to prevent infinite loops",
    ],
    difficulty: "advanced",
  },
  
  "multimodal": {
    problem: "Need to handle images, PDFs, tables, or other non-text content",
    diagnosis: "Multimodal RAG requires specialized extraction, embedding, and potentially vision models.",
    challenges: [
      { slug: "table-parsing", title: "Table Parsing", reason: "Extract structured data" },
      { slug: "pdf-layout-detector", title: "PDF Layout", reason: "Handle complex PDFs" },
      { slug: "audio-transcript-chunking", title: "Audio Chunking", reason: "Handle transcripts" },
      { slug: "json-schema-parser", title: "JSON Schema Parser", reason: "Structured extraction" },
    ],
    playbooks: [
      { slug: "rag-techniques-encyclopedia", title: "RAG Techniques Encyclopedia" },
    ],
    quickTips: [
      "Use CLIP or ColPali for image embeddings",
      "Keep tables as structured data, not prose",
      "Caption images for text-based retrieval",
      "Consider separate indices for different modalities",
      "GPT-4V/Claude Vision for visual understanding",
    ],
    difficulty: "advanced",
  },
  
  "query-understanding": {
    problem: "Query understanding and processing issues",
    diagnosis: "Poor query understanding leads to vocabulary mismatch and missed retrievals. The user's query may be vague, use different terminology than your documents, or require decomposition.",
    challenges: [
      { slug: "intent-classification", title: "Intent Classification", reason: "Route queries by type (factual, procedural, comparison)" },
      { slug: "hyde-implementation", title: "HyDE: Hypothetical Document", reason: "Generate hypothetical answer for better matching" },
      { slug: "query-expansion", title: "Query Expansion", reason: "Add synonyms to bridge vocabulary gap" },
      { slug: "query-decomposition", title: "Query Decomposition", reason: "Break complex questions into sub-queries" },
      { slug: "conversational-query-rewrite", title: "Conversational Rewrite", reason: "Handle follow-up questions with context" },
      { slug: "query-entity-extraction", title: "Entity Extraction", reason: "Extract metadata for filtering" },
    ],
    playbooks: [
      { slug: "rag-techniques-encyclopedia", title: "RAG Techniques Encyclopedia" },
      { slug: "production-rag-blueprint", title: "Production RAG Blueprint" },
    ],
    quickTips: [
      "Use HyDE for vague or short queries - embed the hypothetical answer instead",
      "Expand queries with synonyms to handle vocabulary mismatch",
      "Decompose comparison queries ('X vs Y') into separate retrievals",
      "For chat/conversation, rewrite follow-ups to be standalone",
      "Extract entities for metadata filtering before vector search",
      "Route different intents (factual, procedural) to different handlers",
    ],
    difficulty: "intermediate",
  },
  
  "general": {
    problem: "Getting started with RAG or general questions",
    diagnosis: "Start with the fundamentals: understand embeddings, chunking, and the basic pipeline before optimizing.",
    challenges: [
      { slug: "dot-product", title: "Dot Product", reason: "Foundation math" },
      { slug: "cosine-similarity", title: "Cosine Similarity", reason: "Similarity metrics" },
      { slug: "simple-chunking", title: "Simple Chunking", reason: "Basic ingestion" },
      { slug: "bm25-from-scratch", title: "BM25", reason: "Sparse retrieval" },
      { slug: "rrf-fusion", title: "RRF Fusion", reason: "Hybrid search" },
    ],
    playbooks: [
      { slug: "production-rag-blueprint", title: "Production RAG Blueprint" },
      { slug: "rag-techniques-encyclopedia", title: "RAG Techniques Encyclopedia" },
      ],
    quickTips: [
      "Follow the Fast Track: 4 weeks to production RAG",
      "Start with the blueprint, understand the architecture",
      "Build incrementally: basic → hybrid → rerank → evaluate",
      "Create a small golden set early for testing",
    ],
    difficulty: "beginner",
  },
};

// Function to detect problem category from user input
export function detectProblemCategory(input: string): ProblemCategory {
  const inputLower = input.toLowerCase();
  
  // Check for keyword matches
  for (const [keyword, category] of Object.entries(PROBLEM_KEYWORDS)) {
    if (inputLower.includes(keyword)) {
      return category;
    }
  }
  
  return "general";
}

// Function to get recommendations
export function getRecommendations(input: string): SolutionRecommendation {
  const category = detectProblemCategory(input);
  return PROBLEM_SOLUTIONS[category];
}

// Function to search challenges by text
export function searchChallenges(
  query: string, 
  challenges: Array<{ slug: string; title: string; description: string }>
): Array<{ slug: string; title: string; description: string; score: number }> {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);
  
  return challenges
    .map(c => {
      const titleLower = c.title.toLowerCase();
      const descLower = c.description.toLowerCase();
      
      let score = 0;
      
      // Exact title match
      if (titleLower.includes(queryLower)) score += 10;
      
      // Term matches in title
      for (const term of queryTerms) {
        if (titleLower.includes(term)) score += 3;
        if (descLower.includes(term)) score += 1;
      }
      
      return { ...c, score };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
