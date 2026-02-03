/**
 * Interview Question Bank
 * Comprehensive collection of RAG-focused interview questions
 */

import type { InterviewQuestion, InterviewTemplate, InterviewScenario, InterviewTip } from "./types";

// ============================================
// Technical Questions
// ============================================

export const technicalQuestions: InterviewQuestion[] = [
  {
    id: "tech-001",
    type: "technical",
    difficulty: "entry",
    category: "embeddings",
    title: "Embedding Similarity Metrics",
    question: "Explain the difference between cosine similarity, dot product, and Euclidean distance for measuring vector similarity. When would you use each?",
    hints: [
      "Consider the effect of vector magnitude on each metric",
      "Think about normalization and its implications",
      "Consider computational efficiency",
    ],
    expectedPoints: [
      "Cosine similarity measures angle between vectors, ignores magnitude",
      "Dot product considers both angle and magnitude",
      "Euclidean distance measures actual distance in space",
      "Cosine is preferred when direction matters more than magnitude",
      "Dot product is faster to compute",
    ],
    followUpQuestions: [
      "How would you normalize vectors for cosine similarity?",
      "What happens to dot product when vectors are normalized?",
    ],
    timeLimitMinutes: 5,
    relatedChallenges: ["cosine-similarity", "dot-product", "euclidean-distance"],
    resources: ["https://www.pinecone.io/learn/vector-similarity/"],
    averageScore: 75,
    timesAsked: 150,
  },
  {
    id: "tech-002",
    type: "technical",
    difficulty: "mid",
    category: "chunking",
    title: "Chunking Strategies",
    question: "Compare and contrast different text chunking strategies. What are the trade-offs between fixed-size, semantic, and recursive chunking?",
    hints: [
      "Consider context preservation",
      "Think about processing overhead",
      "Consider the impact on retrieval quality",
    ],
    expectedPoints: [
      "Fixed-size: Simple, fast, may split semantic units",
      "Semantic: Preserves meaning, slower, requires understanding",
      "Recursive: Hierarchical, good for structured docs, complex",
      "Overlap helps preserve context across chunks",
      "Choice depends on document type and use case",
    ],
    followUpQuestions: [
      "How would you handle code documents differently?",
      "What chunk size would you start with for legal documents?",
    ],
    timeLimitMinutes: 8,
    relatedChallenges: ["chunking-strategies", "recursive-chunking", "semantic-chunking"],
    resources: [],
    averageScore: 70,
    timesAsked: 120,
  },
  {
    id: "tech-003",
    type: "technical",
    difficulty: "senior",
    category: "retrieval",
    title: "Hybrid Search Implementation",
    question: "Design a hybrid search system that combines BM25 and dense retrieval. How would you balance and weight the scores?",
    hints: [
      "Consider the strengths of each approach",
      "Think about normalization techniques",
      "Consider query-dependent weighting",
    ],
    expectedPoints: [
      "BM25 excels at exact keyword matching",
      "Dense retrieval captures semantic similarity",
      "RRF (Reciprocal Rank Fusion) is a common combination method",
      "Linear combination with learned weights is another approach",
      "Query type can determine optimal weights",
      "Normalization is crucial for fair combination",
    ],
    followUpQuestions: [
      "How would you evaluate the optimal weight?",
      "What are the latency implications?",
    ],
    timeLimitMinutes: 10,
    relatedChallenges: ["bm25-from-scratch", "hybrid-search-tuning", "rrf-fusion"],
    resources: [],
    averageScore: 65,
    timesAsked: 90,
  },
  {
    id: "tech-004",
    type: "technical",
    difficulty: "mid",
    category: "vector_databases",
    title: "HNSW Index Trade-offs",
    question: "Explain how HNSW (Hierarchical Navigable Small World) indexing works. What are the trade-offs between build time, memory usage, and search quality?",
    hints: [
      "Consider the graph structure",
      "Think about the ef_construction and M parameters",
      "Consider the greedy search algorithm",
    ],
    expectedPoints: [
      "HNSW builds a multi-layer graph structure",
      "Each layer is a navigable small world graph",
      "Search starts at top layer, refines as it descends",
      "ef_construction controls build quality vs time",
      "M controls connections per node (memory vs accuracy)",
      "Higher layers have fewer nodes for coarse navigation",
    ],
    followUpQuestions: [
      "How would you tune HNSW for a billion-vector dataset?",
      "When would IVF be a better choice?",
    ],
    timeLimitMinutes: 8,
    relatedChallenges: ["hnsw-index", "ivf-flat-index"],
    resources: [],
    averageScore: 60,
    timesAsked: 80,
  },
  {
    id: "tech-005",
    type: "technical",
    difficulty: "staff",
    category: "evaluation",
    title: "RAG Evaluation Framework",
    question: "Design a comprehensive evaluation framework for a RAG system. What metrics would you use and how would you collect ground truth data?",
    hints: [
      "Consider both retrieval and generation quality",
      "Think about automated vs human evaluation",
      "Consider the cost of evaluation at scale",
    ],
    expectedPoints: [
      "Retrieval metrics: Precision@K, Recall@K, MRR, NDCG",
      "Generation metrics: Faithfulness, Answer Relevance, Context Precision",
      "LLM-as-judge for automated evaluation",
      "Human evaluation for critical cases",
      "A/B testing for production systems",
      "Synthetic data generation for scale",
    ],
    followUpQuestions: [
      "How would you detect hallucinations at scale?",
      "What would you do if metrics conflict?",
    ],
    timeLimitMinutes: 12,
    relatedChallenges: ["rag-evaluation-suite", "faithfulness-judge", "evaluator-recall-at-k"],
    resources: [],
    averageScore: 55,
    timesAsked: 60,
  },
];

