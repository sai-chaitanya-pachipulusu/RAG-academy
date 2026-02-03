"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { DiscussionThread, DiscussionCategory } from "@/lib/discussions/types";
import type { ThreadWithAuthor } from "@/lib/supabase/discussions";

const CATEGORY_STYLES: Record<DiscussionCategory, { label: string; color: string; icon: string }> = {
  question: { label: "Question", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: "❓" },
  solution: { label: "Solution", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: "✅" },
  optimization: { label: "Optimization", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: "⚡" },
  bug_report: { label: "Bug Report", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: "🐛" },
  tip: { label: "Tip", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: "💡" },
  general: { label: "General", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: "💬" },
};

interface ThreadCardProps {
  thread: ThreadWithAuthor | DiscussionThread;
  onSelect: (thread: ThreadWithAuthor | DiscussionThread) => void;
  onVote?: (threadId: string, voteType: 1 | -1 | 0) => Promise<void>;
  showActions?: boolean;
}

export function ThreadCard({ thread, onSelect, onVote, showActions = true }: ThreadCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVotes, setOptimisticVotes] = useState<number | null>(null);
  const [optimisticUserVote, setOptimisticUserVote] = useState<number | null>(null);
  const { addToast } = useToast();

  const categoryStyle = CATEGORY_STYLES[thread.category];
  const displayVotes = optimisticVotes ?? thread.upvotes;
  const displayUserVote = optimisticUserVote ?? (thread as ThreadWithAuthor).userVote ?? 0;

  const handleVote = async (e: React.MouseEvent, voteType: 1 | -1) => {
    e.stopPropagation();
    
    if (!onVote || isVoting) return;
    
    // Calculate new vote state
    const newVote = displayUserVote === voteType ? 0 : voteType;
    const voteDelta = newVote - displayUserVote;
    
    // Optimistic update
    setOptimisticVotes(displayVotes + voteDelta);
    setOptimisticUserVote(newVote);
    setIsVoting(true);
    
    try {
      await onVote(thread.id, newVote);
    } catch (error) {
      // Revert on error
      setOptimisticVotes(null);
      setOptimisticUserVote(null);
      addToast("Failed to vote", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={() => onSelect(thread)}
      className="w-full text-left rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {thread.isPinned && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                📌 Pinned
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryStyle.color}`}>
              {categoryStyle.icon} {categoryStyle.label}
            </span>
            {thread.isResolved && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                ✓ Resolved
              </span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-1">
            {thread.title}
          </h3>
          
          {/* Content Preview */}
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {thread.content}
          </p>
          
          {/* Meta Info */}
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{thread.userName}</span>
            <span>•</span>
            <span>{formatDate(thread.createdAt)}</span>
            <span>•</span>
            <span>{thread.replyCount} replies</span>
          </div>
        </div>
        
        {/* Vote Buttons */}
        {showActions && onVote && (
          <div className="flex flex-col items-center gap-1 text-center">
            <button 
              className={`text-lg hover:scale-110 transition-transform ${
                displayUserVote === 1 ? "text-orange-500" : "text-zinc-400 hover:text-zinc-600"
              } ${isVoting ? "opacity-50" : ""}`}
              onClick={(e) => handleVote(e, 1)}
              disabled={isVoting}
            >
              ▲
            </button>
            <span className={`text-sm font-semibold ${
              displayUserVote !== 0 ? "text-orange-600 dark:text-orange-400" : "text-zinc-700 dark:text-zinc-300"
            }`}>
              {displayVotes}
            </span>
            <button 
              className={`text-lg hover:scale-110 transition-transform ${
                displayUserVote === -1 ? "text-indigo-500" : "text-zinc-400 hover:text-zinc-600"
              } ${isVoting ? "opacity-50" : ""}`}
              onClick={(e) => handleVote(e, -1)}
              disabled={isVoting}
            >
              ▼
            </button>
          </div>
        )}
        
        {/* Read-only vote display */}
        {!showActions && (
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-xs text-zinc-400">▲</span>
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {displayVotes}
            </span>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {thread.tags.map(tag => (
            <span 
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
