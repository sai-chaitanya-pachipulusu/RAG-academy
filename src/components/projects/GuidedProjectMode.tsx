"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Step {
  title: string;
  description: string;
  challengeSlug: string;
  challengeLabel: string;
  expectedOutcome: string;
  hint?: string;
}

interface GuidedProjectProps {
  trackTitle: string;
  steps: Step[];
}

export function GuidedProjectMode({ trackTitle, steps }: GuidedProjectProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = steps[currentStep];
  const progress = Math.round((completedSteps.size / steps.length) * 100);

  const markComplete = () => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Guided Mode: {trackTitle}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        <Badge variant={completedSteps.size === steps.length ? "accent" : "muted"}>
          {progress}% complete
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-[#7C3AED] rounded-full mb-6">
        <div
          className="h-2 bg-emerald-500 rounded-full transition-all duration-200-all duration-300 cursor-pointer"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200-all duration-200 ${
              i === currentStep
                ? "bg-[#8B5CF6] text-white dark:bg-white dark:text-black"
                : completedSteps.has(i)
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-600 dark:bg-[#7C3AED] dark:text-gray-400"
            }`}
          >
            {completedSteps.has(i) ? "✓ " : ""}{i + 1}. {s.challengeLabel}
          </button>
        ))}
      </div>

      {/* Current step content */}
      <div className="space-y-4">
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {step.title}
          </h4>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {step.description}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Expected outcome
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {step.expectedOutcome}
          </p>
        </div>

        {step.hint && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide">
              Hint
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              {step.hint}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous step
          </button>

          <div className="flex gap-2">
            <Link
              href={`/challenges/${step.challengeSlug}`}
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#7C3AED] px-4 text-sm font-medium text-white hover:bg-[#7C3AED] dark:bg-white dark:text-black dark:hover:bg-[#7C3AED] cursor-pointer"
            >
              Open Challenge →
            </Link>
            <button
              onClick={() => {
                markComplete();
                goNext();
              }}
              disabled={currentStep === steps.length - 1 && completedSteps.has(currentStep)}
              className="inline-flex h-9 items-center justify-center rounded-full border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#7C3AED] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length - 1 && completedSteps.has(currentStep)
                ? "Track complete"
                : "Mark complete & continue"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
