import type { DiscussionThread, DiscussionReply } from "./types";

/**
 * Mock discussion data for demonstration.
 * In production, this would come from Supabase.
 */

export const MOCK_THREADS: DiscussionThread[] = [
  // dot-product challenge
  {
    id: "thread-1",
    challengeSlug: "dot-product",
    userId: "user-1",
    userName: "Alice Chen",
    category: "solution",
    title: "One-liner using reduce",
    content: "Here's a clean functional approach using reduce. It's concise but still readable.",
    codeSnippet: `def dot(a, b):
    if len(a) != len(b):
        raise ValueError("Vectors must be same length")
    return sum(x * y for x, y in zip(a, b))`,
    createdAt: "2026-01-10T10:30:00Z",
    updatedAt: "2026-01-10T10:30:00Z",
    upvotes: 42,
    replyCount: 5,
    isPinned: true,
    tags: ["python", "functional"],
  },
  {
    id: "thread-2",
    challengeSlug: "dot-product",
    userId: "user-2",
    userName: "Bob Smith",
    category: "optimization",
    title: "NumPy version for 100x speedup",
    content: "For production, use NumPy's optimized implementation. The pure Python version is good for learning but not for scale.",
    codeSnippet: `import numpy as np

def dot_numpy(a, b):
    return np.dot(np.array(a), np.array(b))

# Benchmark: 1M elements
# Pure Python: ~500ms
# NumPy: ~5ms`,
    createdAt: "2026-01-09T14:20:00Z",
    updatedAt: "2026-01-09T14:20:00Z",
    upvotes: 38,
    replyCount: 3,
    tags: ["numpy", "performance"],
  },
  {
    id: "thread-3",
    challengeSlug: "dot-product",
    userId: "user-3",
    userName: "Carol Davis",
    category: "question",
    title: "Why raise ValueError instead of returning 0?",
    content: "I'm confused about the error handling. Wouldn't it make sense to return 0 for mismatched vectors instead of raising an exception?",
    createdAt: "2026-01-08T09:15:00Z",
    updatedAt: "2026-01-08T11:30:00Z",
    upvotes: 15,
    replyCount: 4,
    isResolved: true,
    tags: ["best-practices", "error-handling"],
  },
  
  // bm25-from-scratch challenge
  {
    id: "thread-4",
    challengeSlug: "bm25-from-scratch",
    userId: "user-4",
    userName: "David Lee",
    category: "tip",
    title: "Common gotcha: IDF formula variations",
    content: "There are several IDF formula variations. The original BM25 uses `log((N - df + 0.5) / (df + 0.5))` but some implementations add +1 to avoid negative values. The tests here expect the +1 version.",
    createdAt: "2026-01-07T16:45:00Z",
    updatedAt: "2026-01-07T16:45:00Z",
    upvotes: 67,
    replyCount: 8,
    isPinned: true,
    tags: ["gotcha", "bm25", "idf"],
  },
  {
    id: "thread-5",
    challengeSlug: "bm25-from-scratch",
    userId: "user-5",
    userName: "Emma Wilson",
    category: "solution",
    title: "My BM25 implementation with detailed comments",
    content: "Here's my solution with extensive comments explaining each step. I found it helpful to break down the formula into components.",
    codeSnippet: `def bm25_score(query_terms, doc_terms, df, N, avgdl, k1=1.2, b=0.75):
    \"\"\"
    BM25 scoring function.
    
    The formula: sum over query terms of:
    IDF(t) * (TF(t,d) * (k1 + 1)) / (TF(t,d) + k1 * (1 - b + b * |d|/avgdl))
    
    Where:
    - IDF(t) = log((N - df(t) + 0.5) / (df(t) + 0.5) + 1)
    - TF(t,d) = term frequency in document
    - |d| = document length
    - avgdl = average document length
    \"\"\"
    doc_len = len(doc_terms)
    tf = Counter(doc_terms)
    
    score = 0.0
    for term in query_terms:
        if term not in tf:
            continue
            
        # IDF component
        term_df = df.get(term, 0)
        idf = math.log((N - term_df + 0.5) / (term_df + 0.5) + 1)
        
        # TF component with length normalization
        term_tf = tf[term]
        tf_norm = (term_tf * (k1 + 1)) / (term_tf + k1 * (1 - b + b * doc_len / avgdl))
        
        score += idf * tf_norm
    
    return score`,
    createdAt: "2026-01-06T11:20:00Z",
    updatedAt: "2026-01-06T11:20:00Z",
    upvotes: 89,
    replyCount: 12,
    tags: ["solution", "bm25", "detailed"],
  },
  
  // rrf-fusion challenge
  {
    id: "thread-6",
    challengeSlug: "rrf-fusion",
    userId: "user-6",
    userName: "Frank Garcia",
    category: "question",
    title: "Why k=60 as the default constant?",
    content: "The RRF formula uses k=60 as default. I've seen different values in different papers. What's the rationale behind 60?",
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-01-05T10:30:00Z",
    upvotes: 23,
    replyCount: 3,
    isResolved: true,
    tags: ["theory", "rrf"],
  },
  
  // cosine-similarity challenge  
  {
    id: "thread-7",
    challengeSlug: "cosine-similarity",
    userId: "user-7",
    userName: "Grace Kim",
    category: "bug_report",
    title: "Edge case: zero vector handling",
    content: "The tests don't explicitly check for zero vectors, but mathematically division by zero would occur. Should we handle this explicitly?",
    createdAt: "2026-01-04T15:30:00Z",
    updatedAt: "2026-01-04T18:00:00Z",
    upvotes: 31,
    replyCount: 6,
    tags: ["edge-case", "bug"],
  },
];

