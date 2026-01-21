"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExportImportUI } from "@/components/settings/ExportImport";
import { ReviewDashboard, ReviewStats } from "@/components/gamification/ReviewBadge";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getPolarCustomerPortalUrl } from "@/lib/payments/polar";

function SettingsContent() {
  const searchParams = useSearchParams();
  const { user, subscription, refreshSubscription, hasPaidAccess } = useSupabaseAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle checkout success
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setShowSuccess(true);
      // Refresh subscription status
      refreshSubscription();
      // Remove the query param from URL
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams, refreshSubscription]);

  return (
    <div className="flex flex-col gap-8">
      {/* Success Banner */}
      {showSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">
                Payment successful!
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Welcome to RAG Academy Pro! You now have full access to all challenges.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto rounded-lg p-1 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <span>⚙️</span>
          Settings & Profile
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your account, preferences, and data.
        </p>
      </header>

      {/* Subscription Status */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
          <span>💎</span>
          Subscription
        </h2>
        
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Current Plan</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white capitalize">
                  {subscription?.tier || "Free"}
                  {subscription?.isActive && subscription.tier !== "free" && (
                    <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </p>
              </div>
              {hasPaidAccess ? (
                <a
                  href={getPolarCustomerPortalUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  Manage Subscription
                </a>
              ) : (
                <Link
                  href="/pricing"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                >
                  Upgrade to Pro
                </Link>
              )}
            </div>
            
            {subscription?.currentPeriodEnd && subscription.tier !== "lifetime" && (
              <p className="text-xs text-zinc-500">
                {subscription.status === "canceled" ? "Access until: " : "Renews: "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            
            {subscription?.tier === "lifetime" && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                🎉 Lifetime access — never expires!
              </p>
            )}
            
            {!hasPaidAccess && (
              <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Upgrade to Pro to unlock all 220+ challenges, production datasets, and more.
                </p>
                <Link
                  href="/pricing"
                  className="mt-2 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  View pricing →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to manage your subscription and sync progress across devices.
            </p>
            <Link
              href="/login?redirect=/settings"
              className="mt-2 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in →
            </Link>
          </div>
        )}
      </section>

      {/* Profile & Preferences */}
      <ProfileSection />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Export/Import */}
          <ExportImportUI />

          {/* Spaced Repetition */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
              <span>🧠</span>
              Spaced Repetition
            </h2>
            <ReviewStats />
            <div className="mt-4">
              <ReviewDashboard />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Danger Zone */}
          <section className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <h2 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
              <span>⚠️</span>
              Danger Zone
            </h2>
            <p className="mt-1 text-sm text-red-600/70 dark:text-red-400/70">
              These actions cannot be undone
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  if (confirm("Are you sure? This will reset ALL your progress!")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Reset All Progress
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsLoading() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-2"></div>
      </header>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
