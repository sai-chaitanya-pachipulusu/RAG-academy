/**
 * Polar.sh Payment Integration
 * 
 * Polar.sh is a Merchant of Record (MoR) designed for developers:
 * - Handles global tax compliance (VAT, GST, Sales Tax)
 * - Payment processing with multiple methods
 * - Subscription management
 * - GitHub integration for open source funding
 * - Clean API and modern developer experience
 * 
 * Setup:
 * 1. Sign up at polar.sh
 * 2. Create an organization
 * 3. Create products for Pro/Team/Lifetime tiers
 * 4. Get Access Token from Settings > Developers
 * 5. Add to .env.local:
 *    - POLAR_ACCESS_TOKEN
 *    - POLAR_ORGANIZATION_ID
 *    - POLAR_WEBHOOK_SECRET
 *    - NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG
 */

// Polar Product Configuration
// Set these in environment variables after creating products in Polar dashboard
const POLAR_PRODUCTS = {
  pro_monthly: process.env.POLAR_PRODUCT_PRO_MONTHLY || "",
  pro_annual: process.env.POLAR_PRODUCT_PRO_ANNUAL || "",
  team_monthly: process.env.POLAR_PRODUCT_TEAM_MONTHLY || "",
  team_annual: process.env.POLAR_PRODUCT_TEAM_ANNUAL || "",
  lifetime: process.env.POLAR_PRODUCT_LIFETIME || "",
};

export type PolarTier = "pro" | "team" | "lifetime";
export type PolarBillingCycle = "monthly" | "annual" | "lifetime";

export type PolarCheckoutParams = {
  productPriceId: string;
  userId: string;
  userEmail: string;
  tier: PolarTier;
  billingCycle: PolarBillingCycle;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
};

export type PolarSubscription = {
  id: string;
  status: "active" | "past_due" | "canceled" | "incomplete" | "trialing";
  productId: string;
  priceId: string;
  userId: string;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  metadata: Record<string, string>;
};

export type PolarCheckoutResponse = {
  id: string;
  url: string;
  clientSecret: string;
  status: "open" | "confirmed" | "succeeded" | "failed";
  metadata: Record<string, string>;
};

/**
 * Get Polar product price ID based on tier and billing cycle.
 */
export function getPolarProductPriceId(
  tier: PolarTier,
  billingCycle: PolarBillingCycle
): string {
  if (tier === "lifetime" || billingCycle === "lifetime") {
    return POLAR_PRODUCTS.lifetime;
  }
  
  const key = `${tier}_${billingCycle}` as keyof typeof POLAR_PRODUCTS;
  return POLAR_PRODUCTS[key] || "";
}

/**
 * Create a Polar checkout session.
 * Returns a checkout URL that the user should be redirected to.
 */
export async function createPolarCheckout(
  params: PolarCheckoutParams
): Promise<PolarCheckoutResponse> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }

  if (!params.productPriceId) {
    throw new Error("Product Price ID not configured for this tier/billing cycle");
  }

  const baseUrl = getBaseUrl();
  
  const response = await fetch("https://api.polar.sh/v1/checkouts/custom", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_price_id: params.productPriceId,
      success_url: params.successUrl || `${baseUrl}/settings?success=true`,
      customer_email: params.userEmail,
      metadata: {
        user_id: params.userId,
        tier: params.tier,
        billing_cycle: params.billingCycle,
        ...params.metadata,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error("Polar checkout error:", error);
    throw new Error(error.detail || "Failed to create Polar checkout");
  }

  const data = await response.json();
  
  return {
    id: data.id,
    url: data.url,
    clientSecret: data.client_secret,
    status: data.status,
    metadata: data.metadata || {},
  };
}

/**
 * Verify Polar webhook signature using HMAC-SHA256.
 */
export function verifyPolarWebhook(
  signature: string,
  payload: string
): boolean {
  const crypto = require("crypto");
  const secret = process.env.POLAR_WEBHOOK_SECRET;

  if (!secret) {
    console.error("POLAR_WEBHOOK_SECRET not configured");
    return false;
  }

  try {
    // Polar uses HMAC-SHA256 for webhook signatures
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Webhook verification error:", error);
    return false;
  }
}

/**
 * Parse Polar webhook event.
 */
export function parsePolarWebhookEvent(body: Record<string, unknown>) {
  const eventType = body.type as string;
  const data = body.data as Record<string, unknown>;

  // Extract metadata from subscription or checkout
  const metadata = (data?.metadata as Record<string, string>) || {};

  return {
    eventType,
    // Checkout events
    checkoutId: data?.id as string | undefined,
    checkoutStatus: data?.status as string | undefined,
    
    // Subscription events  
    subscriptionId: data?.id as string | undefined,
    subscriptionStatus: data?.status as string | undefined,
    productId: data?.product_id as string | undefined,
    priceId: data?.price_id as string | undefined,
    
    // Customer info
    customerId: data?.customer_id as string | undefined,
    customerEmail: (data?.customer as Record<string, unknown>)?.email as string | undefined,
    
    // Billing info
    currentPeriodEnd: data?.current_period_end as string | undefined,
    canceledAt: data?.canceled_at as string | undefined,
    
    // Our metadata
    userId: metadata.user_id,
    tier: metadata.tier as PolarTier | undefined,
    billingCycle: metadata.billing_cycle as PolarBillingCycle | undefined,
    
    // Raw data for additional processing
    rawData: data,
  };
}

