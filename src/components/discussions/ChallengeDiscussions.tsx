"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { DiscussionCategory } from "@/lib/discussions/types";
import type { ThreadWithAuthor, ReplyWithAuthor, SortOption } from "@/lib/supabase/discussions";
import {
  getThreads,
  getThread,
  createThread,
  createReply,
  voteThread,
  voteReply,
  markAsResolved,
  acceptAnswer,
  subscribeToThreads,
  subscribeToReplies,
  getDiscussionStats,
} from "@/lib/supabase/discussions";
import { getSupabase } from "@/lib/supabase/client";
import { ThreadCard } from "./ThreadCard";
import { ThreadDetail } from "./ThreadDetail";
import { CreateThreadForm } from "./CreateThreadForm";

const CATEGORY_STYLES: Record<DiscussionCategory | "all", { label: string; color: string; icon: string }> = {
  all: { label: "All", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: "📋" },
  question: { label: "Question", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: "❓" },
  solution: { label: "Solution", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: "✅" },
  optimization: { label: "Optimization", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: "⚡" },
  bug_report: { label: "Bug Report", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: "🐛" },
  tip: { label: "Tip", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: "💡" },
  general: { label: "General", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: "💬" },
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most_voted", label: "Most Voted" },
  { value: "most_replied", label: "Most Replied" },
];

interface ChallengeDiscussionsProps {
  challengeSlug: string;
}

