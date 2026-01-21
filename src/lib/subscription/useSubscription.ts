"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { usePricing } from "@/lib/pricing/usePricing";
import { useSupabaseAuth } from "@/components/providers/SupabaseAuthProvider";

// Create Supabase client
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export interface UserSubscription {
  tier: "free" | "pro" | "team" | "lifetime";
  status: "active" | "canceled" | "past_due" | "trialing";
  phase: "phase1" | "phase2" | "phase3";
  lockedMonthlyPrice: number;
  lockedAnnualPrice: number;
}

export function useSubscription() {
  const { user } = useSupabaseAuth();
  const { freeChallengeLimit } = usePricing();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        if (error) {
          console.error("Error fetching subscription:", error);
          setSubscription(null);
        } else if (data) {
          setSubscription({
            tier: data.tier,
            status: data.status,
            phase: data.subscribed_phase,
            lockedMonthlyPrice: data.locked_monthly_price,
            lockedAnnualPrice: data.locked_annual_price,
          });
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error("Error loading subscription:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const hasAccess = (challengeIndex: number): boolean => {
    // No user = free tier
    if (!user) {
      return challengeIndex < freeChallengeLimit;
    }

    // No subscription = free tier
    if (!subscription) {
      return challengeIndex < freeChallengeLimit;
    }

    // Paid tiers have full access
    if (["pro", "team", "lifetime"].includes(subscription.tier)) {
      return true;
    }

    // Free tier check
    return challengeIndex < freeChallengeLimit;
  };

  const isPro = subscription?.tier && ["pro", "team", "lifetime"].includes(subscription.tier);

  return {
    subscription,
    loading,
    hasAccess,
    isPro,
    tier: subscription?.tier || "free",
    freeChallengeLimit,
  };
}