/**
 * Get subscription by ID from Polar API.
 */
export async function getPolarSubscription(
  subscriptionId: string
): Promise<PolarSubscription | null> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }

  const response = await fetch(
    `https://api.polar.sh/v1/subscriptions/${subscriptionId}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to fetch subscription");
  }

  const data = await response.json();
  
  return {
    id: data.id,
    status: data.status,
    productId: data.product_id,
    priceId: data.price_id,
    userId: data.metadata?.user_id,
    currentPeriodEnd: data.current_period_end,
    canceledAt: data.canceled_at,
    metadata: data.metadata || {},
  };
}

/**
 * Cancel a subscription.
 */
export async function cancelPolarSubscription(
  subscriptionId: string
): Promise<boolean> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }

  const response = await fetch(
    `https://api.polar.sh/v1/subscriptions/${subscriptionId}`,
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  return response.ok;
}

/**
 * List subscriptions for a customer.
 */
export async function listPolarSubscriptions(
  customerEmail: string
): Promise<PolarSubscription[]> {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const organizationId = process.env.POLAR_ORGANIZATION_ID;
  
  if (!accessToken || !organizationId) {
    throw new Error("Polar credentials not configured");
  }

  const params = new URLSearchParams({
    organization_id: organizationId,
    customer_email: customerEmail,
  });

  const response = await fetch(
    `https://api.polar.sh/v1/subscriptions?${params}`,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to list subscriptions");
  }

  const data = await response.json();
  
  return (data.items || []).map((sub: Record<string, unknown>) => ({
    id: sub.id as string,
    status: sub.status as PolarSubscription["status"],
    productId: sub.product_id as string,
    priceId: sub.price_id as string,
    userId: (sub.metadata as Record<string, string>)?.user_id,
    currentPeriodEnd: sub.current_period_end as string | null,
    canceledAt: sub.canceled_at as string | null,
    metadata: (sub.metadata as Record<string, string>) || {},
  }));
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Polar pricing recommendations based on market research.
 * 
 * Comparison with competitors:
 * - LeetCode Premium: $35/mo or $159/year
 * - AlgoExpert: $99 one-time
 * - Educative: $59/mo or $199/year
 * - Deep-ML: Free (ad-supported) + premium features
 * 
 * Our differentiation:
 * 1. RAG-specific (niche expertise > generalist)
 * 2. Production-ready code templates included
 * 3. Research paper integration (academic rigor)
 * 4. Real datasets (not toy examples)
 * 
 * Recommended pricing strategy (Phase 1 - Early Adopters):
 */
export const RECOMMENDED_PRICING = {
  // Individual tier - Competitive with LeetCode
  pro: {
    monthly: 29, // $29/mo - Below LeetCode's $35
    annual: 199, // $199/year (~$16.58/mo) - Big discount
    savings: "43%",
  },
  // Team tier - Enterprise value
  team: {
    monthly: 79, // $79/mo per seat (min 3 seats)
    annual: 599, // $599/year per seat
    minSeats: 3,
    savings: "37%",
  },
  // Lifetime - One-time payment
  lifetime: {
    price: 499, // $499 one-time
    value: "Best for committed learners",
    includes: "All future content updates",
  },
};

/**
 * Polar webhook event types we handle.
 */
export const POLAR_EVENTS = {
  // Checkout events
  CHECKOUT_CREATED: "checkout.created",
  CHECKOUT_UPDATED: "checkout.updated",
  
  // Subscription lifecycle
  SUBSCRIPTION_CREATED: "subscription.created",
  SUBSCRIPTION_UPDATED: "subscription.updated",
  SUBSCRIPTION_ACTIVE: "subscription.active",
  SUBSCRIPTION_CANCELED: "subscription.canceled",
  SUBSCRIPTION_REVOKED: "subscription.revoked",
  
  // Order/Payment events (one-time purchases)
  ORDER_CREATED: "order.created",
  
  // Benefit events (for feature access)
  BENEFIT_GRANT_CREATED: "benefit_grant.created",
  BENEFIT_GRANT_UPDATED: "benefit_grant.updated",
  BENEFIT_GRANT_REVOKED: "benefit_grant.revoked",
} as const;

/**
 * Get customer portal URL for managing subscription.
 */
export function getPolarCustomerPortalUrl(organizationSlug?: string): string {
  const slug = organizationSlug || process.env.NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG || "rag-academy";
  return `https://polar.sh/${slug}/portal`;
}
