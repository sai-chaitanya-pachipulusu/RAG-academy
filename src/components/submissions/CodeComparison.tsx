"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Submission, SubmissionStatus } from "@/lib/supabase/submissions";

interface CodeComparisonProps {
  submission1: Submission;
  submission2: Submission;
  challengeTitle?: string;
  onClose?: () => void;
}

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string }> = {
  accepted: { label: "Accepted", color: "text-emerald-600 dark:text-emerald-400" },
  wrong_answer: { label: "Wrong Answer", color: "text-red-600 dark:text-red-400" },
  runtime_error: { label: "Runtime Error", color: "text-orange-600 dark:text-orange-400" },
  time_limit: { label: "Time Limit", color: "text-amber-600 dark:text-amber-400" },
  compilation_error: { label: "Compile Error", color: "text-purple-600 dark:text-purple-400" },
};

interface DiffLine {
  type: "same" | "added" | "removed";
  content: string;
  lineNum1?: number;
  lineNum2?: number;
}

function computeDiff(oldCode: string, newCode: string): DiffLine[] {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");
  const diff: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let lineNum1 = 1;
  let lineNum2 = 1;

  // Simple LCS-based diff
  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      // Only new lines remain
      diff.push({
        type: "added",
        content: newLines[j],
        lineNum2,
      });
      j++;
      lineNum2++;
    } else if (j >= newLines.length) {
      // Only old lines remain
      diff.push({
        type: "removed",
        content: oldLines[i],
        lineNum1,
      });
      i++;
      lineNum1++;
    } else if (oldLines[i] === newLines[j]) {
      // Lines are the same
      diff.push({
        type: "same",
        content: oldLines[i],
        lineNum1,
        lineNum2,
      });
      i++;
      j++;
      lineNum1++;
      lineNum2++;
    } else {
      // Lines differ - check if next lines match
      const nextMatchInNew = newLines.indexOf(oldLines[i], j);
      const nextMatchInOld = oldLines.indexOf(newLines[j], i);

      if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - j <= nextMatchInOld - i)) {
        // Insert lines from new
        for (let k = j; k < nextMatchInNew; k++) {
          diff.push({
            type: "added",
            content: newLines[k],
            lineNum2,
          });
          lineNum2++;
        }
        j = nextMatchInNew;
      } else if (nextMatchInOld !== -1) {
        // Delete lines from old
        for (let k = i; k < nextMatchInOld; k++) {
          diff.push({
            type: "removed",
            content: oldLines[k],
            lineNum1,
          });
          lineNum1++;
        }
        i = nextMatchInOld;
      } else {
        // Replace line
        diff.push({
          type: "removed",
          content: oldLines[i],
          lineNum1,
        });
        diff.push({
          type: "added",
          content: newLines[j],
          lineNum2,
        });
        i++;
        j++;
        lineNum1++;
        lineNum2++;
      }
    }
  }

  return diff;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CodeComparison({
  submission1,
  submission2,
  challengeTitle,
  onClose,
}: CodeComparisonProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("unified");
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  // Determine which submission is older
  const isSubmission1Older = new Date(submission1.submittedAt) < new Date(submission2.submittedAt);
  const older = isSubmission1Older ? submission1 : submission2;
  const newer = isSubmission1Older ? submission2 : submission1;
  const olderConfig = STATUS_CONFIG[older.status];
  const newerConfig = STATUS_CONFIG[newer.status];

  const diff = computeDiff(older.code, newer.code);
  const addedCount = diff.filter((d) => d.type === "added").length;
  const removedCount = diff.filter((d) => d.type === "removed").length;

  const timeDiff = new Date(newer.submittedAt).getTime() - new Date(older.submittedAt).getTime();
  const timeDiffMinutes = Math.round(timeDiff / 60000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Code Comparison
          </h2>
          {challengeTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {challengeTitle}
            </p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-300 cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Comparison Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Older Submission</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(older.submittedAt)}
              </p>
            </div>
            <Badge variant="muted">{olderConfig.label}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Time:</span>{" "}
              <span className="font-medium">{older.executionTimeMs ? `${older.executionTimeMs}ms` : "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500">Score:</span>{" "}
              <span className="font-medium">{older.score != null ? Math.min(older.score, 100) : "N/A"}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Newer Submission</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(newer.submittedAt)}
              </p>
            </div>
            <Badge variant={newer.passed ? "accent" : "default"}>{newerConfig.label}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Time:</span>{" "}
              <span className="font-medium">{newer.executionTimeMs ? `${newer.executionTimeMs}ms` : "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-500">Score:</span>{" "}
              <span className="font-medium">{newer.score != null ? Math.min(newer.score, 100) : "N/A"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Diff Stats */}
      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Time between: <span className="font-medium">{timeDiffMinutes} minutes</span>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400">
            +{addedCount} lines added
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{removedCount} lines removed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`rounded px-2 py-1 text-xs font-medium ${
              showLineNumbers
                ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#2563EB]"
            }`}
          >
            Line Numbers
          </button>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode("unified")}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === "unified"
                  ? "bg-gray-100 text-gray-900 dark:bg-[#2563EB] dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Unified
            </button>
            <button
              type="button"
              onClick={() => setViewMode("side-by-side")}
              className={`px-3 py-1 text-xs font-medium ${
                viewMode === "side-by-side"
                  ? "bg-gray-100 text-gray-900 dark:bg-[#2563EB] dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Split
            </button>
          </div>
        </div>
      </div>

      {/* Diff View */}
      {viewMode === "unified" ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="max-h-[600px] overflow-auto">
            <table className="w-full text-sm">
              <tbody>
                {diff.map((line, idx) => (
                  <tr
                    key={idx}
                    className={`${
                      line.type === "added"
                        ? "bg-emerald-50 dark:bg-emerald-950/20"
                        : line.type === "removed"
                        ? "bg-red-50 dark:bg-red-950/20"
                        : ""
                    }`}
                  >
                    {showLineNumbers && (
                      <>
                        <td className="w-12 select-none border-r border-gray-200 bg-gray-50 px-2 py-0.5 text-right text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900">
                          {line.lineNum1 || ""}
                        </td>
                        <td className="w-12 select-none border-r border-gray-200 bg-gray-50 px-2 py-0.5 text-right text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900">
                          {line.lineNum2 || ""}
                        </td>
                      </>
                    )}
                    <td className="w-8 select-none px-2 py-0.5 text-center">
                      {line.type === "added" && <span className="text-emerald-600">+</span>}
                      {line.type === "removed" && <span className="text-red-600">-</span>}
                      {line.type === "same" && <span className="text-gray-300"> </span>}
                    </td>
                    <td className="px-2 py-0.5">
                      <code
                        className={`${
                          line.type === "added"
                            ? "text-emerald-800 dark:text-emerald-300"
                            : line.type === "removed"
                            ? "text-red-800 dark:text-red-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {line.content || " "}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Old code */}
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Older
            </div>
            <div className="max-h-[600px] overflow-auto">
              <pre className="p-3 text-sm">
                <code className="text-gray-700 dark:text-gray-300">{older.code}</code>
              </pre>
            </div>
          </div>

          {/* New code */}
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Newer
            </div>
            <div className="max-h-[600px] overflow-auto">
              <pre className="p-3 text-sm">
                <code className="text-gray-700 dark:text-gray-300">{newer.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
