"use client";

import Link from "next/link";
import { usePricing } from "@/lib/pricing/usePricing";

interface PaywallProps {
  challengeTitle: string;
  challengeIndex: number;
}

export function Paywall({ challengeTitle, challengeIndex }: PaywallProps) {
  const { currentPhase, daysRemaining, isEarlyBird, freeChallengeLimit } = usePricing();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-3xl border-2 border-zinc-200 bg-white p-8 text-center shadow-xl">
        {/* Lock Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-zinc-900">
          Unlock {challengeTitle}
        </h2>
        <p className="mt-3 text-zinc-600">
          You've completed {freeChallengeLimit} free challenges! Upgrade to Pro to access all{" "}
          185+ challenges, advanced 2025 techniques, and priority support.
        </p>

        {/* Pricing */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6">
          {isEarlyBird && daysRemaining && (
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white mb-3">
              🎉 Early Bird: {daysRemaining} days left
            </span>
          )}
          <div className="flex items-center justify-center gap-4">
            <div>
              {currentPhase.tiers.paid.strikethrough && (
                <div className="text-sm text-zinc-500 line-through">
                  {currentPhase.tiers.paid.strikethrough}
                </div>
              )}
              <div className="text-4xl font-bold text-zinc-900">
                {currentPhase.tiers.paid.price.displayMonthly}
                <span className="text-lg font-normal text-zinc-600">/month</span>
              </div>
              <div className="text-sm text-zinc-600 mt-1">
                or {currentPhase.tiers.paid.price.displayAnnual}/year
              </div>
            </div>
          </div>
          {currentPhase.tiers.paid.note && (
            <p className="mt-4 text-xs text-amber-800">
              {currentPhase.tiers.paid.note}
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout?tier=pro&billing=annual"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-8 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            Upgrade to Pro
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition-all hover:border-zinc-300 hover:shadow-md"
          >
            View All Plans
          </Link>
        </div>

        {/* Features List */}
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          {[
            "All 185+ challenges",
            "Advanced 2025 techniques",
            "Progress tracking",
            "Certificate of completion",
            "Priority support",
            "Price lock guarantee",
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-2">
              <svg className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-zinc-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <p className="mt-6 text-xs text-zinc-500">
          14-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </div>
  );
}

/**
 * Inline upgrade prompt for challenge cards
 */
export function UpgradePrompt({ challengeIndex }: { challengeIndex: number }) {
  const { freeChallengeLimit } = usePricing();
  
  if (challengeIndex < freeChallengeLimit) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-zinc-900/90 backdrop-blur-sm">
      <div className="text-center p-6">
        <svg className="h-10 w-10 text-white mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-white font-semibold mb-3">Pro Only</p>
        <Link
          href="/pricing"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-100"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