export const MOCK_REPLIES: DiscussionReply[] = [
  // Replies to thread-3 (ValueError question)
  {
    id: "reply-1",
    threadId: "thread-3",
    userId: "user-8",
    userName: "Henry Park",
    content: "Raising an error is the right approach because mismatched vectors indicate a bug in your code - the caller should fix it rather than silently getting wrong results.",
    createdAt: "2026-01-08T09:45:00Z",
    upvotes: 28,
    isAcceptedAnswer: true,
  },
  {
    id: "reply-2",
    threadId: "thread-3",
    userId: "user-9",
    userName: "Ivy Martinez",
    content: "Think about it from a debugging perspective. If dot([1,2,3], [4,5]) returned 0, you'd spend hours looking for the bug. An exception tells you immediately what's wrong.",
    createdAt: "2026-01-08T10:15:00Z",
    upvotes: 15,
  },
  
  // Replies to thread-6 (RRF k=60)
  {
    id: "reply-3",
    threadId: "thread-6",
    userId: "user-10",
    userName: "Jack Thompson",
    content: "k=60 was empirically determined in the original Cormack et al. paper. It provides good results across many datasets. That said, Weaviate uses k=1 by default and gets good results too - it depends on your data.",
    createdAt: "2026-01-05T08:30:00Z",
    upvotes: 45,
    isAcceptedAnswer: true,
  },
];

/**
 * Get threads for a challenge.
 */
export function getThreadsForChallenge(slug: string): DiscussionThread[] {
  return MOCK_THREADS
    .filter(t => t.challengeSlug === slug)
    .sort((a, b) => {
      // Pinned first, then by upvotes
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.upvotes - a.upvotes;
    });
}

/**
 * Get replies for a thread.
 */
export function getRepliesForThread(threadId: string): DiscussionReply[] {
  return MOCK_REPLIES
    .filter(r => r.threadId === threadId)
    .sort((a, b) => {
      // Accepted answer first, then by upvotes
      if (a.isAcceptedAnswer && !b.isAcceptedAnswer) return -1;
      if (!a.isAcceptedAnswer && b.isAcceptedAnswer) return 1;
      return b.upvotes - a.upvotes;
    });
}

/**
 * Get discussion stats for a challenge.
 */
export function getDiscussionStats(slug: string): { threads: number; replies: number } {
  const threads = MOCK_THREADS.filter(t => t.challengeSlug === slug);
  const threadIds = new Set(threads.map(t => t.id));
  const replies = MOCK_REPLIES.filter(r => threadIds.has(r.threadId));
  
  return {
    threads: threads.length,
    replies: replies.length,
  };
}
