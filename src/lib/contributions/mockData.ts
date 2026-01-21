import type { Contribution, ContributorStats } from "./types";

/**
 * Mock contribution data for demonstration.
 * In production, this would come from Supabase.
 */

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    id: "contrib-1",
    type: "challenge",
    status: "approved",
    title: "HNSW Index Implementation",
    description: "A challenge to implement the Hierarchical Navigable Small World index algorithm for approximate nearest neighbor search.",
    userId: "user-1",
    userName: "Alice Chen",
    challengeData: {
      slug: "hnsw-index",
      difficulty: "hard",
      group: "Advanced Data Structures",
      starterCode: "# Starter code...",
      testCode: "# Test code...",
      hints: ["Build the layers bottom-up", "Start with the highest layer"],
      solution: "# Solution...",
      prompt: "# HNSW Index\n\nImplement HNSW...",
      relatedTo: ["ivf-flat-index", "naive-flat-index"],
      prereqs: ["cosine-similarity", "dense-vector-class"],
    },
    createdAt: "2025-12-15T10:00:00Z",
    updatedAt: "2025-12-20T14:30:00Z",
    reviewedBy: "admin-1",
    reviewNotes: "Excellent challenge! Added to the advanced data structures track.",
    xpAwarded: 500,
  },
  {
    id: "contrib-2",
    type: "solution",
    status: "approved",
    title: "NumPy-optimized Cosine Similarity",
    description: "A highly optimized solution using NumPy broadcasting for batch cosine similarity computation.",
    userId: "user-2",
    userName: "Bob Smith",
    solutionData: {
      challengeSlug: "cosine-similarity",
      language: "python",
      code: `import numpy as np

def batch_cosine_similarity(queries, docs):
    """
    Compute cosine similarity for batches of queries and documents.
    
    Args:
        queries: (N, D) array of query vectors
        docs: (M, D) array of document vectors
    
    Returns:
        (N, M) array of similarity scores
    """
    # Normalize
    queries_norm = queries / np.linalg.norm(queries, axis=1, keepdims=True)
    docs_norm = docs / np.linalg.norm(docs, axis=1, keepdims=True)
    
    # Batch dot product
    return queries_norm @ docs_norm.T`,
      explanation: "This solution uses NumPy's optimized linear algebra routines for 100x speedup on large datasets.",
      complexity: { time: "O(n * m * d)", space: "O(n * m)" },
      approach: "optimized",
    },
    createdAt: "2025-12-18T08:15:00Z",
    updatedAt: "2025-12-18T08:15:00Z",
    xpAwarded: 100,
  },
  {
    id: "contrib-3",
    type: "paper",
    status: "approved",
    title: "RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval",
    description: "A 2024 paper on hierarchical document summarization for better long-context retrieval.",
    userId: "user-3",
    userName: "Carol Davis",
    paperData: {
      title: "RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval",
      authors: "Sarthi et al.",
      year: 2024,
      venue: "ICLR",
      arxivUrl: "https://arxiv.org/abs/2401.18059",
      tags: ["retrieval", "summarization", "hierarchical"],
      summary: "RAPTOR recursively clusters and summarizes document chunks, creating a tree structure that captures information at different abstraction levels.",
      relevance: "Essential for handling long documents in RAG. Enables retrieval at multiple granularities.",
    },
    createdAt: "2025-12-10T16:45:00Z",
    updatedAt: "2025-12-12T09:00:00Z",
    reviewedBy: "admin-2",
    xpAwarded: 150,
  },
  {
    id: "contrib-4",
    type: "correction",
    status: "approved",
    title: "Fix BM25 IDF formula",
    description: "The BM25 challenge had an incorrect IDF formula that produced negative values for common terms.",
    userId: "user-4",
    userName: "David Lee",
    correctionData: {
      targetType: "challenge",
      targetSlug: "bm25-from-scratch",
      issueDescription: "The IDF formula log(N/df) can produce negative values when df > N/e ≈ 0.37N. This happens for common terms.",
      suggestedFix: "Use the Robertson-Sparck Jones IDF: log((N - df + 0.5) / (df + 0.5) + 1)",
      codeChanges: `# Before
idf = math.log(N / df)

# After  
idf = math.log((N - df + 0.5) / (df + 0.5) + 1)`,
    },
    createdAt: "2025-12-08T11:30:00Z",
    updatedAt: "2025-12-09T15:00:00Z",
    reviewedBy: "admin-1",
    reviewNotes: "Great catch! This was causing confusion for many learners.",
    xpAwarded: 75,
  },
  {
    id: "contrib-5",
    type: "challenge",
    status: "in_review",
    title: "ColBERT Late Interaction",
    description: "Implement the ColBERT late interaction scoring mechanism for efficient neural retrieval.",
    userId: "user-5",
    userName: "Emma Wilson",
    challengeData: {
      slug: "colbert-scoring",
      difficulty: "hard",
      group: "Neural Retrieval",
      starterCode: "# Starter code for ColBERT...",
      testCode: "# Tests...",
      hints: ["MaxSim operation over token embeddings"],
      solution: "# Solution...",
      prompt: "# ColBERT Scoring\n\nImplement the late interaction scoring...",
      prereqs: ["cosine-similarity", "embed-and-search"],
    },
    createdAt: "2026-01-05T14:20:00Z",
    updatedAt: "2026-01-05T14:20:00Z",
  },
  {
    id: "contrib-6",
    type: "solution",
    status: "submitted",
    title: "TypeScript RRF Implementation",
    description: "A clean TypeScript implementation of Reciprocal Rank Fusion with generics.",
    userId: "user-6",
    userName: "Frank Garcia",
    solutionData: {
      challengeSlug: "rrf-fusion",
      language: "typescript",
      code: `function rrfFusion<T extends { id: string }>(
  rankedLists: T[][],
  k: number = 60
): Map<string, number> {
  const scores = new Map<string, number>();
  
  for (const list of rankedLists) {
    list.forEach((item, rank) => {
      const rrfScore = 1 / (k + rank + 1);
      scores.set(item.id, (scores.get(item.id) ?? 0) + rrfScore);
    });
  }
  
  return scores;
}`,
      explanation: "Generic implementation that works with any ranked list of items with IDs.",
      complexity: { time: "O(n)", space: "O(n)" },
      approach: "functional",
    },
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
  },
];