// ============================================
// System Design Questions
// ============================================

export const systemDesignQuestions: InterviewQuestion[] = [
  {
    id: "design-001",
    type: "system_design",
    difficulty: "mid",
    category: "architecture",
    title: "RAG Pipeline Architecture",
    question: "Design a production-ready RAG pipeline that can handle 10,000 queries per second. Consider ingestion, indexing, and query paths.",
    hints: [
      "Consider the write vs read path separation",
      "Think about caching strategies",
      "Consider failure modes and recovery",
    ],
    expectedPoints: [
      "Separate ingestion and query pipelines",
      "Use message queue for document ingestion",
      "Implement embedding caching",
      "Use vector database with replication",
      "Add query result caching",
      "Implement circuit breakers for LLM calls",
      "Consider multi-region deployment",
    ],
    followUpQuestions: [
      "How would you handle a hot document that's being updated frequently?",
      "What's your disaster recovery plan?",
    ],
    timeLimitMinutes: 15,
    relatedChallenges: ["rag-pipeline-chunker", "rag-pipeline-retriever", "semantic-caching"],
    resources: [],
    averageScore: 65,
    timesAsked: 100,
  },
  {
    id: "design-002",
    type: "system_design",
    difficulty: "senior",
    category: "scaling",
    title: "Scaling Vector Search",
    question: "Your vector search latency has increased to 500ms as your dataset grew to 100M vectors. How would you bring it back under 50ms?",
    hints: [
      "Consider approximation algorithms",
      "Think about partitioning strategies",
      "Consider hardware acceleration",
    ],
    expectedPoints: [
      "Switch to approximate nearest neighbor (ANN) index",
      "Consider HNSW, IVF, or ScaNN",
      "Implement vector quantization (PQ, SQ)",
      "Shard the index across multiple nodes",
      "Use GPU acceleration if applicable",
      "Implement pre-filtering to reduce search space",
      "Consider edge caching for popular queries",
    ],
    followUpQuestions: [
      "What accuracy trade-offs are you making?",
      "How would you measure the impact on user experience?",
    ],
    timeLimitMinutes: 12,
    relatedChallenges: ["hnsw-index", "ivf-pq-index", "product-quantization"],
    resources: [],
    averageScore: 60,
    timesAsked: 75,
  },
  {
    id: "design-003",
    type: "system_design",
    difficulty: "staff",
    category: "multi_tenancy",
    title: "Multi-Tenant RAG System",
    question: "Design a multi-tenant RAG system where each tenant has isolated data but shares infrastructure. How do you ensure security and fair resource allocation?",
    hints: [
      "Consider data isolation strategies",
      "Think about resource quotas",
      "Consider noisy neighbor problems",
    ],
    expectedPoints: [
      "Metadata filtering for logical isolation",
      "Separate namespaces/collections per tenant",
      "Resource quotas per tenant (rate limiting)",
      "Query prioritization and fair scheduling",
      "Tenant-aware caching",
      "Audit logging for compliance",
      "Encryption at rest and in transit",
    ],
    followUpQuestions: [
      "How would you handle a tenant DDoSing the system?",
      "What's your migration strategy when a tenant outgrows their tier?",
    ],
    timeLimitMinutes: 15,
    relatedChallenges: ["multi-tenancy-rag", "metadata-filtering"],
    resources: [],
    averageScore: 50,
    timesAsked: 50,
  },
];

