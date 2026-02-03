/**
 * Discussions API Layer
 * 
 * Provides functions for interacting with discussion_threads, discussion_replies,
 * and discussion_votes tables in Supabase. Includes real-time subscriptions.
 */

import { requireSupabase, getSupabase } from "./client";
import type { DiscussionThread, DiscussionReply, DiscussionCategory } from "@/lib/discussions/types";

// ============================================
// Types
// ============================================

export interface ThreadWithAuthor extends DiscussionThread {
  author: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      name?: string;
      avatar_url?: string;
    };
  };
  userVote?: number; // -1, 0, or 1
}

export interface ReplyWithAuthor extends DiscussionReply {
  author: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      name?: string;
      avatar_url?: string;
    };
  };
  userVote?: number; // -1, 0, or 1
}

export interface CreateThreadInput {
  challengeSlug: string;
  category: DiscussionCategory;
  title: string;
  content: string;
  codeSnippet?: string;
}

export interface CreateReplyInput {
  threadId: string;
  content: string;
  codeSnippet?: string;
}

export type SortOption = "newest" | "most_voted" | "most_replied";

// ============================================
// Thread Operations
// ============================================

/**
 * Create a new discussion thread
 */
export async function createThread(input: CreateThreadInput): Promise<ThreadWithAuthor> {
  const supabase = requireSupabase();
  
  const { data, error } = await supabase
    .from("discussion_threads")
    .insert({
      challenge_slug: input.challengeSlug,
      category: input.category,
      title: input.title,
      content: input.content,
      code_snippet: input.codeSnippet || null,
    })
    .select(`
      *,
      author:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single();
  
  if (error) throw error;
  return transformThread(data);
}

/**
 * Get threads for a challenge with pagination and sorting
 */
export async function getThreads(
  challengeSlug: string,
  options: {
    category?: DiscussionCategory | "all";
    sort?: SortOption;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ threads: ThreadWithAuthor[]; hasMore: boolean; total: number }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not available");
  
  const { category = "all", sort = "newest", page = 1, limit = 20 } = options;
  
  // Build base query
  let query = supabase
    .from("discussion_threads")
    .select("*, author:user_id (id, email, raw_user_meta_data)", { count: "exact" })
    .eq("challenge_slug", challengeSlug);
  
  // Apply category filter
  if (category !== "all") {
    query = query.eq("category", category);
  }
  
  // Apply sorting
  switch (sort) {
    case "most_voted":
      query = query.order("upvotes", { ascending: false });
      break;
    case "most_replied":
      query = query.order("reply_count", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }
  
  // Add secondary sort by pinned
  query = query.order("is_pinned", { ascending: false });
  
  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  // Get current user's votes if authenticated
  const threads = await enrichWithUserVotes(data || []);
  
  return {
    threads,
    hasMore: count ? from + threads.length < count : false,
    total: count || 0,
  };
}

/**
 * Get a single thread with its replies
 */
export async function getThread(
  threadId: string
): Promise<{ thread: ThreadWithAuthor; replies: ReplyWithAuthor[] }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not available");
  
  // Get thread
  const { data: thread, error: threadError } = await supabase
    .from("discussion_threads")
    .select(`
      *,
      author:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq("id", threadId)
    .single();
  
  if (threadError) throw threadError;
  
  // Get replies
  const { data: replies, error: repliesError } = await supabase
    .from("discussion_replies")
    .select(`
      *,
      author:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq("thread_id", threadId)
    .order("is_accepted_answer", { ascending: false })
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: true });
  
  if (repliesError) throw repliesError;
  
  // Enrich with user votes
  const enrichedThread = await enrichWithUserVotes([transformThread(thread)]);
  const enrichedReplies = await enrichRepliesWithUserVotes(replies?.map(transformReply) || []);
  
  return {
    thread: enrichedThread[0],
    replies: enrichedReplies,
  };
}

/**
 * Update a thread
 */
export async function updateThread(
  threadId: string,
  updates: Partial<Pick<CreateThreadInput, "title" | "content" | "codeSnippet">>
): Promise<ThreadWithAuthor> {
  const supabase = requireSupabase();
  
  const { data, error } = await supabase
    .from("discussion_threads")
    .update({
      title: updates.title,
      content: updates.content,
      code_snippet: updates.codeSnippet,
    })
    .eq("id", threadId)
    .select(`
      *,
      author:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single();
  
  if (error) throw error;
  return transformThread(data);
}

/**
 * Delete a thread
 */
export async function deleteThread(threadId: string): Promise<void> {
  const supabase = requireSupabase();
  
  const { error } = await supabase
    .from("discussion_threads")
    .delete()
    .eq("id", threadId);
  
  if (error) throw error;
}

// ============================================
// Reply Operations
// ============================================

/**
 * Create a reply to a thread
 */
export async function createReply(input: CreateReplyInput): Promise<ReplyWithAuthor> {
  const supabase = requireSupabase();
  
  const { data, error } = await supabase
    .from("discussion_replies")
    .insert({
      thread_id: input.threadId,
      content: input.content,
      code_snippet: input.codeSnippet || null,
    })
    .select(`
      *,
      author:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single();
  
  if (error) throw error;
  return transformReply(data);
}

/**
 * Update a reply
 */
export async function updateReply(
  replyId: string,
  updates: Partial<Pick<CreateReplyInput, "content" | "codeSnippet">>
): Promise<ReplyWithAuthor> {
  const supabase = requireSupabase();
  
  const { data, error } = await supabase
    .from("discussion_replies")
    .update({
      content: updates.content,
      code_snippet: updates.codeSnippet,
    })
    .eq("id", replyId)
    .select(`
      *,
      author:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .single();
  
  if (error) throw error;
  return transformReply(data);
}

/**
 * Delete a reply
 */
export async function deleteReply(replyId: string): Promise<void> {
  const supabase = requireSupabase();
  
  const { error } = await supabase
    .from("discussion_replies")
    .delete()
    .eq("id", replyId);
  
  if (error) throw error;
}

// ============================================
// Vote Operations
// ============================================

/**
 * Vote on a thread (1 for upvote, -1 for downvote, 0 to remove vote)
 */
export async function voteThread(threadId: string, voteType: 1 | -1 | 0): Promise<void> {
  const supabase = requireSupabase();
  
  if (voteType === 0) {
    // Remove vote
    const { error } = await supabase
      .from("discussion_votes")
      .delete()
      .eq("thread_id", threadId);
    
    if (error) throw error;
  } else {
    // Upsert vote
    const { error } = await supabase
      .from("discussion_votes")
      .upsert(
        { thread_id: threadId, vote_type: voteType },
        { onConflict: "user_id, thread_id" }
      );
    
    if (error) throw error;
  }
}

/**
 * Vote on a reply (1 for upvote, -1 for downvote, 0 to remove vote)
 */
export async function voteReply(replyId: string, voteType: 1 | -1 | 0): Promise<void> {
  const supabase = requireSupabase();
  
  if (voteType === 0) {
    // Remove vote
    const { error } = await supabase
      .from("discussion_votes")
      .delete()
      .eq("reply_id", replyId);
    
    if (error) throw error;
  } else {
    // Upsert vote
    const { error } = await supabase
      .from("discussion_votes")
      .upsert(
        { reply_id: replyId, vote_type: voteType },
        { onConflict: "user_id, reply_id" }
      );
    
    if (error) throw error;
  }
}

// ============================================
// Thread Status Operations
// ============================================

/**
 * Mark a thread as resolved or unresolved
 */
export async function markAsResolved(threadId: string, resolved: boolean): Promise<void> {
  const supabase = requireSupabase();
  
  const { error } = await supabase.rpc("mark_thread_resolved", {
    p_thread_id: threadId,
    p_resolved: resolved,
  });
  
  if (error) throw error;
}

/**
 * Mark a reply as the accepted answer
 */
export async function acceptAnswer(replyId: string, threadId: string): Promise<void> {
  const supabase = requireSupabase();
  
  const { error } = await supabase.rpc("accept_answer", {
    p_reply_id: replyId,
    p_thread_id: threadId,
  });
  
  if (error) throw error;
}

// ============================================
// Real-time Subscriptions
// ============================================

export type ThreadChangeType = "INSERT" | "UPDATE" | "DELETE";

export interface ThreadChange {
  type: ThreadChangeType;
  thread: ThreadWithAuthor;
  old?: ThreadWithAuthor;
}

export interface ReplyChange {
  type: ThreadChangeType;
  reply: ReplyWithAuthor;
  old?: ReplyWithAuthor;
}

/**
 * Subscribe to thread changes for a challenge
 */
export function subscribeToThreads(
  challengeSlug: string,
  callback: (change: ThreadChange) => void
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not available");
  
  return supabase
    .channel(`threads:${challengeSlug}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "discussion_threads",
        filter: `challenge_slug=eq.${challengeSlug}`,
      },
      async (payload: { eventType: string; new: any; old: any }) => {
        const change: ThreadChange = {
          type: payload.eventType as ThreadChangeType,
          thread: payload.new ? await enrichThreadWithAuthor(payload.new) : null as any,
        };
        
        if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
          change.old = payload.old ? await enrichThreadWithAuthor(payload.old) : undefined;
        }
        
        callback(change);
      }
    )
    .subscribe();
}

/**
 * Subscribe to reply changes for a thread
 */
export function subscribeToReplies(
  threadId: string,
  callback: (change: ReplyChange) => void
) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase client not available");
  
  return supabase
    .channel(`replies:${threadId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "discussion_replies",
        filter: `thread_id=eq.${threadId}`,
      },
      async (payload: { eventType: string; new: any; old: any }) => {
        const change: ReplyChange = {
          type: payload.eventType as ThreadChangeType,
          reply: payload.new ? await enrichReplyWithAuthor(payload.new) : null as any,
        };
        
        if (payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
          change.old = payload.old ? await enrichReplyWithAuthor(payload.old) : undefined;
        }
        
        callback(change);
      }
    )
    .subscribe();
}

// ============================================
// Helper Functions
// ============================================

function transformThread(data: any): ThreadWithAuthor {
  return {
    id: data.id,
    challengeSlug: data.challenge_slug,
    userId: data.user_id,
    userName: data.author?.raw_user_meta_data?.name || data.author?.email?.split("@")[0] || "Anonymous",
    userAvatar: data.author?.raw_user_meta_data?.avatar_url,
    category: data.category,
    title: data.title,
    content: data.content,
    codeSnippet: data.code_snippet,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    upvotes: data.upvotes,
    replyCount: data.reply_count,
    isPinned: data.is_pinned,
    isResolved: data.is_resolved,
    tags: data.tags || [],
    author: data.author,
  };
}

function transformReply(data: any): ReplyWithAuthor {
  return {
    id: data.id,
    threadId: data.thread_id,
    userId: data.user_id,
    userName: data.author?.raw_user_meta_data?.name || data.author?.email?.split("@")[0] || "Anonymous",
    userAvatar: data.author?.raw_user_meta_data?.avatar_url,
    content: data.content,
    codeSnippet: data.code_snippet,
    createdAt: data.created_at,
    upvotes: data.upvotes,
    isAcceptedAnswer: data.is_accepted_answer,
    author: data.author,
  };
}

async function enrichWithUserVotes(threads: ThreadWithAuthor[]): Promise<ThreadWithAuthor[]> {
  const supabase = getSupabase();
  if (!supabase) return threads;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return threads;
  
  const threadIds = threads.map(t => t.id);
  
  const { data: votes } = await supabase
    .from("discussion_votes")
    .select("thread_id, vote_type")
    .in("thread_id", threadIds)
    .eq("user_id", user.id);
  
  const voteMap = new Map((votes || []).map((v: { thread_id: string; vote_type: number }) => [v.thread_id, v.vote_type]));
  
  return threads.map(thread => ({
    ...thread,
    userVote: (voteMap.get(thread.id) ?? 0) as number,
  })) as ThreadWithAuthor[];
}

async function enrichRepliesWithUserVotes(replies: ReplyWithAuthor[]): Promise<ReplyWithAuthor[]> {
  const supabase = getSupabase();
  if (!supabase) return replies;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return replies;
  
  const replyIds = replies.map(r => r.id);
  
  const { data: votes } = await supabase
    .from("discussion_votes")
    .select("reply_id, vote_type")
    .in("reply_id", replyIds)
    .eq("user_id", user.id);
  
  const voteMap = new Map((votes || []).map((v: { reply_id: string; vote_type: number }) => [v.reply_id, v.vote_type]));
  
  return replies.map(reply => ({
    ...reply,
    userVote: (voteMap.get(reply.id) ?? 0) as number,
  })) as ReplyWithAuthor[];
}

async function enrichThreadWithAuthor(data: any): Promise<ThreadWithAuthor> {
  const supabase = getSupabase();
  if (!supabase) return transformThread({ ...data, author: null });
  
  const { data: author } = await supabase
    .from("users")
    .select("id, email, raw_user_meta_data")
    .eq("id", data.user_id)
    .single();
  
  return transformThread({ ...data, author });
}

async function enrichReplyWithAuthor(data: any): Promise<ReplyWithAuthor> {
  const supabase = getSupabase();
  if (!supabase) return transformReply({ ...data, author: null });
  
  const { data: author } = await supabase
    .from("users")
    .select("id, email, raw_user_meta_data")
    .eq("id", data.user_id)
    .single();
  
  return transformReply({ ...data, author });
}

// ============================================
// Stats
// ============================================

export async function getDiscussionStats(challengeSlug: string): Promise<{
  totalThreads: number;
  totalReplies: number;
  uniqueContributors: number;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { totalThreads: 0, totalReplies: 0, uniqueContributors: 0 };
  }
  
  // Get thread count
  const { count: threadCount } = await supabase
    .from("discussion_threads")
    .select("*", { count: "exact", head: true })
    .eq("challenge_slug", challengeSlug);
  
  // Get reply count
  const { count: replyCount } = await supabase
    .from("discussion_replies")
    .select("*", { count: "exact", head: true })
    .eq("challenge_slug", challengeSlug);
  
  // Get unique contributors (this requires a join, simplified here)
  const { data: contributors } = await supabase
    .from("discussion_threads")
    .select("user_id")
    .eq("challenge_slug", challengeSlug);
  
  const uniqueContributors = new Set((contributors || []).map((c: { user_id: string }) => c.user_id)).size;
  
  return {
    totalThreads: threadCount || 0,
    totalReplies: replyCount || 0,
    uniqueContributors,
  };
}
