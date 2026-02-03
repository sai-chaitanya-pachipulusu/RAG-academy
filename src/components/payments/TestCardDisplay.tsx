"use client";

/**
 * Test Card Display Component
 * 
 * Displays test credit card numbers for testing payment flows.
 * Shows different scenarios: success, decline, 3D Secure, etc.
 */

import { useState } from "react";
import { TEST_CARDS, type TestCardKey } from "@/lib/payments/paddle";

interface TestCardDisplayProps {
  showTitle?: boolean;
  className?: string;
}

export function TestCardDisplay({ showTitle = true, className = "" }: TestCardDisplayProps) {
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const handleCopy = (number: string, key: string) => {
    navigator.clipboard.writeText(number.replace(/\s/g, ""));
    setCopiedCard(key);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  const cardEntries = Object.entries(TEST_CARDS) as [TestCardKey, typeof TEST_CARDS["success"]][];

  const getCardStyle = (key: TestCardKey): string => {
    const styles: Record<TestCardKey, string> = {
      success: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20",
      declined: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
      threeDSecure: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
      insufficientFunds: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20",
      expired: "border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/20",
      incorrectCvc: "border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20",
      processingError: "border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/20",
    };
    return styles[key] || "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
  };

  const getCardIcon = (key: TestCardKey): string => {
    const icons: Record<TestCardKey, string> = {
      success: "✅",
      declined: "❌",
      threeDSecure: "🔒",
      insufficientFunds: "💰",
      expired: "📅",
      incorrectCvc: "🔢",
      processingError: "⚠️",
    };
    return icons[key];
  };

  const getCardTitle = (key: TestCardKey): string => {
    const titles: Record<TestCardKey, string> = {
      success: "Successful Payment",
      declined: "Card Declined",
      threeDSecure: "3D Secure Required",
      insufficientFunds: "Insufficient Funds",
      expired: "Expired Card",
      incorrectCvc: "Incorrect CVC",
      processingError: "Processing Error",
    };
    return titles[key];
  };

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Test Card Numbers
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use these cards to test different payment scenarios
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {cardEntries.map(([key, card]) => (
          <div
            key={key}
            className={`rounded-lg border p-4 transition-all hover:shadow-md ${getCardStyle(key)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getCardIcon(key)}</span>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {getCardTitle(key)}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {card.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(card.number, key)}
                className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/50 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                title="Copy card number"
              >
                {copiedCard === key ? (
                  <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Number</span>
                <code className="rounded bg-white/50 px-2 py-0.5 font-mono text-sm dark:bg-zinc-800/50">
                  {card.number}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Expiry</span>
                <span className="text-sm font-medium">{card.expiry}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">CVC</span>
                <span className="text-sm font-medium">{card.cvc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          <strong>Tip:</strong> Use any future date for expiry and any 3 digits for CVC. 
          For ZIP code, use any 5 digits (e.g., 12345).
        </p>
      </div>
    </div>
  );
}

/**
 * Compact test card selector for forms
 */
export function TestCardSelector({ 
  onSelect,
  selected 
}: { 
  onSelect: (cardKey: TestCardKey) => void;
  selected?: TestCardKey;
}) {
  const cardEntries = Object.entries(TEST_CARDS) as [TestCardKey, typeof TEST_CARDS["success"]][];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Select Test Scenario
      </label>
      <div className="grid gap-2">
        {cardEntries.slice(0, 4).map(([key, card]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
              selected === key
                ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm dark:bg-zinc-800">
              {key === "success" && "✅"}
              {key === "declined" && "❌"}
              {key === "threeDSecure" && "🔒"}
              {key === "insufficientFunds" && "💰"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {card.description}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {card.number}
              </p>
            </div>
            {selected === key && (
              <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Quick reference card for inline display
 */
export function TestCardQuickReference() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Test Card Numbers
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <TestCardDisplay showTitle={false} />
        </div>
      )}
    </div>
  );
}
