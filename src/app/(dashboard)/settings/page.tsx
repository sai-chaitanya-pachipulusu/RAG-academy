"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ReviewDashboard, ReviewStats } from "@/components/gamification/ReviewBadge";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";
import { getPlatformStats } from "@/lib/challenges/catalog";

function SettingsContent() {
  const searchParams = useSearchParams();
  const { user, subscription, refreshSubscription, hasPaidAccess } = useSupabaseAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const stats = getPlatformStats();

  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      setShowSuccess(true);
      refreshSubscription();
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams, refreshSubscription]);

  return (
    <div className="flex flex-col gap-4">
      {showSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Payment successful!
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Welcome to RAG Academy Pro! You now have full access.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="rounded-md p-1 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <header>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account, preferences, and data.
        </p>
      </header>

      {/* Subscription */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Subscription</h2>
        
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Current Plan</p>
                <p className="text-sm font-semibold text-zinc-900 capitalize">
                  {subscription?.tier || "Free"}
                  {subscription?.isActive && subscription.tier !== "free" && (
                    <span className="ml-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      Active
                    </span>
                  )}
                </p>
              </div>
              {hasPaidAccess ? (
                <button
                  disabled
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500"
                >
                  Manage Subscription
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
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
              <p className="text-xs text-emerald-600">
                Lifetime access - never expires!
              </p>
            )}
            
            {!hasPaidAccess && (
              <div className="mt-2 rounded-md bg-zinc-50 p-3">
                <p className="text-xs text-zinc-600">
                  Upgrade to Pro to unlock all {stats.totalChallenges}+ challenges.
                </p>
                <Link
                  href="/pricing"
                  className="mt-1 inline-flex text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View pricing
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-zinc-50 p-3">
            <p className="text-xs text-zinc-600">
              Sign in to manage your subscription and sync progress.
            </p>
            <Link
              href="/login?redirect=/settings"
              className="mt-1 inline-flex text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </div>
        )}
      </section>

      <ProfileSection />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Spaced Repetition */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900">Spaced Repetition</h2>
          <ReviewStats />
          <div className="mt-3">
            <ReviewDashboard />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
          <p className="mt-0.5 text-xs text-red-600">
            These actions cannot be undone
          </p>
          <div className="mt-3">
            <button
              onClick={() => {
                if (confirm("Are you sure? This will reset ALL your progress!")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
            >
              Reset All Progress
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-1"></div>
      </header>
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="space-y-3">
          <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>
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