export const MOCK_CONTRIBUTOR_STATS: Record<string, ContributorStats> = {
  "user-1": {
    totalContributions: 5,
    approved: 3,
    pending: 2,
    xpEarned: 750,
    rank: "Top Contributor",
  },
  "user-2": {
    totalContributions: 3,
    approved: 2,
    pending: 1,
    xpEarned: 200,
    rank: "Rising Star",
  },
  "user-4": {
    totalContributions: 8,
    approved: 7,
    pending: 1,
    xpEarned: 500,
    rank: "Bug Hunter",
  },
};

/**
 * Get all contributions.
 */
export function getAllContributions(): Contribution[] {
  return MOCK_CONTRIBUTIONS.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get contributions by status.
 */
export function getContributionsByStatus(status: Contribution["status"]): Contribution[] {
  return MOCK_CONTRIBUTIONS.filter(c => c.status === status);
}

/**
 * Get contributions by user.
 */
export function getContributionsByUser(userId: string): Contribution[] {
  return MOCK_CONTRIBUTIONS.filter(c => c.userId === userId);
}

/**
 * Get contributor stats.
 */
export function getContributorStats(userId: string): ContributorStats | null {
  return MOCK_CONTRIBUTOR_STATS[userId] ?? null;
}

/**
 * Get leaderboard of top contributors.
 */
export function getTopContributors(limit: number = 10): Array<{ userId: string; userName: string; stats: ContributorStats }> {
  const contributors = Object.entries(MOCK_CONTRIBUTOR_STATS)
    .map(([userId, stats]) => {
      const contrib = MOCK_CONTRIBUTIONS.find(c => c.userId === userId);
      return {
        userId,
        userName: contrib?.userName ?? "Unknown",
        stats,
      };
    })
    .sort((a, b) => b.stats.xpEarned - a.stats.xpEarned)
    .slice(0, limit);
  
  return contributors;
}