// ============================================
// Behavioral Questions
// ============================================

export const behavioralQuestions: InterviewQuestion[] = [
  {
    id: "behav-001",
    type: "behavioral",
    difficulty: "mid",
    category: "teamwork",
    title: "Disagreeing on Architecture",
    question: "Tell me about a time you disagreed with a team member on a technical architecture decision. How did you resolve it?",
    hints: [
      "Focus on the process, not just the outcome",
      "Show how you used data to support your position",
      "Demonstrate willingness to change your mind",
    ],
    expectedPoints: [
      "Clear description of the disagreement",
      "Data-driven arguments presented",
      "Consideration of trade-offs",
      "Collaborative resolution process",
      "Willingness to compromise or change position",
      "Lesson learned from the experience",
    ],
    timeLimitMinutes: 8,
    relatedChallenges: [],
    resources: [],
    averageScore: 75,
    timesAsked: 200,
  },
  {
    id: "behav-002",
    type: "behavioral",
    difficulty: "senior",
    category: "leadership",
    title: "Leading Without Authority",
    question: "Describe a situation where you had to influence a team without having direct authority. What strategies did you use?",
    hints: [
      "Think about building consensus",
      "Consider how you established credibility",
      "Show how you handled resistance",
    ],
    expectedPoints: [
      "Built relationships and trust first",
      "Used data and evidence to support proposals",
      "Found allies and champions",
      "Addressed concerns proactively",
      "Demonstrated expertise through contributions",
      "Created win-win solutions",
    ],
    timeLimitMinutes: 10,
    relatedChallenges: [],
    resources: [],
    averageScore: 70,
    timesAsked: 150,
  },
];

// ============================================
// Troubleshooting Questions
// ============================================

export const troubleshootingQuestions: InterviewQuestion[] = [
  {
    id: "debug-001",
    type: "troubleshooting",
    difficulty: "mid",
    category: "performance",
    title: "Slow RAG Responses",
    question: "Users are reporting that RAG responses are taking 10+ seconds. Walk me through your debugging process.",
    hints: [
      "Start with measuring each component",
      "Think about common bottlenecks",
      "Consider recent changes",
    ],
    expectedPoints: [
      "Profile each stage: retrieval, reranking, generation",
      "Check vector search latency",
      "Verify LLM API response times",
      "Look for cache hit rate changes",
      "Check for increased load or traffic patterns",
      "Review recent deployments",
      "Consider network latency",
    ],
    followUpQuestions: [
      "What if the vector DB latency is normal?",
      "How would you handle a sudden traffic spike?",
    ],
    timeLimitMinutes: 10,
    relatedChallenges: ["rag-failure-diagnosis", "semantic-caching"],
    resources: [],
    averageScore: 70,
    timesAsked: 120,
  },
  {
    id: "debug-002",
    type: "troubleshooting",
    difficulty: "senior",
    category: "quality",
    title: "Degraded Answer Quality",
    question: "The quality of RAG answers has degraded over the past week. Users report irrelevant or hallucinated responses. How do you investigate?",
    hints: [
      "Consider the full pipeline",
      "Think about data quality issues",
      "Consider model changes",
    ],
    expectedPoints: [
      "Check retrieval relevance scores",
      "Analyze recent document additions",
      "Verify embedding model hasn't changed",
      "Check for prompt drift",
      "Review LLM model version",
      "Analyze query patterns for changes",
      "Check for data poisoning or bad documents",
    ],
    followUpQuestions: [
      "What metrics would you set up to catch this earlier?",
      "How would you roll back if needed?",
    ],
    timeLimitMinutes: 12,
    relatedChallenges: ["rag-failure-diagnosis", "hallucination-detection"],
    resources: [],
    averageScore: 65,
    timesAsked: 100,
  },
];

