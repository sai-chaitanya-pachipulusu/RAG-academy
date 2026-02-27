/**
 * Polar Payments Integration
 *
 * Handles checkout creation, webhook verification, and subscription management.
 * Uses Polar's API for payment processing.
 * Documentation: https://polar.sh/docs
 */

import { Polar } from "@polar-sh/sdk";

export type PolarTier = "free" | "pro" | "team" | "lifetime";
export type PolarBillingCycle = "monthly" | "annual" | "lifetime";

export interface PolarCheckout {
  id: string;
  url: string;
}

export interface PolarSubscription {
  id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  customerId: string;
  productId: string;
  currentPeriodEnd?: string;
}

const POLAR_API_URL = "https://api.polar.sh/v1";

function getPolarClient(): Polar {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }

  // Token only works with production API
  return new Polar({
    accessToken,
    server: "production",
  });
}

export function getPolarProductPriceId(
  tier: PolarTier,
  billingCycle: PolarBillingCycle
): string | null {
  const envVarMap: Record<string, string | undefined> = {
    pro_monthly: process.env.POLAR_PRODUCT_PRO_MONTHLY,
    pro_annual: process.env.POLAR_PRODUCT_PRO_ANNUAL,
    team_monthly: process.env.POLAR_PRODUCT_TEAM_MONTHLY,
    team_annual: process.env.POLAR_PRODUCT_TEAM_ANNUAL,
    lifetime_lifetime: process.env.POLAR_PRODUCT_LIFETIME,
  };

  const key = `${tier}_${billingCycle}`;
  return envVarMap[key] || null;
}

export async function createPolarCheckout(params: {
  productPriceId: string;
  userId: string;
  userEmail: string;
  tier: PolarTier;
  billingCycle: PolarBillingCycle;
  successUrl: string;
  metadata?: Record<string, string>;
}): Promise<PolarCheckout> {
  const polar = getPolarClient();

  const checkoutData: any = {
    products: [params.productPriceId],
    successUrl: params.successUrl,
    customerMetadata: {
      userId: params.userId,
      tier: params.tier,
      billingCycle: params.billingCycle,
      ...params.metadata,
    },
  };

  // Only add email if provided (email is optional in Polar)
  if (params.userEmail) {
    checkoutData.customerEmail = params.userEmail;
  }

  const checkout = await polar.checkouts.create(checkoutData);

  return {
    id: checkout.id,
    url: checkout.url,
  };
}

export async function getPolarCheckout(checkoutId: string) {
  try {
    const polar = getPolarClient();
    return await polar.checkouts.get({ id: checkoutId });
  } catch (error) {
    console.error("Failed to get Polar checkout:", error);
    return null;
  }
}

export async function getPolarCustomerPortalUrl(): Promise<string> {
  const organizationSlug = process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG;
  if (!organizationSlug) {
    throw new Error("NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG not configured");
  }

  return `https://polar.sh/${organizationSlug}/settings`;
}

export async function cancelPolarSubscription(subscriptionId: string): Promise<boolean> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }

  try {
    const response = await fetch(`${POLAR_API_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to cancel Polar subscription:", error);
    return false;
  }
}

export async function getPolarSubscription(subscriptionId: string) {
  try {
    const polar = getPolarClient();
    return await polar.subscriptions.get({ id: subscriptionId });
  } catch (error) {
    console.error("Failed to get Polar subscription:", error);
    return null;
  }
}

export function verifyPolarWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn("Missing signature or secret for webhook verification");
    return false;
  }

  try {
    const crypto = require("crypto");
    
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    const computedSignature = hmac.digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

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
