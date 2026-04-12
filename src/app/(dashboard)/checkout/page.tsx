"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentPricingPhase, type PricingTier } from "@/lib/pricing/config";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

type TierType = "pro" | "team" | "lifetime";
type BillingType = "monthly" | "annual" | "lifetime";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSupabaseAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Parse tier from URL, default to pro
  const urlTier = searchParams.get("tier") as TierType | null;
  const urlBilling = searchParams.get("billing") as BillingType | null;
  
  const [selectedTier, setSelectedTier] = useState<TierType>(urlTier || "pro");
  const [selectedBilling, setSelectedBilling] = useState<BillingType>(
    selectedTier === "lifetime" ? "lifetime" : (urlBilling || "annual")
  );

  const currentPhase = getCurrentPricingPhase(new Date());
  
  // Get tier config based on selection
  const getTierConfig = (tier: TierType): PricingTier => {
    if (tier === "lifetime" && currentPhase.tiers.lifetime) {
      return currentPhase.tiers.lifetime;
    }
    if (tier === "team" && currentPhase.tiers.team) {
      return currentPhase.tiers.team;
    }
    return currentPhase.tiers.paid;
  };
  
  const tierConfig = getTierConfig(selectedTier);

  // Update billing when tier changes
  useEffect(() => {
    if (selectedTier === "lifetime") {
      setSelectedBilling("lifetime");
    } else if (selectedBilling === "lifetime") {
      setSelectedBilling("annual");
    }
  }, [selectedTier, selectedBilling]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          billingCycle: selectedBilling,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to payment page
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setLoading(false);
    }
  };

  const calculateSavings = () => {
    if (selectedTier === "lifetime" || selectedBilling === "lifetime") return 0;
    const monthlyTotal = tierConfig.price.monthly * 12;
    const annualPrice = tierConfig.price.annual;
    return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
  };

  const savings = calculateSavings();

  const getDisplayPrice = () => {
    if (selectedTier === "lifetime" || selectedBilling === "lifetime") {
      return tierConfig.price.displayAnnual;
    }
    return selectedBilling === "monthly"
      ? tierConfig.price.displayMonthly
      : tierConfig.price.displayAnnual;
  };

  const displayPrice = getDisplayPrice();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B5CF6]-50 to-white dark:from-[#8B5CF6]-950 dark:to-[#8B5CF6]-900 py-16">
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete your subscription
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join engineers mastering RAG at top companies
          </p>
        </div>

        {/* Checkout Card */}
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
          {/* Tier Selection */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
              Select Plan
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <TierButton
                selected={selectedTier === "pro"}
                onClick={() => setSelectedTier("pro")}
                title="Pro"
                subtitle="Individual"
                price={currentPhase.tiers.paid.price.displayMonthly}
                popular
              />
              <TierButton
                selected={selectedTier === "team"}
                onClick={() => setSelectedTier("team")}
                title="Team"
                subtitle="5 seats included"
                price={currentPhase.tiers.team?.price.displayMonthly || "$79"}
              />
              {currentPhase.tiers.lifetime && (
                <TierButton
                  selected={selectedTier === "lifetime"}
                  onClick={() => setSelectedTier("lifetime")}
                  title="Lifetime"
                  subtitle="One-time payment"
                  price={currentPhase.tiers.lifetime.price.displayAnnual}
                  badge="Best Value"
                />
              )}
            </div>
          </div>

          {/* Billing Cycle Selection (not for lifetime) */}
          {selectedTier !== "lifetime" && (
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">
                Billing Cycle
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setSelectedBilling("monthly")}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    selectedBilling === "monthly"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Monthly</h3>
                    {selectedBilling === "monthly" && (
                      <CheckIcon />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tierConfig.price.displayMonthly}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/mo</span>
                  </p>
                </button>

                <button
                  onClick={() => setSelectedBilling("annual")}
                  className={`rounded-2xl border-2 p-4 text-left transition-all relative ${
                    selectedBilling === "annual"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {savings > 0 && (
                    <span className="absolute -top-3 -right-3 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                      Save {savings}%
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Annual</h3>
                    {selectedBilling === "annual" && (
                      <CheckIcon />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {tierConfig.price.displayAnnual}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/yr</span>
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    ${Math.round(tierConfig.price.annual / 12)}/mo billed annually
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mb-8 rounded-2xl bg-gray-50 dark:bg-[#7C3AED]/50 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {tierConfig.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Billing</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {selectedBilling === "lifetime" ? "One-time" : selectedBilling}
                </span>
              </div>
              {selectedTier === "team" && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Seats</span>
                  <span className="font-semibold text-gray-900 dark:text-white">5 included</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{displayPrice}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
                  {selectedTier === "lifetime" || selectedBilling === "lifetime"
                    ? "One-time payment"
                    : selectedBilling === "monthly"
                    ? "Billed monthly"
                    : "Billed annually"}
                </p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What&apos;s included:</h3>
            <ul className="space-y-2">
              {tierConfig.features.slice(0, 5).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Price Lock Note */}
          {tierConfig.note && (
            <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200">{tierConfig.note}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full h-14 rounded-xl bg-indigo-600 text-white font-semibold transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Continue to Secure Payment
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-4">
            Powered by Polar.sh (Merchant of Record). All major cards and PayPal accepted.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-500 flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payment
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            14-day money back
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            Global tax handling
          </div>
        </div>
      </div>
    </div>
  );
}

interface TierButtonProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  price: string;
  popular?: boolean;
  badge?: string;
}

function TierButton({ selected, onClick, title, subtitle, price, popular, badge }: TierButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border-2 p-4 text-left transition-all relative ${
        selected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {popular && (
        <span className="absolute -top-2 -right-2 inline-flex rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
          Popular
        </span>
      )}
      {badge && !popular && (
        <span className="absolute -top-2 -right-2 inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {selected && <CheckIcon />}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{price}</p>
    </button>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B5CF6]-50 to-white dark:from-[#8B5CF6]-950 dark:to-[#8B5CF6]-900 py-16">
      <div className="mx-auto max-w-2xl px-6">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-gray-200 dark:bg-[#7C3AED] rounded animate-pulse mx-auto"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-[#7C3AED] rounded animate-pulse mx-auto mt-2"></div>
        </div>
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 dark:bg-[#7C3AED] rounded animate-pulse"></div>
            <div className="h-12 bg-gray-100 dark:bg-[#7C3AED] rounded animate-pulse"></div>
            <div className="h-32 bg-gray-100 dark:bg-[#7C3AED] rounded animate-pulse"></div>
            <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}
