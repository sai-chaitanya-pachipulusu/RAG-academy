"use client";

import { useState, useRef, useCallback } from "react";
import { useDevice } from "@/hooks/useDevice";
import { useMobileGestures } from "@/hooks/useMobileGestures";
import { BottomSheet } from "@/components/ui/TouchButton";
import { TouchButton } from "@/components/ui/TouchButton";
import type { Challenge } from "@/lib/challenges/catalog";

interface MobileIDEProps {
  challenge: Challenge;
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  running: boolean;
  stdout: string;
  stderr: string;
  meta: {
    durationMs?: number;
    score?: number | null;
    metrics?: Record<string, number | string> | null;
  } | null;
  children?: React.ReactNode;
}

type MobileTab = "description" | "code" | "output";

export function MobileIDE({
  challenge,
  code,
  onCodeChange,
  onRun,
  onSubmit,
  onReset,
  running,
  stdout,
  stderr,
  meta,
  children,
}: MobileIDEProps) {
  const { isMobile } = useDevice();
  const [activeTab, setActiveTab] = useState<MobileTab>("code");
  const [outputOpen, setOutputOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Swipe gestures for tab switching
  useMobileGestures(
    containerRef as React.RefObject<HTMLElement>,
    {
      onSwipeLeft: () => {
        if (activeTab === "description") setActiveTab("code");
        else if (activeTab === "code") setActiveTab("output");
      },
      onSwipeRight: () => {
        if (activeTab === "output") setActiveTab("code");
        else if (activeTab === "code") setActiveTab("description");
      },
    },
    { threshold: 50 }
  );

  const handleRun = useCallback(() => {
    onRun();
    setOutputOpen(true);
  }, [onRun]);

  const handleSubmit = useCallback(() => {
    onSubmit();
    setOutputOpen(true);
  }, [onSubmit]);

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white">
        {[
          { id: "description" as const, label: "Problem", icon: "📄" },
          { id: "code" as const, label: "Code", icon: "💻" },
          { id: "output" as const, label: "Output", icon: "▶️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200-all duration-200 ${
              activeTab === tab.id
                ? "border-b-2 border-[#3B82F6] text-gray-900"
                : "text-gray-500"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {challenge.title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {challenge.difficulty} · {challenge.xpReward} XP
                </p>
              </div>
              <p className="text-gray-700">{challenge.description}</p>
              {children}
            </div>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                className="h-full w-full resize-none bg-[#2563EB] p-4 font-mono text-sm text-gray-100 focus:outline-none"
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>

            {/* Floating Action Button for Run */}
            <div className="absolute bottom-20 right-4 flex flex-col gap-2">
              <TouchButton
                onClick={handleRun}
                disabled={running}
                className="h-14 w-14 rounded-full shadow-lg"
                aria-label="Run code"
              >
                {running ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </TouchButton>

              <TouchButton
                onClick={handleSubmit}
                disabled={running}
                variant="primary"
                className="h-14 w-14 rounded-full bg-emerald-600 shadow-lg hover:bg-emerald-500 cursor-pointer"
                aria-label="Submit solution"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </TouchButton>
            </div>
          </div>
        )}

        {/* Output Tab */}
        {activeTab === "output" && (
          <div className="h-full overflow-y-auto bg-gray-50 p-4">
            {meta?.score != null && (
              <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-sm font-bold text-indigo-900">
                  Score: {meta.score > 100 ? 100 : meta.score}
                </p>
              </div>
            )}

            {stdout && (
              <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  Output
                </p>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                  {stdout}
                </pre>
              </div>
            )}

            {stderr && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="mb-2 text-xs font-semibold text-red-700">
                  Error
                </p>
                <pre className="whitespace-pre-wrap font-mono text-sm text-red-900">
                  {stderr}
                </pre>
              </div>
            )}

            {!stdout && !stderr && (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <svg
                  className="mb-2 h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm">Run your code to see output</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet for Output (alternative view) */}
      <BottomSheet
        isOpen={outputOpen}
        onClose={() => setOutputOpen(false)}
        title="Output"
        height="md"
      >
        <div className="space-y-4">
          {meta?.score != null && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <p className="text-sm font-bold text-indigo-900">
                Score: {meta.score > 100 ? 100 : meta.score}
              </p>
            </div>
          )}

          {stdout && (
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <p className="mb-2 text-xs font-semibold text-gray-500">
                Output
              </p>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900">
                {stdout}
              </pre>
            </div>
          )}

          {stderr && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="mb-2 text-xs font-semibold text-red-700">Error</p>
              <pre className="whitespace-pre-wrap font-mono text-sm text-red-900">
                {stderr}
              </pre>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
