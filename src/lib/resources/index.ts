// Curated external learning resources for RAG Academy
// Includes videos, tutorials, papers, and GitHub repos

export interface LearningResource {
  id: string;
  title: string;
  type: "video" | "article" | "paper" | "github" | "course" | "documentation";
  url: string;
  source: string;
  duration?: string; // For videos
  author?: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
  featured?: boolean;
}

export const LEARNING_RESOURCES: LearningResource[] = [
  // VECTORS & EMBEDDINGS
  {
    id: "3b1b-vectors",
    title: "Essence of Linear Algebra - Vectors",
    type: "video",
    url: "https://www.youtube.com/watch?v=fNk_zzaMoSs",
    source: "3Blue1Brown",
    duration: "10 min",
    author: "Grant Sanderson",
    description: "Beautiful visual explanation of what vectors really are. Essential foundation for understanding embeddings.",
    difficulty: "beginner",
    topics: ["vectors", "linear-algebra", "foundations"],
    featured: true,
  },
  {
    id: "openai-embeddings",
    title: "OpenAI Embeddings Guide",
    type: "documentation",
    url: "https://platform.openai.com/docs/guides/embeddings",
    source: "OpenAI",
    description: "Official guide on using text-embedding-ada-002 and newer models. Production-ready examples.",
    difficulty: "beginner",
    topics: ["embeddings", "openai", "api"],
  },
  {
    id: "sentence-transformers",
    title: "Sentence Transformers Documentation",
    type: "documentation",
    url: "https://www.sbert.net/",
    source: "UKP Lab",
    description: "The go-to library for creating sentence embeddings. Covers fine-tuning and evaluation.",
    difficulty: "intermediate",
    topics: ["embeddings", "sentence-transformers", "python"],
  },

  // VECTOR DATABASES
  {
    id: "faiss-tutorial",
    title: "FAISS: A Library for Efficient Similarity Search",
    type: "github",
    url: "https://github.com/facebookresearch/faiss/wiki",
    source: "Meta AI",
    description: "The industry standard for billion-scale vector search. Learn IVF, PQ, and HNSW internals.",
    difficulty: "advanced",
    topics: ["faiss", "vector-db", "indexing"],
    featured: true,
  },
  {
    id: "pinecone-learn",
    title: "Pinecone Learning Center",
    type: "course",
    url: "https://www.pinecone.io/learn/",
    source: "Pinecone",
    description: "Comprehensive guides on vector search, from basics to production optimization.",
    difficulty: "intermediate",
    topics: ["pinecone", "vector-db", "production"],
  },
  {
    id: "chromadb-docs",
    title: "ChromaDB Getting Started",
    type: "documentation",
    url: "https://docs.trychroma.com/",
    source: "Chroma",
    description: "Open-source embedding database. Great for prototyping and local development.",
    difficulty: "beginner",
    topics: ["chromadb", "vector-db", "python"],
  },
  {
    id: "weaviate-academy",
    title: "Weaviate Academy",
    type: "course",
    url: "https://weaviate.io/developers/academy",
    source: "Weaviate",
    description: "Free courses on vector search, hybrid search, and multimodal embeddings.",
    difficulty: "intermediate",
    topics: ["weaviate", "vector-db", "hybrid-search"],
  },

  // RAG FUNDAMENTALS
  {
    id: "langchain-rag-tutorial",
    title: "RAG Tutorial with LangChain",
    type: "article",
    url: "https://python.langchain.com/docs/tutorials/rag/",
    source: "LangChain",
    description: "Official LangChain tutorial on building RAG applications. Covers chunking, retrieval, and generation.",
    difficulty: "beginner",
    topics: ["rag", "langchain", "python"],
    featured: true,
  },
  {
    id: "llamaindex-rag",
    title: "Building a RAG Pipeline from Scratch",
    type: "documentation",
    url: "https://docs.llamaindex.ai/en/stable/getting_started/starter_example/",
    source: "LlamaIndex",
    description: "Step-by-step guide to building RAG with LlamaIndex. Great alternative to LangChain.",
    difficulty: "beginner",
    topics: ["rag", "llamaindex", "python"],
  },
  {
    id: "anthropic-rag-guide",
    title: "Retrieval Augmented Generation (RAG)",
    type: "documentation",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/retrieval-augmented-generation",
    source: "Anthropic",
    description: "Anthropic's official guide on building RAG with Claude. Best practices for context injection.",
    difficulty: "intermediate",
    topics: ["rag", "anthropic", "claude"],
  },

  // ADVANCED RAG
  {
    id: "rag-paper",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    type: "paper",
    url: "https://arxiv.org/abs/2005.11401",
    source: "arXiv",
    author: "Lewis et al.",
    description: "The original RAG paper from Meta AI. Foundational reading for understanding the architecture.",
    difficulty: "advanced",
    topics: ["rag", "papers", "research"],
    featured: true,
  },
  {
    id: "advanced-rag-survey",
    title: "Retrieval-Augmented Generation for Large Language Models: A Survey",
    type: "paper",
    url: "https://arxiv.org/abs/2312.10997",
    source: "arXiv",
    description: "Comprehensive 2024 survey of RAG techniques. Covers pre-retrieval, retrieval, and post-retrieval optimization.",
    difficulty: "advanced",
    topics: ["rag", "papers", "survey"],
  },

  // CHUNKING & PREPROCESSING
  {
    id: "chunking-strategies",
    title: "5 Levels of Text Splitting",
    type: "video",
    url: "https://www.youtube.com/watch?v=8OJC21T2SL4",
    source: "Greg Kamradt",
    duration: "18 min",
    description: "Excellent breakdown of chunking strategies from naive to semantic. Must-watch.",
    difficulty: "intermediate",
    topics: ["chunking", "preprocessing", "text-splitting"],
    featured: true,
  },

  // RERANKING
  {
    id: "cohere-rerank",
    title: "Cohere Rerank Documentation",
    type: "documentation",
    url: "https://docs.cohere.com/docs/rerank-2",
    source: "Cohere",
    description: "Production-grade reranking API. Learn when and how to use cross-encoders.",
    difficulty: "intermediate",
    topics: ["reranking", "cohere", "api"],
  },
  {
    id: "cross-encoders-explained",
    title: "Cross-Encoders for Reranking",
    type: "article",
    url: "https://www.sbert.net/examples/applications/cross-encoder/README.html",
    source: "SBERT",
    description: "Technical deep-dive into cross-encoder architecture and training.",
    difficulty: "advanced",
    topics: ["reranking", "cross-encoders", "sentence-transformers"],
  },

  // EVALUATION
  {
    id: "ragas-docs",
    title: "RAGAS: RAG Assessment",
    type: "github",
    url: "https://github.com/explodinggradients/ragas",
    source: "Exploding Gradients",
    description: "The standard framework for evaluating RAG pipelines. Covers faithfulness, relevance, and more.",
    difficulty: "intermediate",
    topics: ["evaluation", "ragas", "metrics"],
    featured: true,
  },
  {
    id: "trulens-eval",
    title: "TruLens Evaluation",
    type: "documentation",
    url: "https://www.trulens.org/",
    source: "TruLens",
    description: "Evaluation and observability for LLM apps. Great for production monitoring.",
    difficulty: "intermediate",
    topics: ["evaluation", "trulens", "observability"],
  },

  // PRODUCTION & DEPLOYMENT
  {
    id: "mlops-rag",
    title: "MLOps for RAG Systems",
    type: "article",
    url: "https://www.databricks.com/blog/building-production-grade-rag-systems",
    source: "Databricks",
    description: "Databricks guide on productionizing RAG. Covers monitoring, evaluation, and iteration.",
    difficulty: "advanced",
    topics: ["production", "mlops", "databricks"],
  },

  // GITHUB REPOS
  {
    id: "langchain-repo",
    title: "LangChain GitHub",
    type: "github",
    url: "https://github.com/langchain-ai/langchain",
    source: "LangChain",
    description: "The most popular LLM framework. Study the source for production patterns.",
    difficulty: "intermediate",
    topics: ["langchain", "python", "framework"],
  },
  {
    id: "llamaindex-repo",
    title: "LlamaIndex GitHub",
    type: "github",
    url: "https://github.com/run-llama/llama_index",
    source: "LlamaIndex",
    description: "Data framework for LLM applications. Great for understanding indexing strategies.",
    difficulty: "intermediate",
    topics: ["llamaindex", "python", "framework"],
  },
];

