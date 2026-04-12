"use client";

import { useState } from "react";
import { CHALLENGES, type Challenge } from "@/lib/challenges/catalog";

interface CertificateData {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredChallenges: string[];
  color: string;
}

const CERTIFICATES: CertificateData[] = [
  {
    id: "vector-db-foundations",
    name: "Vector Database Foundations",
    description: "Mastery of vector storage, indexing, and similarity search",
    icon: "🗃️",
    requiredChallenges: ["dense-vector-class", "naive-flat-index", "ivf-flat-index"],
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "rag-pipeline-builder",
    name: "RAG Pipeline Builder",
    description: "End-to-end RAG system implementation",
    icon: "🔗",
    requiredChallenges: [
      "rag-pipeline-chunker",
      "rag-pipeline-embedder",
      "rag-pipeline-retriever",
      "rag-pipeline-generator",
    ],
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "retrieval-engineer",
    name: "Retrieval Engineer",
    description: "Advanced retrieval techniques and optimization",
    icon: "🔍",
    requiredChallenges: [
      "basic-retrieval",
      "query-normalization",
      "mmr-diversity",
      "reranker-score-function",
    ],
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "evaluation-specialist",
    name: "Evaluation Specialist",
    description: "RAG system evaluation and metrics",
    icon: "📊",
    requiredChallenges: [
      "evaluator-recall-at-k",
      "evaluator-mrr",
      "evaluator-ndcg",
    ],
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "agentic-rag-developer",
    name: "Agentic RAG Developer",
    description: "Tool use, reasoning, and autonomous RAG agents",
    icon: "🤖",
    requiredChallenges: [
      "tool-use-basics",
      "react-implementation",
      "news-search-tool",
    ],
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "rag-master",
    name: "RAG Master",
    description: "Complete mastery of all RAG concepts",
    icon: "👑",
    requiredChallenges: [], // Will be dynamically set to all challenges
    color: "from-yellow-400 to-amber-600",
  },
];

// Set RAG Master to require 80% of all challenges
const totalChallenges = CHALLENGES.filter((c: Challenge) => !c.benchmark).length;
CERTIFICATES.find((c) => c.id === "rag-master")!.requiredChallenges = 
  CHALLENGES.filter((c: Challenge) => !c.benchmark)
    .slice(0, Math.ceil(totalChallenges * 0.8))
    .map((c: Challenge) => c.slug);

function getCertificateProgress(
  cert: CertificateData,
  completedSlugs: Set<string>
): { completed: number; total: number; percentage: number } {
  const completed = cert.requiredChallenges.filter((slug) =>
    completedSlugs.has(slug)
  ).length;
  const total = cert.requiredChallenges.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

interface CertificationsProps {
  completedChallenges?: string[];
}

export function Certifications({ completedChallenges = [] }: CertificationsProps) {
  const completedSet = new Set(completedChallenges);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);

  const earnedCerts = CERTIFICATES.filter(
    (cert) => getCertificateProgress(cert, completedSet).percentage === 100
  );

  const inProgressCerts = CERTIFICATES.filter((cert) => {
    const progress = getCertificateProgress(cert, completedSet);
    return progress.percentage > 0 && progress.percentage < 100;
  });

  const lockedCerts = CERTIFICATES.filter(
    (cert) => getCertificateProgress(cert, completedSet).percentage === 0
  );

  return (
    <div className="space-y-6">
      {/* Earned Certificates */}
      {earnedCerts.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span>🏆</span> Earned Certificates
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {earnedCerts.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                progress={getCertificateProgress(cert, completedSet)}
                earned
                onClick={() => setSelectedCert(cert)}
              />
            ))}
          </div>
        </section>
      )}

      {/* In Progress */}
      {inProgressCerts.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <span>📈</span> In Progress
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {inProgressCerts.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                progress={getCertificateProgress(cert, completedSet)}
                onClick={() => setSelectedCert(cert)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Locked */}
      {lockedCerts.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-500 dark:text-gray-400">
            <span>🔒</span> Locked
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {lockedCerts.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                progress={getCertificateProgress(cert, completedSet)}
                locked
                onClick={() => setSelectedCert(cert)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          progress={getCertificateProgress(selectedCert, completedSet)}
          completedSlugs={completedSet}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
}

interface CertificateCardProps {
  certificate: CertificateData;
  progress: { completed: number; total: number; percentage: number };
  earned?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

function CertificateCard({
  certificate,
  progress,
  earned,
  locked,
  onClick,
}: CertificateCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200-all duration-200 ${
        earned
          ? "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg dark:border-amber-900/50 dark:from-amber-950/20 dark:to-yellow-950/20"
          : locked
          ? "border-gray-200 bg-gray-50/50 opacity-60 dark:border-gray-800 dark:bg-gray-900/50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow dark:border-gray-800 dark:bg-[#2563EB] dark:hover:border-gray-700"
      }`}
    >
      {earned && (
        <div className="absolute -right-6 -top-6 h-16 w-16">
          <div className="absolute h-full w-full rotate-45 bg-gradient-to-r from-amber-400 to-yellow-400" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="text-3xl">{certificate.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {certificate.name}
          </h4>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
            {certificate.description}
          </p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                {progress.completed}/{progress.total} completed
              </span>
              <span
                className={
                  earned
                    ? "font-bold text-amber-600 dark:text-amber-400"
                    : "text-gray-400"
                }
              >
                {progress.percentage}%
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-[#2563EB]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${certificate.color} transition-all duration-200-all duration-200`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

interface CertificateModalProps {
  certificate: CertificateData;
  progress: { completed: number; total: number; percentage: number };
  completedSlugs: Set<string>;
  onClose: () => void;
}

function CertificateModal({
  certificate,
  progress,
  completedSlugs,
  onClose,
}: CertificateModalProps) {
  const isEarned = progress.percentage === 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${certificate.color} text-4xl shadow-lg`}
          >
            {certificate.icon}
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            {certificate.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{certificate.description}</p>

          {isEarned && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 text-sm font-semibold text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400">
              <span>🏆</span> Certificate Earned!
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Requirements
          </h3>
          <ul className="mt-2 space-y-2">
            {certificate.requiredChallenges.map((slug) => {
              const challenge = CHALLENGES.find((c: Challenge) => c.slug === slug);
              const completed = completedSlugs.has(slug);
              return (
                <li
                  key={slug}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                    completed
                      ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400"
                  }`}
                >
                  <span>{completed ? "✓" : "○"}</span>
                  <span>{challenge?.title || slug}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-[#2563EB] cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Single certificate badge for display
export function CertificateBadge({ certificateId }: { certificateId: string }) {
  const cert = CERTIFICATES.find((c) => c.id === certificateId);
  if (!cert) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${cert.color} px-3 py-1 text-xs font-medium text-white shadow`}
    >
      <span>{cert.icon}</span>
      <span>{cert.name}</span>
    </div>
  );
}