export function ChallengeDiscussions({ challengeSlug }: ChallengeDiscussionsProps) {
  // State
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadWithAuthor | null>(null);
  const [selectedReplies, setSelectedReplies] = useState<ReplyWithAuthor[]>([]);
  const [filter, setFilter] = useState<DiscussionCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ totalThreads: 0, totalReplies: 0 });
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  
  const { addToast } = useToast();
  const threadsSubscriptionRef = useRef<ReturnType<typeof subscribeToThreads> | null>(null);
  const repliesSubscriptionRef = useRef<ReturnType<typeof subscribeToReplies> | null>(null);

  // Get current user
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    
    supabase.auth.getUser().then(({ data }: { data: { user?: { id: string } | null } }) => {
      setCurrentUserId(data.user?.id);
    });
  }, []);

  // Load threads
  const loadThreads = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const result = await getThreads(challengeSlug, {
        category: filter,
        sort,
        page: pageNum,
        limit: 20,
      });
      
      if (append) {
        setThreads(prev => [...prev, ...result.threads]);
      } else {
        setThreads(result.threads);
      }
      
      setHasMore(result.hasMore);
      setStats(prev => ({ ...prev, totalThreads: result.total }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discussions");
      addToast("Failed to load discussions", "error");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [challengeSlug, filter, sort, addToast]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const result = await getDiscussionStats(challengeSlug);
      setStats(result);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, [challengeSlug]);

  // Initial load
  useEffect(() => {
    loadThreads(1, false);
    loadStats();
    setPage(1);
  }, [loadThreads, loadStats]);

  // Subscribe to thread changes
  useEffect(() => {
    try {
      const subscription = subscribeToThreads(challengeSlug, (change) => {
        if (change.type === "INSERT") {
          setThreads(prev => {
            // Check if thread already exists
            if (prev.some(t => t.id === change.thread.id)) return prev;
            
            // Add new thread and re-sort
            const newThreads = [change.thread, ...prev];
            return sortThreads(newThreads, sort);
          });
          setStats(prev => ({ ...prev, totalThreads: prev.totalThreads + 1 }));
          addToast("New discussion posted!", "info");
        } else if (change.type === "UPDATE") {
          setThreads(prev => 
            prev.map(t => t.id === change.thread.id ? change.thread : t)
          );
          // Update selected thread if it's the one being updated
          if (selectedThread?.id === change.thread.id) {
            setSelectedThread(change.thread);
          }
        } else if (change.type === "DELETE") {
          setThreads(prev => prev.filter(t => t.id !== change.thread.id));
          setStats(prev => ({ ...prev, totalThreads: Math.max(0, prev.totalThreads - 1) }));
        }
      });
      
      threadsSubscriptionRef.current = subscription;
    } catch (err) {
      console.error("Failed to subscribe to threads:", err);
    }
    
    return () => {
      threadsSubscriptionRef.current?.unsubscribe();
    };
  }, [challengeSlug, sort, addToast, selectedThread?.id]);

  // Subscribe to reply changes when a thread is selected
  useEffect(() => {
    if (!selectedThread) {
      repliesSubscriptionRef.current?.unsubscribe();
      return;
    }
    
    try {
      const subscription = subscribeToReplies(selectedThread.id, (change) => {
        if (change.type === "INSERT") {
          setSelectedReplies(prev => {
            if (prev.some(r => r.id === change.reply.id)) return prev;
            return sortReplies([...prev, change.reply]);
          });
          // Update reply count on thread
          setSelectedThread(prev => prev ? { ...prev, replyCount: prev.replyCount + 1 } : null);
          setStats(prev => ({ ...prev, totalReplies: prev.totalReplies + 1 }));
          addToast("New reply posted!", "info");
        } else if (change.type === "UPDATE") {
          setSelectedReplies(prev => 
            prev.map(r => r.id === change.reply.id ? change.reply : r)
          );
        } else if (change.type === "DELETE") {
          setSelectedReplies(prev => prev.filter(r => r.id !== change.reply.id));
          setSelectedThread(prev => prev ? { ...prev, replyCount: Math.max(0, prev.replyCount - 1) } : null);
          setStats(prev => ({ ...prev, totalReplies: Math.max(0, prev.totalReplies - 1) }));
        }
      });
      
      repliesSubscriptionRef.current = subscription;
    } catch (err) {
      console.error("Failed to subscribe to replies:", err);
    }
    
    return () => {
      repliesSubscriptionRef.current?.unsubscribe();
    };
  }, [selectedThread?.id, addToast]);

  // Load replies when thread is selected
  const handleSelectThread = useCallback(async (thread: ThreadWithAuthor) => {
    setSelectedThread(thread);
    setIsLoadingReplies(true);
    
    try {
      const { replies } = await getThread(thread.id);
      setSelectedReplies(replies);
    } catch (err) {
      addToast("Failed to load thread", "error");
    } finally {
      setIsLoadingReplies(false);
    }
  }, [addToast]);

  // Handle create thread
  const handleCreateThread = async (data: {
    category: DiscussionCategory;
    title: string;
    content: string;
    codeSnippet?: string;
  }) => {
    const newThread = await createThread({
      ...data,
      challengeSlug,
    });
    
    setThreads(prev => [newThread, ...prev]);
    setShowCreateForm(false);
    setStats(prev => ({ ...prev, totalThreads: prev.totalThreads + 1 }));
  };

  // Handle create reply
  const handleCreateReply = async (data: { content: string; codeSnippet?: string }) => {
    if (!selectedThread) return;
    
    await createReply({
      threadId: selectedThread.id,
      ...data,
    });
    
    // Reply will be added via real-time subscription
  };

  // Handle vote thread
  const handleVoteThread = async (threadId: string, voteType: 1 | -1 | 0) => {
    await voteThread(threadId, voteType);
    // Vote will be updated via real-time subscription
  };

  // Handle vote reply
  const handleVoteReply = async (replyId: string, voteType: 1 | -1 | 0) => {
    await voteReply(replyId, voteType);
    // Vote will be updated via real-time subscription
  };

  // Handle accept answer
  const handleAcceptAnswer = async (replyId: string, threadId: string) => {
    await acceptAnswer(replyId, threadId);
    // Will be updated via real-time subscription
  };

  // Handle mark resolved
  const handleMarkResolved = async (threadId: string, resolved: boolean) => {
    await markAsResolved(threadId, resolved);
    // Will be updated via real-time subscription
  };

  // Load more threads
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadThreads(nextPage, true);
  };

  // Sort threads helper
  const sortThreads = (threadsToSort: ThreadWithAuthor[], sortBy: SortOption): ThreadWithAuthor[] => {
    return [...threadsToSort].sort((a, b) => {
      // Pinned always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      switch (sortBy) {
        case "most_voted":
          return b.upvotes - a.upvotes;
        case "most_replied":
          return b.replyCount - a.replyCount;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  // Sort replies helper
  const sortReplies = (replies: ReplyWithAuthor[]): ReplyWithAuthor[] => {
    return [...replies].sort((a, b) => {
      // Accepted answer always first
      if (a.isAcceptedAnswer && !b.isAcceptedAnswer) return -1;
      if (!a.isAcceptedAnswer && b.isAcceptedAnswer) return 1;
      // Then by upvotes
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes;
      }
      // Then by date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  // Render thread detail view
  if (selectedThread) {
    return (
      <ThreadDetail
        thread={selectedThread}
        replies={selectedReplies}
        currentUserId={currentUserId}
        onBack={() => setSelectedThread(null)}
        onReply={handleCreateReply}
        onVoteThread={handleVoteThread}
        onVoteReply={handleVoteReply}
        onAcceptAnswer={handleAcceptAnswer}
        onMarkResolved={handleMarkResolved}
        isLoading={isLoadingReplies}
      />
    );
  }

  // Render create form
  if (showCreateForm) {
    return (
      <CreateThreadForm
        challengeSlug={challengeSlug}
        onSubmit={handleCreateThread}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  // Render thread list
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Discussions</h2>
          <p className="text-sm text-zinc-500">
            {stats.totalThreads} threads • {stats.totalReplies} replies
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Thread
        </button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_STYLES) as Array<DiscussionCategory | "all">).map((key) => {
            const style = CATEGORY_STYLES[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {style.icon} {style.label}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => loadThreads(1, false)}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Try again
          </button>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <svg className="h-6 w-6 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="ml-2 text-sm text-zinc-500">Loading discussions...</span>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && threads.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-zinc-500">No discussions yet.</p>
          <p className="mt-1 text-sm text-zinc-400">Be the first to start a conversation!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Start a Discussion
          </button>
        </Card>
      )}

      {/* Thread List */}
      {!isLoading && !error && threads.length > 0 && (
        <div className="space-y-3">
          {threads.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onSelect={(t) => handleSelectThread(t as ThreadWithAuthor)}
              onVote={handleVoteThread}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {!isLoading && !error && hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {isLoadingMore ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Discussion Preview (for challenge page)
// ============================================

interface DiscussionPreviewProps {
  challengeSlug: string;
}

export function DiscussionPreview({ challengeSlug }: DiscussionPreviewProps) {
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([]);
  const [stats, setStats] = useState({ totalThreads: 0, totalReplies: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true);
        const [threadsResult, statsResult] = await Promise.all([
          getThreads(challengeSlug, { page: 1, limit: 3 }),
          getDiscussionStats(challengeSlug),
        ]);
        setThreads(threadsResult.threads);
        setStats(statsResult);
      } catch (err) {
        console.error("Failed to load discussion preview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [challengeSlug]);

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <svg className="h-5 w-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </Card>
    );
  }

  if (threads.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-zinc-900 dark:text-white">
          💬 Community Discussions
        </h3>
        <span className="text-xs text-zinc-500">
          {stats.totalThreads} threads
        </span>
      </div>

      <div className="space-y-2">
        {threads.map(thread => {
          const categoryStyle = CATEGORY_STYLES[thread.category];
          return (
            <div
              key={thread.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs">{categoryStyle.icon}</span>
                <span className="truncate text-zinc-700 dark:text-zinc-300">
                  {thread.title}
                </span>
              </div>
              <span className="shrink-0 text-xs text-zinc-500">
                ▲{thread.upvotes}
              </span>
            </div>
          );
        })}
      </div>

      <a
        href={`/challenges/${challengeSlug}/discussions`}
        className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        View all discussions →
      </a>
    </Card>
  );
}
