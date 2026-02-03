/**
 * Paddle Payments Integration
 * 
 * Handles checkout creation, webhook verification, and subscription management.
 * Uses Paddle's API for payment processing.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Paddle API Configuration
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;
const PADDLE_ENVIRONMENT = process.env.PADDLE_ENVIRONMENT || "sandbox";

const PADDLE_API_URL = PADDLE_ENVIRONMENT === "production" 
  ? "https://api.paddle.com" 
  : "https://sandbox-api.paddle.com";

export type PaddleTier = "free" | "pro" | "team" | "lifetime";
export type PaddleBillingCycle = "monthly" | "annual" | "lifetime";

export interface PaddleCheckout {
  id: string;
  url: string;
}

export interface PaddleTransaction {
  id: string;
  status: "ready" | "billed" | "paid" | "past_due" | "canceled";
  customerId: string;
  subscriptionId?: string;
  amount: string;
  currency: string;
  createdAt: string;
}

export interface PaddleSubscription {
  id: string;
  status: "active" | "canceled" | "past_due" | "paused" | "trialing";
  customerId: string;
  productId: string;
  currentBillingPeriod: {
    startsAt: string;
    endsAt: string;
  };
  nextBilledAt?: string;
}

/**
 * Get the Paddle product/price ID for a given tier and billing cycle
 */
export function getPaddleProductId(
  tier: PaddleTier,
  billingCycle: PaddleBillingCycle
): string | null {
  const envVarMap: Record<string, string | undefined> = {
    pro_monthly: process.env.PADDLE_PRODUCT_PRO_MONTHLY,
    pro_annual: process.env.PADDLE_PRODUCT_PRO_ANNUAL,
    team_monthly: process.env.PADDLE_PRODUCT_TEAM_MONTHLY,
    team_annual: process.env.PADDLE_PRODUCT_TEAM_ANNUAL,
    lifetime_lifetime: process.env.PADDLE_PRODUCT_LIFETIME,
  };

  const key = `${tier}_${billingCycle}`;
  return envVarMap[key] || null;
}

/**
 * Create a Paddle checkout session
 */
export async function createPaddleCheckout(params: {
  productId: string;
  userId: string;
  userEmail: string;
  tier: PaddleTier;
  billingCycle: PaddleBillingCycle;
  successUrl: string;
  metadata?: Record<string, string>;
}): Promise<PaddleCheckout> {
  if (!PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY not configured");
  }

  const response = await fetch(`${PADDLE_API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PADDLE_API_KEY}`,
    },
    body: JSON.stringify({
      items: [
        {
          price: {
            id: params.productId,
          },
          quantity: 1,
        },
      ],
      customer: {
        email: params.userEmail,
      },
      custom_data: {
        userId: params.userId,
        tier: params.tier,
        billingCycle: params.billingCycle,
        ...params.metadata,
      },
      return_url: params.successUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Paddle API error: ${error.error?.detail || response.statusText}`);
  }

  const data = await response.json();
  
  return {
    id: data.data.id,
    url: data.data.checkout_url,
  };
}

/**
 * Verify Paddle webhook signature
 * Uses Paddle's signature verification algorithm
 */
export function verifyPaddleWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn("Missing signature or secret for webhook verification");
    return false;
  }

  try {
    // Paddle uses HMAC-SHA256 for webhook verification
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const computedSignature = hmac.digest("hex");
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Get transaction details from Paddle
 */
export async function getTransaction(transactionId: string): Promise<PaddleTransaction | null> {
  if (!PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY not configured");
  }

  const response = await fetch(`${PADDLE_API_URL}/transactions/${transactionId}`, {
    headers: {
      "Authorization": `Bearer ${PADDLE_API_KEY}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch transaction: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    id: data.data.id,
    status: data.data.status,
    customerId: data.data.customer_id,
    subscriptionId: data.data.subscription_id,
    amount: data.data.details?.totals?.total,
    currency: data.data.currency_code,
    createdAt: data.data.created_at,
  };
}

/**
 * Get subscription details from Paddle
 */
export async function getSubscription(subscriptionId: string): Promise<PaddleSubscription | null> {
  if (!PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY not configured");
  }

  const response = await fetch(`${PADDLE_API_URL}/subscriptions/${subscriptionId}`, {
    headers: {
      "Authorization": `Bearer ${PADDLE_API_KEY}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch subscription: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    id: data.data.id,
    status: data.data.status,
    customerId: data.data.customer_id,
    productId: data.data.items?.[0]?.price?.product_id,
    currentBillingPeriod: {
      startsAt: data.data.current_billing_period?.starts_at,
      endsAt: data.data.current_billing_period?.ends_at,
    },
    nextBilledAt: data.data.next_billed_at,
  };
}

/**
 * Cancel a subscription in Paddle
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY not configured");
  }

  const response = await fetch(`${PADDLE_API_URL}/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PADDLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      effective_from: "next_billing_period",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { detail: response.statusText } }));
    throw new Error(`Failed to cancel subscription: ${error.error?.detail || response.statusText}`);
  }

  return true;
}

/**
 * Update subscription in database based on Paddle webhook
 */
export async function syncSubscriptionToDatabase(
  supabase: SupabaseClient,
  params: {
    userId: string;
    tier: PaddleTier;
    status: string;
    subscriptionId?: string;
    currentPeriodEnd?: string;
    canceledAt?: string;
  }
): Promise<void> {
  // Direct upsert to subscriptions table
  const { error: upsertError } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: params.userId,
      tier: params.tier,
      status: params.status,
      subscription_id: params.subscriptionId,
      current_period_end: params.currentPeriodEnd,
      canceled_at: params.canceledAt,
      updated_at: new Date().toISOString(),
    } as any, {
      onConflict: "user_id",
    });

  if (upsertError) {
    throw new Error(`Failed to sync subscription: ${upsertError.message}`);
  }
}

/**
 * Get customer portal URL for managing subscriptions
 */
export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
  if (!PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY not configured");
  }

  // Paddle doesn't have a direct customer portal URL endpoint
  // Instead, we return a URL that will redirect to the customer's subscriptions
  return `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`;
}

/**
 * Test card numbers for Paddle sandbox
 */
export const TEST_CARDS = {
  success: {
    number: "4242 4242 4242 4242",
    description: "Successful payment",
    cvc: "123",
    expiry: "12/25",
  },
  declined: {
    number: "4000 0000 0000 0002",
    description: "Card declined",
    cvc: "123",
    expiry: "12/25",
  },
  threeDSecure: {
    number: "4000 0025 0000 3155",
    description: "3D Secure required",
    cvc: "123",
    expiry: "12/25",
  },
  insufficientFunds: {
    number: "4000 0000 0000 9995",
    description: "Insufficient funds",
    cvc: "123",
    expiry: "12/25",
  },
  expired: {
    number: "4000 0000 0000 0069",
    description: "Expired card",
    cvc: "123",
    expiry: "12/25",
  },
  incorrectCvc: {
    number: "4000 0000 0000 0127",
    description: "Incorrect CVC",
    cvc: "123",
    expiry: "12/25",
  },
  processingError: {
    number: "4000 0000 0000 0119",
    description: "Processing error",
    cvc: "123",
    expiry: "12/25",
  },
} as const;

export type TestCardKey = keyof typeof TEST_CARDS;
