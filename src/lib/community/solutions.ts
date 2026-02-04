/**
 * Community Solutions Gallery
 * 
 * Allows users to share, browse, and learn from community-submitted
 * challenge solutions. Includes voting, comments, and code highlighting.
 */

import { getSupabase } from "@/lib/supabase/client";

// ============================================
// Types
// ============================================

export interface SharedSolution {
  id: string;
  challengeSlug: string;
  challengeTitle: string;
  userId: string;
  username?: string;
  avatarUrl?: string;
  
  // Solution content
  code: string;
  language: "python" | "typescript";
  description?: string;
  approach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  
  // Engagement
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  
  // Flags
  isFeatured: boolean;
  isSolution: boolean;  // Official solution
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface SolutionComment {
  id: string;
  solutionId: string;
  userId: string;
  username?: string;
  avatarUrl?: string;
  content: string;
  parentId?: string;  // For nested replies
  upvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionVote {
  solutionId: string;
  userId: string;
  vote: "up" | "down";
  createdAt: string;
}

export type SolutionSortOption = 
  | "newest"
  | "popular"
  | "most_voted"
  | "featured";

export interface SolutionFilters {
  challengeSlug?: string;
  language?: "python" | "typescript";
  userId?: string;
  featured?: boolean;
  sortBy?: SolutionSortOption;
}

// ============================================
// Solution Management
// ============================================

/**
 * Share a solution to the community gallery
 */
export async function shareSolution(
  challengeSlug: string,
  code: string,
  language: "python" | "typescript",
  options?: {
    description?: string;
    approach?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
  }
): Promise<{ success: boolean; error?: string; solutionId?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Validate code isn't too large
  if (code.length > 50000) {
    return { success: false, error: "Code exceeds maximum size (50KB)" };
  }

  const { data, error } = await supabase
    .from("shared_solutions")
    .insert({
      challenge_slug: challengeSlug,
      user_id: user.id,
      code,
      language,
      description: options?.description,
      approach: options?.approach,
      time_complexity: options?.timeComplexity,
      space_complexity: options?.spaceComplexity,
    })
    .select()
    .single();

  if (error) {
    console.error("Error sharing solution:", error);
    return { success: false, error: error.message };
  }

  return { success: true, solutionId: data.id };
}

/**
 * Get solutions with filtering and pagination
 */
export async function getSolutions(
  filters: SolutionFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ solutions: SharedSolution[]; total: number }> {
  const supabase = getSupabase();
  if (!supabase) return { solutions: [], total: 0 };

  let query = supabase
    .from("shared_solutions")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `, { count: "exact" });

  // Apply filters
  if (filters.challengeSlug) {
    query = query.eq("challenge_slug", filters.challengeSlug);
  }
  if (filters.language) {
    query = query.eq("language", filters.language);
  }
  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }
  if (filters.featured) {
    query = query.eq("is_featured", true);
  }

  // Apply sorting
  switch (filters.sortBy) {
    case "popular":
      query = query.order("view_count", { ascending: false });
      break;
    case "most_voted":
      query = query.order("upvotes", { ascending: false });
      break;
    case "featured":
      query = query.eq("is_featured", true).order("created_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching solutions:", error);
    return { solutions: [], total: 0 };
  }

  const solutions = (data || []).map(mapSharedSolution);
  return { solutions, total: count || 0 };
}

/**
 * Get a single solution by ID
 */
export async function getSolution(solutionId: string): Promise<SharedSolution | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Increment view count
  await supabase.rpc("increment_solution_views", { solution_id: solutionId });

  const { data, error } = await supabase
    .from("shared_solutions")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("id", solutionId)
    .single();

  if (error) {
    console.error("Error fetching solution:", error);
    return null;
  }

  return data ? mapSharedSolution(data) : null;
}

/**
 * Delete a solution
 */
export async function deleteSolution(solutionId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("shared_solutions")
    .delete()
    .eq("id", solutionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting solution:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// Voting
// ============================================

/**
 * Vote on a solution
 */
export async function voteOnSolution(
  solutionId: string,
  vote: "up" | "down"
): Promise<{ success: boolean; error?: string; newScore?: number }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase.rpc("vote_on_solution", {
    p_solution_id: solutionId,
    p_user_id: user.id,
    p_vote: vote,
  });

  if (error) {
    console.error("Error voting:", error);
    return { success: false, error: error.message };
  }

  return { success: true, newScore: data };
}

/**
 * Get user's vote on a solution
 */
export async function getUserVote(solutionId: string): Promise<"up" | "down" | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("solution_votes")
    .select("vote")
    .eq("solution_id", solutionId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return null;
  return data.vote as "up" | "down";
}

// ============================================
// Comments
// ============================================

/**
 * Add a comment to a solution
 */
export async function addComment(
  solutionId: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; error?: string; commentId?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (content.length > 2000) {
    return { success: false, error: "Comment too long (max 2000 characters)" };
  }

  const { data, error } = await supabase
    .from("solution_comments")
    .insert({
      solution_id: solutionId,
      user_id: user.id,
      content,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }

  return { success: true, commentId: data.id };
}

/**
 * Get comments for a solution
 */
export async function getComments(solutionId: string): Promise<SolutionComment[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("solution_comments")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("solution_id", solutionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return (data || []).map(mapSolutionComment);
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, error: "Not authenticated" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("solution_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// Featured Solutions
// ============================================

/**
 * Get featured solutions for a challenge
 */
export async function getFeaturedSolutions(challengeSlug: string): Promise<SharedSolution[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("shared_solutions")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("challenge_slug", challengeSlug)
    .eq("is_featured", true)
    .order("upvotes", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching featured solutions:", error);
    return [];
  }

  return (data || []).map(mapSharedSolution);
}

/**
 * Get top contributors
 */
export async function getTopContributors(limit: number = 10): Promise<Array<{
  userId: string;
  username?: string;
  avatarUrl?: string;
  solutionCount: number;
  totalUpvotes: number;
}>> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_solution_stats")
    .select("*")
    .order("total_upvotes", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top contributors:", error);
    return [];
  }

  return (data || []).map((stat: Record<string, unknown>) => ({
    userId: stat.user_id,
    username: stat.username,
    avatarUrl: stat.avatar_url,
    solutionCount: stat.solution_count,
    totalUpvotes: stat.total_upvotes,
  }));
}

// ============================================
// Data Mappers
// ============================================

function mapSharedSolution(data: Record<string, unknown>): SharedSolution {
  return {
    id: data.id as string,
    challengeSlug: data.challenge_slug as string,
    challengeTitle: data.challenge_title as string,
    userId: data.user_id as string,
    username: (data.profiles as Record<string, unknown>)?.username as string | undefined,
    avatarUrl: (data.profiles as Record<string, unknown>)?.avatar_url as string | undefined,
    code: data.code as string,
    language: data.language as "python" | "typescript",
    description: data.description as string | undefined,
    approach: data.approach as string | undefined,
    timeComplexity: data.time_complexity as string | undefined,
    spaceComplexity: data.space_complexity as string | undefined,
    upvotes: data.upvotes as number,
    downvotes: data.downvotes as number,
    commentCount: data.comment_count as number,
    viewCount: data.view_count as number,
    isFeatured: data.is_featured as boolean,
    isSolution: data.is_solution as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapSolutionComment(data: Record<string, unknown>): SolutionComment {
  return {
    id: data.id as string,
    solutionId: data.solution_id as string,
    userId: data.user_id as string,
    username: (data.profiles as Record<string, unknown>)?.username as string | undefined,
    avatarUrl: (data.profiles as Record<string, unknown>)?.avatar_url as string | undefined,
    content: data.content as string,
    parentId: data.parent_id as string | undefined,
    upvotes: data.upvotes as number,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format code for display (basic syntax highlighting prep)
 */
export function formatCodeForDisplay(code: string, language: "python" | "typescript"): string {
  // This is a placeholder - actual syntax highlighting would be done by a library
  // like Prism.js or highlight.js in the component
  return code.trim();
}

/**
 * Truncate code for preview
 */
export function truncateCode(code: string, maxLines: number = 10): string {
  const lines = code.split("\n");
  if (lines.length <= maxLines) return code;
  return lines.slice(0, maxLines).join("\n") + "\n// ...";
}

/**
 * Calculate solution score (upvotes - downvotes)
 */
export function calculateScore(solution: SharedSolution): number {
  return solution.upvotes - solution.downvotes;
}

/**
 * Check if solution is popular
 */
export function isPopular(solution: SharedSolution): boolean {
  return solution.upvotes >= 10 || solution.viewCount >= 100;
}
