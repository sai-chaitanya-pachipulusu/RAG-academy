/**
 * Solution Gallery Component
 * 
 * Browse, vote, and comment on community-submitted challenge solutions.
 * Includes filtering, sorting, and code preview.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Share2,
  Trophy,
  Filter,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  CheckCircle,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TouchButton } from "@/components/ui/TouchButton";
import { useToast } from "@/components/ui/Toast";
import type {
  SharedSolution,
  SolutionComment,
  SolutionFilters,
  SolutionSortOption,
} from "@/lib/community/solutions";
import {
  getSolutions,
  getSolution,
  voteOnSolution,
  getUserVote,
  getComments,
  addComment,
  calculateScore,
  truncateCode,
} from "@/lib/community/solutions";
import Link from "next/link";

interface SolutionGalleryProps {
  challengeSlug?: string;
  userId?: string;
}

const SORT_OPTIONS: { value: SolutionSortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Viewed" },
  { value: "most_voted", label: "Top Rated" },
  { value: "featured", label: "Featured" },
];

export function SolutionGallery({ challengeSlug, userId }: SolutionGalleryProps) {
  const [solutions, setSolutions] = useState<SharedSolution[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SolutionFilters>({
    challengeSlug,
    userId,
    sortBy: "newest",
  });
  const [selectedSolution, setSelectedSolution] = useState<SharedSolution | null>(null);
  const [comments, setComments] = useState<SolutionComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | undefined>>({});
  const { addToast } = useToast();

  const limit = 10;

  useEffect(() => {
    loadSolutions();
  }, [page, filters]);

  const loadSolutions = async () => {
    setIsLoading(true);
    const result = await getSolutions(filters, page, limit);
    setSolutions(result.solutions);
    setTotal(result.total);
    setIsLoading(false);

    // Load user's votes
    const votes: Record<string, "up" | "down"> = {};
    for (const solution of result.solutions) {
      const vote = await getUserVote(solution.id);
      if (vote) votes[solution.id] = vote;
    }
    setUserVotes(votes);
  };

  const handleVote = async (solutionId: string, vote: "up" | "down") => {
    const result = await voteOnSolution(solutionId, vote);
    if (result.success) {
      // Update local state
      setUserVotes((prev: Record<string, "up" | "down" | undefined>) => ({
        ...prev,
        [solutionId]: prev[solutionId] === vote ? undefined : vote,
      }));
      
      // Refresh solutions to get updated scores
      loadSolutions();
    } else {
      addToast(result.error || "Failed to vote", "error");
    }
  };

  const handleOpenSolution = async (solution: SharedSolution) => {
    setSelectedSolution(solution);
    const solutionComments = await getComments(solution.id);
    setComments(solutionComments);
  };

  const handleAddComment = async () => {
    if (!selectedSolution || !newComment.trim()) return;

    const result = await addComment(selectedSolution.id, newComment.trim());
    if (result.success) {
      setNewComment("");
      const updatedComments = await getComments(selectedSolution.id);
      setComments(updatedComments);
      addToast("Comment added!", "success");
    } else {
      addToast(result.error || "Failed to add comment", "error");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Community Solutions
          </h2>
          <p className="text-sm text-gray-500">
            {total} solutions shared by the community
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SolutionSortOption })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Solutions Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {solutions.map((solution) => (
              <SolutionCard
                key={solution.id}
                solution={solution}
                userVote={userVotes[solution.id]}
                onVote={handleVote}
                onClick={() => handleOpenSolution(solution)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {solutions.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <Code className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            No Solutions Yet
          </h3>
          <p className="text-gray-500">
            Be the first to share your solution for this challenge!
          </p>
        </Card>
      )}

      {/* Solution Detail Modal */}
      <AnimatePresence>
        {selectedSolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedSolution(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#7C3AED]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Solution by {selectedSolution.username || "Anonymous"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedSolution.challengeTitle || selectedSolution.challengeSlug}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSolution(null)}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#7C3AED] cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[calc(90vh-8rem)] overflow-y-auto p-6">
                {/* Stats */}
                <div className="mb-6 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{calculateScore(selectedSolution)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span>{selectedSolution.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{new Date(selectedSolution.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Description */}
                {selectedSolution.description && (
                  <div className="mb-6">
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                      Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedSolution.description}
                    </p>
                  </div>
                )}

                {/* Code */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Code ({selectedSolution.language})
                    </h4>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400">
                      {selectedSolution.timeComplexity || "O(n)"} time
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-900 p-4">
                    <pre className="overflow-x-auto text-sm text-gray-100">
                      <code>{selectedSolution.code}</code>
                    </pre>
                  </div>
                </div>

                {/* Approach */}
                {selectedSolution.approach && (
                  <div className="mb-6">
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                      Approach
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedSolution.approach}
                    </p>
                  </div>
                )}

                {/* Comments */}
                <div>
                  <h4 className="mb-4 font-medium text-gray-900 dark:text-gray-100">
                    Comments ({comments.length})
                  </h4>

                  {/* Add Comment */}
                  <div className="mb-6 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    />
                    <TouchButton onClick={handleAddComment} disabled={!newComment.trim()}>
                      Post
                    </TouchButton>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {comment.username || "Anonymous"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Solution Card Component
// ============================================

interface SolutionCardProps {
  solution: SharedSolution;
  userVote?: "up" | "down";
  onVote: (solutionId: string, vote: "up" | "down") => void;
  onClick: () => void;
}

function SolutionCard({ solution, userVote, onVote, onClick }: SolutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const score = calculateScore(solution);

  return (
    <Card className="overflow-hidden transition-all duration-200-shadow hover:shadow-lg cursor-pointer">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Vote Buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(solution.id, "up");
              }}
              className={`rounded p-1 transition-all duration-200-all duration-200 ${
                userVote === "up"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#7C3AED]"
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
            </button>
            <span className={`font-bold ${score >= 0 ? "text-green-600" : "text-red-600"}`}>
              {score}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(solution.id, "down");
              }}
              className={`rounded p-1 transition-all duration-200-all duration-200 ${
                userVote === "down"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#7C3AED]"
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1" onClick={onClick}>
            <div className="mb-2 flex items-center gap-2">
              {solution.isFeatured && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <Trophy className="h-3 w-3" />
                  Featured
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400">
                {solution.language}
              </span>
              {solution.timeComplexity && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {solution.timeComplexity}
                </span>
              )}
            </div>

            <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
              Solution by {solution.username || "Anonymous"}
            </h3>

            {solution.description && (
              <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {solution.description}
              </p>
            )}

            {/* Code Preview */}
            <div className="mb-3 rounded-lg bg-gray-900 p-3">
              <pre className="overflow-hidden text-xs text-gray-300">
                <code>
                  {isExpanded ? solution.code : truncateCode(solution.code, 5)}
                </code>
              </pre>
              {solution.code.split("\n").length > 5 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {solution.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {solution.commentCount}
              </span>
              <span>{new Date(solution.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