// ============================================
// Interview Templates
// ============================================

export const interviewTemplates: InterviewTemplate[] = [
  {
    id: "template-entry",
    name: "Entry Level RAG Engineer",
    description: "Focuses on fundamental concepts and basic implementation skills",
    difficulty: "entry",
    questionTypes: ["technical", "coding"],
    questionCount: 5,
    durationMinutes: 45,
    categories: ["embeddings", "chunking", "basic-retrieval"],
    includeFollowUps: true,
    includeTimePressure: false,
    includeAiFeedback: true,
  },
  {
    id: "template-mid",
    name: "Mid-Level RAG Engineer",
    description: "Covers system design, optimization, and production considerations",
    difficulty: "mid",
    questionTypes: ["technical", "system_design", "troubleshooting"],
    questionCount: 6,
    durationMinutes: 60,
    categories: ["retrieval", "vector_databases", "architecture"],
    includeFollowUps: true,
    includeTimePressure: true,
    includeAiFeedback: true,
  },
  {
    id: "template-senior",
    name: "Senior RAG Engineer",
    description: "Advanced topics including scaling, multi-tenancy, and team leadership",
    difficulty: "senior",
    questionTypes: ["technical", "system_design", "behavioral", "troubleshooting"],
    questionCount: 8,
    durationMinutes: 90,
    categories: ["scaling", "multi_tenancy", "evaluation", "leadership"],
    includeFollowUps: true,
    includeTimePressure: true,
    includeAiFeedback: true,
  },
  {
    id: "template-staff",
    name: "Staff RAG Engineer",
    description: "Architecture, strategy, and organizational impact",
    difficulty: "staff",
    questionTypes: ["system_design", "architecture", "behavioral"],
    questionCount: 6,
    durationMinutes: 90,
    categories: ["architecture", "strategy", "scaling", "evaluation"],
    includeFollowUps: true,
    includeTimePressure: false,
    includeAiFeedback: true,
  },
  {
    id: "template-quick",
    name: "Quick Practice",
    description: "Short session for daily practice",
    difficulty: "mid",
    questionTypes: ["technical"],
    questionCount: 3,
    durationMinutes: 20,
    categories: [],
    includeFollowUps: false,
    includeTimePressure: false,
    includeAiFeedback: false,
  },
];

// ============================================
// Interview Scenarios
// ============================================

export const interviewScenarios: InterviewScenario[] = [
  {
    id: "scenario-startup",
    name: "Startup RAG Build",
    description: "You're the first ML engineer at a startup building a RAG-based product. Design the MVP and plan for growth.",
    role: "Founding ML Engineer",
    companyContext: "Early-stage startup with 10 employees, $2M seed funding",
    questions: [], // Would be populated with relevant questions
    evaluationCriteria: [
      { category: "Technical Depth", weight: 0.3, description: "Understanding of RAG fundamentals" },
      { category: "Pragmatism", weight: 0.3, description: "Appropriate trade-offs for startup stage" },
      { category: "Growth Planning", weight: 0.2, description: "Scalability considerations" },
      { category: "Communication", weight: 0.2, description: "Clear articulation of decisions" },
    ],
  },
  {
    id: "scenario-enterprise",
    name: "Enterprise Migration",
    description: "You're leading the migration of a legacy search system to RAG at a Fortune 500 company.",
    role: "Principal Engineer",
    companyContext: "Large enterprise with strict compliance requirements and legacy infrastructure",
    questions: [],
    evaluationCriteria: [
      { category: "Risk Management", weight: 0.3, description: "Handling migration risks" },
      { category: "Compliance", weight: 0.2, description: "Security and regulatory considerations" },
      { category: "Stakeholder Management", weight: 0.2, description: "Working with multiple teams" },
      { category: "Technical Excellence", weight: 0.3, description: "Architecture quality" },
    ],
  },
];

