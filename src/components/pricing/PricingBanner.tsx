"use client";

import Link from "next/link";
import { usePricing } from "@/lib/pricing/usePricing";
import { getPlatformStats } from "@/lib/challenges/catalog";

export function PricingBanner() {
  const { currentPhase, daysRemaining, priceIncrease, isEarlyBird } = usePricing();

  // Don't show banner in final phase or if no days remaining
  if (currentPhase.phase === "phase3" || !daysRemaining) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-900">
              {isEarlyBird ? "🎉 Early Bird Special" : "Limited Time"}
            </span>
            <p className="text-sm font-semibold text-white">
              {isEarlyBird ? (
                <>
                  Lock in <span className="underline">${currentPhase.tiers.paid.price.monthly}/month forever</span>
                  {" "}— only {daysRemaining} days left before price increases{priceIncrease ? ` to $${currentPhase.tiers.paid.price.monthly + priceIncrease}/month` : ""}
                </>
              ) : (
                <>
                  Current pricing ends in {daysRemaining} days
                  {priceIncrease && ` — price increases by $${priceIncrease}/month`}
                </>
              )}
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-amber-900 transition-all duration-200-all duration-200 hover:bg-amber-50 cursor-pointer"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Upgrade CTA component for use throughout the app
 */
export function UpgradeCTA({ context = "default" }: { context?: string }) {
  const { currentPhase, isEarlyBird, daysRemaining } = usePricing();

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
      {isEarlyBird && daysRemaining && (
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white mb-4">
          Early Bird: {daysRemaining} days left
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900">
        Unlock All {context === "challenge" ? "Challenges" : "Content"}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        Get access to {getPlatformStats().totalChallenges}+ challenges, advanced techniques, and priority support
        {isEarlyBird && " at the lowest price ever."}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="text-left">
          <div className="text-3xl font-bold text-gray-900">
            ${currentPhase.tiers.paid.price.monthly}
            <span className="text-base font-normal text-gray-600">/month</span>
          </div>
          {isEarlyBird && (
            <div className="text-xs text-amber-700">
              Regular price: $19/month
            </div>
          )}
        </div>
      </div>
      <Link
        href="/pricing"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white transition-all duration-200-all duration-200 hover:bg-[#2563EB] cursor-pointer"
      >
        Upgrade Now
      </Link>
      {currentPhase.tiers.paid.note && (
        <p className="mt-4 text-xs text-amber-800">
          {currentPhase.tiers.paid.note}
        </p>
      )}
    </div>
  );
}

/**
 * Inline pricing badge for buttons/CTAs
 */
export function PricingBadge() {
  const { currentPhase, isEarlyBird } = usePricing();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      {isEarlyBird && "🎉"}
      ${currentPhase.tiers.paid.price.monthly}/mo
      {isEarlyBird && " (Early Bird)"}
    </span>
  );
}
