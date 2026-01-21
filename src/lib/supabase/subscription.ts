/**
 * Subscription status utilities
 * 
 * Check if a user has an active paid subscription.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionTier = "free" | "pro" | "team" | "lifetime";
export type SubscriptionStatus = "none" | "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "revoked" | "lifetime";

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  isActive: boolean;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
}

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tier: "free",
  status: "none",
  isActive: false,
  currentPeriodEnd: null,
  canceledAt: null,
};

/**
 * Get user's subscription info from Supabase.
 * Works on both client and server.
 */
export async function getSubscriptionInfo(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo> {
  if (!userId) {
    return DEFAULT_SUBSCRIPTION;
  }

  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, canceled_at")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      // No subscription found = free tier
      return DEFAULT_SUBSCRIPTION;
    }

    const isActive = isSubscriptionActive(data.status, data.current_period_end);

    return {
      tier: data.tier as SubscriptionTier,
      status: data.status as SubscriptionStatus,
      isActive,
      currentPeriodEnd: data.current_period_end,
      canceledAt: data.canceled_at,
    };
  } catch (e) {
    console.error("Error fetching subscription:", e);
    return DEFAULT_SUBSCRIPTION;
  }
}

/**
 * Check if a subscription status indicates active access.
 */
export function isSubscriptionActive(
  status: string | null | undefined,
  currentPeriodEnd: string | null | undefined
): boolean {
  if (!status) return false;

  // Lifetime is always active
  if (status === "lifetime") return true;

  // Active statuses
  if (status === "active" || status === "trialing") return true;

  // Past due but still in period
  if (status === "past_due" && currentPeriodEnd) {
    const endDate = new Date(currentPeriodEnd);
    return endDate > new Date();
  }

  return false;
}

/**
 * Check if user has paid access (any tier above free).
 */
export function hasPaidAccess(subscription: SubscriptionInfo): boolean {
  if (!subscription.isActive) return false;
  return subscription.tier !== "free";
}

/**
 * Server-side: Get subscription info using service role.
 */
export async function getSubscriptionInfoServer(
  userId: string
): Promise<SubscriptionInfo> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  return getSubscriptionInfo(supabase, userId);
}

/**
 * Server-side: Check if user has paid access.
 */
export async function checkPaidAccessServer(userId: string): Promise<boolean> {
  const subscription = await getSubscriptionInfoServer(userId);
  return hasPaidAccess(subscription);
}
