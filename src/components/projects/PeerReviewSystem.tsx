"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ReviewCriteria {
  id: string;
  label: string;
  description: string;
  score: number;
}

interface PeerReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  projectId: string;
  projectTitle: string;
  criteria: ReviewCriteria[];
  overallScore: number;
  feedback: string;
  createdAt: string;
}

interface PeerReviewSystemProps {
  projectId: string;
  projectTitle: string;
  rubric: string[];
  userId: string | null;
}

export function PeerReviewSystem({ projectId, projectTitle, rubric, userId }: PeerReviewSystemProps) {
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [criteria, setCriteria] = useState<ReviewCriteria[]>(
    rubric.map((r, i) => ({
      id: `criteria-${i}`,
      label: r,
      description: r,
      score: 0,
    }))
  );
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!projectId) return;

    fetch(`/api/projects/reviews?projectId=${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => {});
  }, [projectId]);

  const handleSubmitReview = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    try {
      const overallScore = Math.round(
        criteria.reduce((sum, c) => sum + c.score, 0) / criteria.length
      );

      const response = await fetch("/api/projects/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          projectTitle,
          criteria,
          overallScore,
          feedback,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReviews((prev) => [data.review, ...prev]);
        setShowForm(false);
        setCriteria(
          rubric.map((r, i) => ({
            id: `criteria-${i}`,
            label: r,
            description: r,
            score: 0,
          }))
        );
        setFeedback("");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateScore = (id: string, score: number) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, score } : c))
    );
  };

  const averageScore =
    reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length)
      : 0;

  return (
    <div className="space-y-4">
      {/* Review Summary */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Peer Reviews
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""} submitted
              {averageScore > 0 && ` · Average score: ${averageScore}/10`}
            </p>
          </div>
          {userId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex h-8 items-center justify-center rounded-full bg-zinc-950 px-3 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {showForm ? "Cancel" : "Write Review"}
            </button>
          )}
        </div>

        {/* Existing Reviews */}
        {reviews.length > 0 && (
          <div className="mt-4 space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {review.reviewerName}
                  </span>
                  <Badge variant={review.overallScore >= 7 ? "accent" : "muted"}>
                    {review.overallScore}/10
                  </Badge>
                </div>
                {review.feedback && (
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {review.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Review: {projectTitle}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Score each criterion from 0-10
          </p>

          <div className="mt-4 space-y-3">
            {criteria.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  {c.label}
                </span>
                <div className="flex items-center gap-1">
                  {[0, 2, 4, 6, 8, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => updateScore(c.id, score)}
                      className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                        c.score === score
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              placeholder="What did you like? What could be improved?"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting || criteria.every((c) => c.score === 0)}
              className="inline-flex h-9 items-center justify-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