// ============================================
// Interview Tips
// ============================================

export const interviewTips: InterviewTip[] = [
  {
    id: "tip-001",
    category: "technical",
    difficulty: "entry",
    title: "Structure Your Answer",
    content: "Use the 'What, Why, How' structure. Start with a clear definition, explain why it matters, then describe how it works.",
    examples: [
      "What: Cosine similarity measures the angle between two vectors",
      "Why: It's scale-invariant, making it ideal for comparing document similarity regardless of length",
      "How: Calculate the dot product divided by the product of magnitudes",
    ],
  },
  {
    id: "tip-002",
    category: "system_design",
    difficulty: "mid",
    title: "Start with Requirements",
    content: "Always begin system design questions by clarifying functional and non-functional requirements. Ask about scale, latency, and consistency needs.",
    commonMistakes: [
      "Jumping straight to the solution without understanding constraints",
      "Making assumptions about scale without verifying",
      "Ignoring non-functional requirements like availability",
    ],
  },
  {
    id: "tip-003",
    category: "behavioral",
    difficulty: "mid",
    title: "Use STAR Method",
    content: "Structure behavioral answers with Situation, Task, Action, Result. Be specific about YOUR contributions.",
    examples: [
      "Situation: The team was divided on chunking strategy",
      "Task: I needed to help us reach consensus",
      "Action: I created benchmarks comparing approaches on our data",
      "Result: We chose semantic chunking with 15% better retrieval",
    ],
  },
  {
    id: "tip-004",
    category: "troubleshooting",
    difficulty: "senior",
    title: "Show Your Process",
    content: "Walk through your debugging methodology. Show how you isolate variables and form hypotheses.",
    examples: [
      "First, I'd check recent deployments and changes",
      "Then I'd profile each component to identify the bottleneck",
      "I'd form hypotheses and test them systematically",
    ],
  },
];

// ============================================
// Helper Functions
// ============================================

export function getQuestionsByType(type: string): InterviewQuestion[] {
  const allQuestions = [
    ...technicalQuestions,
    ...systemDesignQuestions,
    ...behavioralQuestions,
    ...troubleshootingQuestions,
  ];
  return allQuestions.filter((q) => q.type === type);
}

export function getQuestionsByDifficulty(difficulty: string): InterviewQuestion[] {
  const allQuestions = [
    ...technicalQuestions,
    ...systemDesignQuestions,
    ...behavioralQuestions,
    ...troubleshootingQuestions,
  ];
  return allQuestions.filter((q) => q.difficulty === difficulty);
}

export function getRandomQuestions(
  count: number,
  filters?: {
    types?: string[];
    difficulties?: string[];
    categories?: string[];
  }
): InterviewQuestion[] {
  let questions = [
    ...technicalQuestions,
    ...systemDesignQuestions,
    ...behavioralQuestions,
    ...troubleshootingQuestions,
  ];

  if (filters?.types) {
    questions = questions.filter((q) => filters.types!.includes(q.type));
  }
  if (filters?.difficulties) {
    questions = questions.filter((q) => filters.difficulties!.includes(q.difficulty));
  }
  if (filters?.categories) {
    questions = questions.filter((q) => filters.categories!.includes(q.category));
  }

  // Shuffle and return requested count
  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function getTemplateById(id: string): InterviewTemplate | undefined {
  return interviewTemplates.find((t) => t.id === id);
}

export function getTipsByCategory(category: string): InterviewTip[] {
  return interviewTips.filter((t) => t.category === category);
}
