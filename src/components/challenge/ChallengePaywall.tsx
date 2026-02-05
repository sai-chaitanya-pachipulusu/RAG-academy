"use client";

import Link from "next/link";
import { type Challenge, getPlatformStats } from "@/lib/challenges/catalog";
import { getCurrentPricingPhase } from "@/lib/pricing/config";

type Props = {
  challenge: Challenge;
  isLoggedIn: boolean;
};

export function ChallengePaywall({ challenge, isLoggedIn }: Props) {
  const pricing = getCurrentPricingPhase();
  const stats = getPlatformStats();
  const lifetimePrice = pricing.tiers.lifetime?.price.displayAnnual || "$35";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-lg text-center">
        {/* Lock Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100">
          <svg
            className="h-10 w-10 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Premium Challenge
        </h2>

        {/* Challenge Preview */}
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-900">
            {challenge.title}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {challenge.difficulty} · {challenge.xpReward} XP
          </p>
          <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
            {challenge.description}
          </p>
        </div>

        {/* CTA */}
        <p className="mt-6 text-sm text-zinc-600">
          {isLoggedIn
            ? `Unlock all ${stats.totalChallenges}+ challenges with a Pro membership.`
            : "Sign up to track your progress. Upgrade to Pro for full access."}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!isLoggedIn && (
            <Link
              href={`/login?redirect=/challenges/${challenge.slug}`}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-50"
            >
              Sign In / Sign Up Free
            </Link>
          )}
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            Unlock All for {lifetimePrice}
          </Link>
        </div>

        {/* Value Props */}
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-100 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-900">
              {stats.totalChallenges}+ Challenges
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Python & TypeScript, all difficulty levels
            </p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-900">
              Lifetime Access
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              One payment, all future content included
            </p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-900">
              80+ Research Papers
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Curated reading list with notes
            </p>
          </div>
          <div className="rounded-xl border border-zinc-100 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-900">
              Production Datasets
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Real-world data for realistic practice
            </p>
          </div>
        </div>

        {/* Free Challenges Link */}
        <p className="mt-8 text-xs text-zinc-400">
          Want to try first?{" "}
          <Link
            href="/challenges?difficulty=easy"
            className="font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900"
          >
            Browse 20 free challenges
          </Link>
        </p>
      </div>
    </div>
  );
}