// Helper to get resources by topic
export function getResourcesByTopic(topic: string): LearningResource[] {
  return LEARNING_RESOURCES.filter((r) =>
    r.topics.includes(topic.toLowerCase())
  );
}

// Helper to get featured resources
export function getFeaturedResources(): LearningResource[] {
  return LEARNING_RESOURCES.filter((r) => r.featured);
}

// Helper to get resources by type
export function getResourcesByType(type: LearningResource["type"]): LearningResource[] {
  return LEARNING_RESOURCES.filter((r) => r.type === type);
}

// Topic to challenge mapping for "Learn More" sections
export const CHALLENGE_RESOURCES: Record<string, string[]> = {
  "dot-product": ["3b1b-vectors", "openai-embeddings"],
  "cosine-similarity": ["3b1b-vectors", "sentence-transformers"],
  "dense-vector-class": ["faiss-tutorial", "pinecone-learn"],
  "naive-flat-index": ["faiss-tutorial", "chromadb-docs"],
  "ivf-flat-index": ["faiss-tutorial", "pinecone-learn"],
  "hnsw-index": ["faiss-tutorial", "weaviate-academy"],
  "rag-pipeline-chunker": ["chunking-strategies", "langchain-rag-tutorial"],
  "rag-pipeline-embedder": ["openai-embeddings", "sentence-transformers"],
  "rag-pipeline-retriever": ["langchain-rag-tutorial", "llamaindex-rag"],
  "rag-pipeline-generator": ["anthropic-rag-guide", "rag-paper"],
  "reranker-score-function": ["cohere-rerank", "cross-encoders-explained"],
  "reranker-cascade": ["cohere-rerank", "advanced-rag-survey"],
  "evaluator-recall-at-k": ["ragas-docs", "trulens-eval"],
  "evaluator-mrr": ["ragas-docs"],
  "evaluator-ndcg": ["ragas-docs", "trulens-eval"],
};
