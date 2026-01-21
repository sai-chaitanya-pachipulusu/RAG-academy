"use client";

import { useState } from "react";
import { 
  getThreadsForChallenge, 
  getRepliesForThread,
  getDiscussionStats,
} from "@/lib/discussions/mockData";
import type { DiscussionThread, DiscussionReply, DiscussionCategory } from "@/lib/discussions/types";
import { Card } from "@/components/ui/Card";

const CATEGORY_STYLES: Record<DiscussionCategory, { label: string; color: string; icon: string }> = {
  question: { label: "Question", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: "❓" },
  solution: { label: "Solution", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: "✅" },
  optimization: { label: "Optimization", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: "⚡" },
  bug_report: { label: "Bug Report", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: "🐛" },
  tip: { label: "Tip", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: "💡" },
  general: { label: "General", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", icon: "💬" },
};

function ThreadCard({ 
  thread, 
  onSelect 
}: { 
  thread: DiscussionThread; 
  onSelect: (t: DiscussionThread) => void;
}) {
  const categoryStyle = CATEGORY_STYLES[thread.category];
  
  return (
    <button
      onClick={() => onSelect(thread)}
      className="w-full text-left rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
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
          
          <h3 className="font-medium text-zinc-900 dark:text-white line-clamp-1">
            {thread.title}
          </h3>
          
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
            {thread.content}
          </p>
          
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
            <span>{thread.userName}</span>
            <span>•</span>
            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{thread.replyCount} replies</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1 text-center">
          <button 
            className="text-lg hover:scale-110 transition-transform"
            onClick={(e) => { e.stopPropagation(); }}
          >
            ▲
          </button>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {thread.upvotes}
          </span>
        </div>
      </div>
      
      {thread.tags.length > 0 && (
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

function ThreadDetail({ 
  thread, 
  onBack 
}: { 
  thread: DiscussionThread; 
  onBack: () => void;
}) {
  const replies = getRepliesForThread(thread.id);
  const categoryStyle = CATEGORY_STYLES[thread.category];
  
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        ← Back to discussions
      </button>
      
      {/* Main thread */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle.color}`}>
                {categoryStyle.icon} {categoryStyle.label}
              </span>
              {thread.isResolved && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  ✓ Resolved
                </span>
              )}
            </div>
            
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {thread.title}
            </h2>
            
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{thread.userName}</span>
              <span>•</span>
              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <button className="text-xl hover:scale-110 transition-transform">▲</button>
            <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{thread.upvotes}</span>
            <button className="text-xl hover:scale-110 transition-transform text-zinc-400">▼</button>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
          {thread.content}
        </div>
        
        {thread.codeSnippet && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100">
            <code>{thread.codeSnippet}</code>
          </pre>
        )}
        
        {thread.tags.length > 0 && (
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
      </Card>
      
      {/* Replies */}
      <div>
        <h3 className="mb-3 font-medium text-zinc-900 dark:text-white">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h3>
        
        {replies.length === 0 ? (
          <Card className="p-4 text-center text-sm text-zinc-500">
            No replies yet. Be the first to contribute!
          </Card>
        ) : (
          <div className="space-y-3">
            {replies.map(reply => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
      
      {/* Reply form placeholder */}
      <Card className="p-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          💬 Sign in to post a reply
        </p>
      </Card>
    </div>
  );
}

function ReplyCard({ reply }: { reply: DiscussionReply }) {
  return (
    <Card className={`p-4 ${reply.isAcceptedAnswer ? "border-green-300 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {reply.isAcceptedAnswer && (
            <span className="mb-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              ✓ Accepted Answer
            </span>
          )}
          
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{reply.userName}</span>
            <span>•</span>
            <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {reply.content}
          </div>
          
          {reply.codeSnippet && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-sm text-zinc-100">
              <code>{reply.codeSnippet}</code>
            </pre>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <button className="text-sm hover:scale-110 transition-transform">▲</button>
          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{reply.upvotes}</span>
        </div>
      </div>
    </Card>
  );
}

interface Props {
  challengeSlug: string;
}

export function ChallengeDiscussions({ challengeSlug }: Props) {
  const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);
  const [filter, setFilter] = useState<DiscussionCategory | "all">("all");
  
  const allThreads = getThreadsForChallenge(challengeSlug);
  const threads = filter === "all" 
    ? allThreads 
    : allThreads.filter(t => t.category === filter);
  const stats = getDiscussionStats(challengeSlug);
  
  if (selectedThread) {
    return <ThreadDetail thread={selectedThread} onBack={() => setSelectedThread(null)} />;
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-white">Discussions</h2>
          <p className="text-sm text-zinc-500">
            {stats.threads} threads • {stats.replies} replies
          </p>
        </div>
        
        <button className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          + New Thread
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            filter === "all" 
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          All
        </button>
        {Object.entries(CATEGORY_STYLES).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilter(key as DiscussionCategory)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === key 
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>
      
      {/* Thread list */}
      {threads.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-zinc-500">No discussions yet.</p>
          <p className="mt-1 text-sm text-zinc-400">Be the first to start a conversation!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <ThreadCard 
              key={thread.id} 
              thread={thread} 
              onSelect={setSelectedThread}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Compact discussion preview for the challenge page.
 */
export function DiscussionPreview({ challengeSlug }: { challengeSlug: string }) {
  const threads = getThreadsForChallenge(challengeSlug).slice(0, 3);
  const stats = getDiscussionStats(challengeSlug);
  
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
          {stats.threads} threads
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
      
      <button className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
        View all discussions →
      </button>
    </Card>
  );
}
