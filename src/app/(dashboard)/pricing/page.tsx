"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  getCurrentPricingPhase, 
  getDaysRemainingInPhase, 
  getNextPhaseInfo,
  calculateAnnualSavings,
  type PricingTier 
} from "@/lib/pricing/config";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

export default function PricingPage() {
  const { user } = useSupabaseAuth();
  const [currentPhase, setCurrentPhase] = useState(getCurrentPricingPhase());
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [nextPhaseInfo, setNextPhaseInfo] = useState(getNextPhaseInfo());
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  useEffect(() => {
    const updatePricingInfo = () => {
      const now = new Date();
      setCurrentPhase(getCurrentPricingPhase(now));
      setDaysRemaining(getDaysRemainingInPhase(now));
      setNextPhaseInfo(getNextPhaseInfo(now));
    };

    updatePricingInfo();
    const interval = setInterval(updatePricingInfo, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const tiers = [
    currentPhase.tiers.free,
    currentPhase.tiers.paid,
    ...(currentPhase.tiers.team ? [currentPhase.tiers.team] : []),
    ...(currentPhase.tiers.lifetime ? [currentPhase.tiers.lifetime] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Invest in your RAG engineering skills
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Join engineers building production-ready RAG systems at top companies.
          </p>

          {/* Phase Banner */}
          {currentPhase.phase !== "phase3" && daysRemaining !== null && (
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white">
                  🐦 {currentPhase.name}
                </span>
              </div>
              <p className="text-sm font-semibold text-amber-900">
                {daysRemaining} days left at early bird pricing!
              </p>
              {nextPhaseInfo.priceIncrease && nextPhaseInfo.priceIncrease > 0 && (
                <p className="text-sm text-amber-700 mt-1">
                  Pro increases from ${currentPhase.tiers.paid.price.monthly}/mo to ${nextPhaseInfo.nextPhase?.tiers.paid.price.monthly}/mo on{" "}
                  {nextPhaseInfo.nextPhase?.startDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          )}

          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Annual
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Save up to 43%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-4">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              billingCycle={billingCycle}
              isPopular={tier.popular}
              isLifetime={tier.name.includes("Lifetime")}
              user={user}
            />
          ))}
        </div>

        {/* Comparison with competitors */}
        <div className="mx-auto mt-24 max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8 text-center">
            How we compare
          </h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-zinc-900">Platform</th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900">Monthly</th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900">Annual</th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900">Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr className="bg-emerald-50">
                  <td className="py-4 px-6 font-semibold text-emerald-700">RAG Academy</td>
                  <td className="py-4 px-4 text-center text-emerald-700">$29</td>
                  <td className="py-4 px-4 text-center text-emerald-700">$199</td>
                  <td className="py-4 px-4 text-center">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      RAG Only
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-zinc-700">LeetCode Premium</td>
                  <td className="py-4 px-4 text-center text-zinc-600">$35</td>
                  <td className="py-4 px-4 text-center text-zinc-600">$159</td>
                  <td className="py-4 px-4 text-center text-zinc-500">DSA</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-zinc-700">Educative.io</td>
                  <td className="py-4 px-4 text-center text-zinc-600">$59</td>
                  <td className="py-4 px-4 text-center text-zinc-600">$199</td>
                  <td className="py-4 px-4 text-center text-zinc-500">General</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-zinc-700">AlgoExpert</td>
                  <td className="py-4 px-4 text-center text-zinc-600">—</td>
                  <td className="py-4 px-4 text-center text-zinc-600">$99</td>
                  <td className="py-4 px-4 text-center text-zinc-500">DSA</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-sm text-zinc-500">
            Unlike generalist platforms, we focus exclusively on RAG engineering with production datasets and real-world code.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards and PayPal via Polar.sh, our Merchant of Record. Polar handles all payment processing and global tax compliance (VAT, GST, Sales Tax)."
            />
            <FAQItem
              question="What happens when pricing changes phases?"
              answer="If you subscribe during an earlier phase, you're grandfathered into that pricing forever. Early Bird subscribers keep their $19/month price even when it increases to $29/month."
            />
            <FAQItem
              question="Can I switch between monthly and annual billing?"
              answer="Yes! You can switch between monthly and annual billing at any time from your account settings. Annual billing saves you up to 43%."
            />
            <FAQItem
              question="What's included in the free tier?"
              answer={`The free tier includes ${currentPhase.tiers.free.freeChallengeCount} foundational challenges, essential playbooks, and all tool comparisons. It's a great way to get started with RAG engineering.`}
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="Yes! We offer a 14-day money-back guarantee. If you're not satisfied with RAG Academy, contact us for a full refund, no questions asked."
            />
            <FAQItem
              question="Can teams get custom pricing?"
              answer="Yes! For teams larger than 10 seats or enterprise requirements (SSO, custom invoicing, dedicated support), contact us at team@ragacademy.dev."
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-6">
            Trusted by engineers at
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <span className="text-xl font-bold text-zinc-400">Google</span>
            <span className="text-xl font-bold text-zinc-400">Meta</span>
            <span className="text-xl font-bold text-zinc-400">OpenAI</span>
            <span className="text-xl font-bold text-zinc-400">Anthropic</span>
            <span className="text-xl font-bold text-zinc-400">Stripe</span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto mt-24 max-w-4xl rounded-3xl bg-zinc-900 dark:bg-white p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white dark:text-zinc-900 sm:text-3xl">
            Ready to master RAG engineering?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 dark:text-zinc-600">
            Join engineers building production-ready RAG systems with interactive challenges and real-world projects.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href={user ? "/challenges" : "/login"}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 px-8 text-sm font-semibold text-zinc-900 dark:text-white transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {user ? "Start Learning" : "Start Free"}
            </Link>
            <Link
              href="/learn"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-700 dark:border-zinc-300 px-8 text-sm font-semibold text-white dark:text-zinc-900 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100"
            >
              View Curriculum
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  tier: PricingTier;
  billingCycle: "monthly" | "annual";
  isPopular?: boolean;
  isLifetime?: boolean;
  user: any;
}

function PricingCard({ tier, billingCycle, isPopular, isLifetime, user }: PricingCardProps) {
  const isFree = tier.price.monthly === 0 && tier.price.annual === 0;
  const savings = calculateAnnualSavings(tier);
  
  const displayPrice = isLifetime
    ? tier.price.displayAnnual
    : tier.price.displayMonthly;

  const checkoutUrl = isFree
    ? (user ? "/learn" : "/login")
    : `/checkout?tier=${tier.id}&billing=${isLifetime ? "lifetime" : billingCycle}`;

  return (
    <div
      className={`relative rounded-3xl border p-6 bg-white ${
        isPopular
          ? "border-indigo-500 shadow-xl ring-2 ring-indigo-500"
          : "border-zinc-200"
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      {/* Tier Badge */}
      {tier.badge && !isPopular && (
        <div className="mb-4">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {tier.badge}
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-lg font-bold text-zinc-900">{tier.name}</h3>

      {/* Price */}
      <div className="mt-4">
        {isFree ? (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-zinc-900">Free</span>
          </div>
        ) : isLifetime ? (
          <div>
            {tier.strikethrough && (
              <div className="text-sm text-zinc-500 line-through mb-1">
                {tier.strikethrough}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-zinc-900">
                {displayPrice}
              </span>
            </div>
            <p className="text-sm text-zinc-600 mt-1">One-time payment</p>
          </div>
        ) : (
          <div>
            {tier.strikethrough && billingCycle === "monthly" && (
              <div className="text-sm text-zinc-500 line-through mb-1">
                {tier.strikethrough}
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-zinc-900">
                {displayPrice}
              </span>
              <span className="text-zinc-600">/month</span>
            </div>
            {billingCycle === "annual" && (
              <p className="text-sm text-emerald-600 mt-1">
                {tier.price.displayAnnual}/year (save {savings.savingsPercent}%)
              </p>
            )}
            {billingCycle === "monthly" && (
              <p className="text-sm text-zinc-600 mt-1">
                or {tier.price.displayAnnual}/year
              </p>
            )}
          </div>
        )}
      </div>

      {/* Note */}
      {tier.note && (
        <p className="mt-4 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
          {tier.note}
        </p>
      )}

      {/* CTA Button */}
      <Link
        href={checkoutUrl}
        className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all ${
          isPopular
            ? "bg-indigo-600 text-white hover:bg-indigo-500"
            : "border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:shadow-md"
        }`}
      >
        {isFree ? "Start Free" : isLifetime ? "Get Lifetime Access" : "Subscribe Now"}
      </Link>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-emerald-600"
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
            <span className="text-sm text-zinc-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h3 className="font-semibold text-zinc-900">{question}</h3>
      <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{answer}</p>
    </div>
  );
}
