"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { DiscussionThread, DiscussionReply, DiscussionCategory } from "@/lib/discussions/types";
import type { ThreadWithAuthor, ReplyWithAuthor } from "@/lib/supabase/discussions";
import { ReplyForm } from "./ReplyForm";

const CATEGORY_STYLES: Record<DiscussionCategory, { label: string; color: string; icon: string }> = {
  question: { label: "Question", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: "❓" },
  solution: { label: "Solution", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: "✅" },
  optimization: { label: "Optimization", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: "⚡" },
  bug_report: { label: "Bug Report", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: "🐛" },
  tip: { label: "Tip", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: "💡" },
  general: { label: "General", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: "💬" },
};

interface ThreadDetailProps {
  thread: ThreadWithAuthor | DiscussionThread;
  replies: (ReplyWithAuthor | DiscussionReply)[];
  currentUserId?: string;
  onBack: () => void;
  onReply: (data: { content: string; codeSnippet?: string }) => Promise<void>;
  onVoteThread?: (threadId: string, voteType: 1 | -1 | 0) => Promise<void>;
  onVoteReply?: (replyId: string, voteType: 1 | -1 | 0) => Promise<void>;
  onAcceptAnswer?: (replyId: string, threadId: string) => Promise<void>;
  onMarkResolved?: (threadId: string, resolved: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function ThreadDetail({
  thread,
  replies,
  currentUserId,
  onBack,
  onReply,
  onVoteThread,
  onVoteReply,
  onAcceptAnswer,
  onMarkResolved,
  isLoading = false,
}: ThreadDetailProps) {
  const { addToast } = useToast();
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const categoryStyle = CATEGORY_STYLES[thread.category];
  const isThreadAuthor = currentUserId === thread.userId;

  const handleReply = async (data: { content: string; codeSnippet?: string }) => {
    setIsSubmittingReply(true);
    try {
      await onReply(data);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to discussions
      </button>
      
      {/* Main Thread */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Category & Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle.color}`}>
                {categoryStyle.icon} {categoryStyle.label}
              </span>
              {thread.isResolved && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  ✓ Resolved
                </span>
              )}
              {thread.isPinned && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  📌 Pinned
                </span>
              )}
            </div>
            
            {/* Title */}
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {thread.title}
            </h2>
            
            {/* Author & Date */}
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{thread.userName}</span>
              <span>•</span>
              <span>{formatDate(thread.createdAt)}</span>
            </div>
          </div>
          
          {/* Vote Buttons */}
          {onVoteThread && (
            <VoteButtons
              item={thread as ThreadWithAuthor}
              onVote={(voteType) => onVoteThread(thread.id, voteType)}
            />
          )}
        </div>
        
        {/* Content */}
        <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
          {thread.content}
        </div>
        
        {/* Code Snippet */}
        {thread.codeSnippet && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
            <code>{thread.codeSnippet}</code>
          </pre>
        )}
        
        {/* Tags */}
        {thread.tags && thread.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {thread.tags.map(tag => (
              <span 
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Thread Actions (for author) */}
        {isThreadAuthor && onMarkResolved && (
          <div className="mt-4 flex items-center gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => onMarkResolved(thread.id, !thread.isResolved)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                thread.isResolved
                  ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              {thread.isResolved ? "Mark Unresolved" : "✓ Mark as Resolved"}
            </button>
          </div>
        )}
      </Card>
      
      {/* Replies Section */}
      <div>
        <h3 className="mb-3 font-medium text-zinc-900 dark:text-white">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h3>
        
        {isLoading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <svg className="h-6 w-6 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="ml-2 text-sm text-zinc-500">Loading replies...</span>
            </div>
          </Card>
        ) : replies.length === 0 ? (
          <Card className="p-4 text-center text-sm text-zinc-500">
            No replies yet. Be the first to contribute!
          </Card>
        ) : (
          <div className="space-y-3">
            {replies.map(reply => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                thread={thread}
                currentUserId={currentUserId}
                onVote={onVoteReply}
                onAcceptAnswer={onAcceptAnswer}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Reply Form */}
      {currentUserId ? (
        <ReplyForm
          threadId={thread.id}
          onSubmit={handleReply}
          placeholder="Share your thoughts..."
        />
      ) : (
        <Card className="p-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            💬 Sign in to post a reply
          </p>
        </Card>
      )}
    </div>
  );
}

// ============================================
// Reply Card Component
// ============================================

interface ReplyCardProps {
  reply: ReplyWithAuthor | DiscussionReply;
  thread: ThreadWithAuthor | DiscussionThread;
  currentUserId?: string;
  onVote?: (replyId: string, voteType: 1 | -1 | 0) => Promise<void>;
  onAcceptAnswer?: (replyId: string, threadId: string) => Promise<void>;
}

function ReplyCard({ reply, thread, currentUserId, onVote, onAcceptAnswer }: ReplyCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVotes, setOptimisticVotes] = useState<number | null>(null);
  const [optimisticUserVote, setOptimisticUserVote] = useState<number | null>(null);
  const { addToast } = useToast();

  const isThreadAuthor = currentUserId === thread.userId;
  const isReplyAuthor = currentUserId === reply.userId;
  const displayVotes = optimisticVotes ?? reply.upvotes;
  const displayUserVote = optimisticUserVote ?? (reply as ReplyWithAuthor).userVote ?? 0;

  const handleVote = async (voteType: 1 | -1) => {
    if (!onVote || isVoting) return;
    
    const newVote = displayUserVote === voteType ? 0 : voteType;
    const voteDelta = newVote - displayUserVote;
    
    setOptimisticVotes(displayVotes + voteDelta);
    setOptimisticUserVote(newVote);
    setIsVoting(true);
    
    try {
      await onVote(reply.id, newVote);
    } catch (error) {
      setOptimisticVotes(null);
      setOptimisticUserVote(null);
      addToast("Failed to vote", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const handleAccept = async () => {
    if (!onAcceptAnswer) return;
    try {
      await onAcceptAnswer(reply.id, thread.id);
      addToast("Answer accepted!", "success");
    } catch (error) {
      addToast("Failed to accept answer", "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={`p-4 ${reply.isAcceptedAnswer ? "border-green-300 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Accepted Answer Badge */}
          {reply.isAcceptedAnswer && (
            <span className="mb-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              ✓ Accepted Answer
            </span>
          )}
          
          {/* Author & Date */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{reply.userName}</span>
            <span>•</span>
            <span>{formatDate(reply.createdAt)}</span>
            {isReplyAuthor && (
              <>
                <span>•</span>
                <span className="text-xs text-zinc-400">(you)</span>
              </>
            )}
          </div>
          
          {/* Content */}
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {reply.content}
          </div>
          
          {/* Code Snippet */}
          {reply.codeSnippet && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-sm text-zinc-100">
              <code>{reply.codeSnippet}</code>
            </pre>
          )}

          {/* Accept Answer Button (for thread author) */}
          {isThreadAuthor && onAcceptAnswer && !reply.isAcceptedAnswer && (
            <button
              onClick={handleAccept}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accept as Answer
            </button>
          )}
        </div>
        
        {/* Vote Buttons */}
        {onVote && (
          <div className="flex flex-col items-center gap-1">
            <button 
              className={`text-sm hover:scale-110 transition-transform ${
                displayUserVote === 1 ? "text-orange-500" : "text-zinc-400 hover:text-zinc-600"
              } ${isVoting ? "opacity-50" : ""}`}
              onClick={() => handleVote(1)}
              disabled={isVoting}
            >
              ▲
            </button>
            <span className={`text-sm font-semibold ${
              displayUserVote !== 0 ? "text-orange-600 dark:text-orange-400" : "text-zinc-600 dark:text-zinc-400"
            }`}>
              {displayVotes}
            </span>
            <button 
              className={`text-sm hover:scale-110 transition-transform ${
                displayUserVote === -1 ? "text-indigo-500" : "text-zinc-400 hover:text-zinc-600"
              } ${isVoting ? "opacity-50" : ""}`}
              onClick={() => handleVote(-1)}
              disabled={isVoting}
            >
              ▼
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// Vote Buttons Component
// ============================================

interface VoteButtonsProps {
  item: ThreadWithAuthor | ReplyWithAuthor;
  onVote: (voteType: 1 | -1 | 0) => Promise<void>;
}

function VoteButtons({ item, onVote }: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [optimisticVotes, setOptimisticVotes] = useState<number | null>(null);
  const [optimisticUserVote, setOptimisticUserVote] = useState<number | null>(null);
  const { addToast } = useToast();

  const displayVotes = optimisticVotes ?? item.upvotes;
  const displayUserVote = optimisticUserVote ?? item.userVote ?? 0;

  const handleVote = async (voteType: 1 | -1) => {
    const newVote = displayUserVote === voteType ? 0 : voteType;
    const voteDelta = newVote - displayUserVote;
    
    setOptimisticVotes(displayVotes + voteDelta);
    setOptimisticUserVote(newVote);
    setIsVoting(true);
    
    try {
      await onVote(newVote);
    } catch (error) {
      setOptimisticVotes(null);
      setOptimisticUserVote(null);
      addToast("Failed to vote", "error");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button 
        className={`text-xl hover:scale-110 transition-transform ${
          displayUserVote === 1 ? "text-orange-500" : "text-zinc-400 hover:text-zinc-600"
        } ${isVoting ? "opacity-50" : ""}`}
        onClick={() => handleVote(1)}
        disabled={isVoting}
      >
        ▲
      </button>
      <span className={`text-lg font-bold ${
        displayUserVote !== 0 ? "text-orange-600 dark:text-orange-400" : "text-zinc-700 dark:text-zinc-300"
      }`}>
        {displayVotes}
      </span>
      <button 
        className={`text-xl hover:scale-110 transition-transform ${
          displayUserVote === -1 ? "text-indigo-500" : "text-zinc-400 hover:text-zinc-600"
        } ${isVoting ? "opacity-50" : ""}`}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
      >
        ▼
      </button>
    </div>
  );
}
