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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-1 text-sm text-gray-500">Invest in your RAG engineering skills.</p>
      </div>

      {/* Phase Banner */}
      {currentPhase.phase !== "phase3" && daysRemaining !== null && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-2.5 py-0.5 text-[10px] font-semibold text-white">
              {currentPhase.name}
            </span>
            <span className="text-xs font-medium text-amber-900">
              {daysRemaining} days left at early bird pricing
            </span>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="inline-flex gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 self-center">
        <button
          onClick={() => setBillingCycle("monthly")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
            billingCycle === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle("annual")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200-all duration-200 ${
            billingCycle === "annual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Annual
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Comparison */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-3 font-medium">Platform</th>
              <th className="text-center py-2 px-2 font-medium">Monthly</th>
              <th className="text-center py-2 px-2 font-medium">Annual</th>
              <th className="text-center py-2 px-2 font-medium">Focus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            <tr className="bg-emerald-50">
              <td className="py-2 px-3 font-medium text-emerald-700">RAG Academy</td>
              <td className="py-2 px-2 text-center text-emerald-700">$29</td>
              <td className="py-2 px-2 text-center text-emerald-700">$199</td>
              <td className="py-2 px-2 text-center"><span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">RAG Only</span></td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">LeetCode Premium</td>
              <td className="py-2 px-2 text-center text-gray-500">$35</td>
              <td className="py-2 px-2 text-center text-gray-500">$159</td>
              <td className="py-2 px-2 text-center text-gray-400">DSA</td>
            </tr>
            <tr>
              <td className="py-2 px-3 text-gray-600">Educative.io</td>
              <td className="py-2 px-2 text-center text-gray-500">$59</td>
              <td className="py-2 px-2 text-center text-gray-500">$199</td>
              <td className="py-2 px-2 text-center text-gray-400">General</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-base font-semibold mb-3">FAQ</h2>
        <div className="space-y-2">
          {[
            { q: "What payment methods?", a: "Credit cards and PayPal via Polar.sh, our Merchant of Record." },
            { q: "What happens when pricing changes?", a: "You're grandfathered into your pricing forever." },
            { q: "Can I switch billing cycles?", a: "Yes, anytime from account settings." },
            { q: "What's in the free tier?", a: `${currentPhase.tiers.free.freeChallengeCount} challenges, playbooks, and tool comparisons.` },
            { q: "Refunds?", a: "14-day money-back guarantee, no questions asked." },
          ].map((faq) => (
            <div key={faq.q} className="rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-medium">{faq.q}</h3>
              <p className="mt-1 text-xs text-gray-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <h2 className="text-lg font-semibold">Ready to master RAG engineering?</h2>
        <p className="mt-1 text-sm text-gray-500">Join engineers building production-ready RAG systems.</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href={user ? "/challenges" : "/login"} className="inline-flex h-9 items-center justify-center rounded-full bg-[#3B82F6] px-6 text-sm font-medium text-white hover:bg-[#2563EB] cursor-pointer">
            {user ? "Start Learning" : "Start Free"}
          </Link>
          <Link href="/learn" className="inline-flex h-9 items-center justify-center rounded-full border border-gray-200 px-6 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
            View Curriculum
          </Link>
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
  const displayPrice = isLifetime ? tier.price.displayAnnual : billingCycle === "annual" ? `$${Math.round(tier.price.annual / 12)}` : tier.price.displayMonthly;
  const checkoutUrl = isFree ? (user ? "/learn" : "/login") : `/checkout?tier=${tier.id}&billing=${isLifetime ? "lifetime" : billingCycle}`;

  return (
    <div className={`rounded-lg border p-4 ${isPopular ? "border-indigo-500 shadow-sm" : "border-gray-200"}`}>
      {isPopular && <div className="mb-2"><span className="inline-flex rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">Most Popular</span></div>}
      {tier.badge && !isPopular && <div className="mb-2"><span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{tier.badge}</span></div>}
      <h3 className="text-sm font-semibold">{tier.name}</h3>
      <div className="mt-2">
        {isFree ? <span className="text-2xl font-bold">Free</span> : isLifetime ? (
          <div>
            {tier.strikethrough && <div className="text-xs text-gray-500 line-through">{tier.strikethrough}</div>}
            <span className="text-2xl font-bold">{displayPrice}</span>
            <p className="text-[10px] text-gray-500">One-time</p>
          </div>
        ) : (
          <div>
            {tier.strikethrough && billingCycle === "monthly" && <div className="text-xs text-gray-500 line-through">{tier.strikethrough}</div>}
            <span className="text-2xl font-bold">{displayPrice}</span><span className="text-xs text-gray-500">/mo</span>
            {billingCycle === "annual" && <p className="text-[10px] text-emerald-600">{tier.price.displayAnnual}/yr (save {savings.savingsPercent}%)</p>}
          </div>
        )}
      </div>
      {tier.note && <p className="mt-2 text-[10px] text-amber-700 bg-amber-50 rounded p-2">{tier.note}</p>}
      <Link href={checkoutUrl} className={`mt-3 block w-full rounded-lg py-2 text-center text-xs font-semibold ${isPopular ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-900 hover:bg-gray-50"}`}>
        {isFree ? "Start Free" : isLifetime ? "Get Lifetime" : "Subscribe"}
      </Link>
      <ul className="mt-3 space-y-1.5">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span className="text-[11px] text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
