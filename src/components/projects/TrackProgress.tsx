"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface TrackProgressData {
  trackId: string;
  trackTitle: string;
  totalChallenges: number;
  completedChallenges: number;
  progressPercent: number;
  completedSlugs: string[];
  isComplete: boolean;
  completedAt?: string;
}

interface TrackProgressProps {
  trackId: string;
  trackTitle: string;
  challenges: Array<{ slug: string; label: string }>;
  userId: string | null;
}

export function TrackProgress({ trackId, trackTitle, challenges, userId }: TrackProgressProps) {
  const [progress, setProgress] = useState<TrackProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch progress from API
    fetch(`/api/projects/progress?trackId=${trackId}`)
      .then((r) => r.json())
      .then((data) => {
        setProgress(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [trackId, userId]);

  const handleGenerateCertificate = async () => {
    if (!userId || !progress?.isComplete) return;

    setGeneratingCert(true);
    try {
      const response = await fetch("/api/projects/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId, trackTitle }),
      });

      const data = await response.json();
      if (data.certificateUrl) {
        setCertificateUrl(data.certificateUrl);
      }
    } catch (error) {
      console.error("Failed to generate certificate:", error);
    } finally {
      setGeneratingCert(false);
    }
  };

  if (!userId || loading) {
    return null;
  }

  const completedSlugs = progress?.completedSlugs ?? [];
  const progressPercent = progress?.progressPercent ?? 0;

  return (
    <div className="mt-3 space-y-2">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-[#2563EB] overflow-hidden">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-200-all duration-300 cursor-pointer"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {progress?.completedChallenges ?? 0}/{challenges.length}
        </span>
      </div>

      {/* Challenge Status */}
      <div className="flex flex-wrap gap-1.5">
        {challenges.map((c) => {
          const isCompleted = completedSlugs.includes(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/challenges/${c.slug}`}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200-all duration-200 ${
                isCompleted
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/[0.06]"
              }`}
            >
              {isCompleted ? "✓ " : ""}{c.label}
            </Link>
          );
        })}
      </div>

      {/* Certificate Button */}
      {progress?.isComplete && (
        <div className="flex items-center gap-2 pt-2">
          {certificateUrl ? (
            <Link
              href={certificateUrl}
              className="inline-flex items-center gap-1.5 h-8 rounded-full bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 transition-all duration-200-all duration-200 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              View Certificate
            </Link>
          ) : (
            <button
              onClick={handleGenerateCertificate}
              disabled={generatingCert}
              className="inline-flex items-center gap-1.5 h-8 rounded-full bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 transition-all duration-200-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {generatingCert ? "Generating..." : "Generate Certificate"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
