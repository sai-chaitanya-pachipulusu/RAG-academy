/**
 * Lemon Squeezy Integration
 * Replaces Stripe as our payment processor
 * 
 * Setup:
 * 1. Sign up at lemonsqueezy.com
 * 2. Create products for Pro/Team tiers
 * 3. Get API key and store ID
 * 4. Add to .env:
 *    - LEMON_SQUEEZY_API_KEY
 *    - LEMON_SQUEEZY_STORE_ID
 *    - LEMON_SQUEEZY_WEBHOOK_SECRET
 */

import {
  lemonSqueezySetup,
  createCheckout as lsCreateCheckout,
  getSubscription as lsGetSubscription,
  cancelSubscription as lsCancelSubscription,
} from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy client
lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY || '',
  onError: (error) => {
    console.error('Lemon Squeezy error:', error);
  },
});

// Product and Variant IDs (set these in .env after creating in Lemon Squeezy dashboard)
export const LEMON_PRODUCTS = {
  pro: process.env.NEXT_PUBLIC_LEMON_PRODUCT_PRO_ID || '',
  team: process.env.NEXT_PUBLIC_LEMON_PRODUCT_TEAM_ID || '',
  lifetime: process.env.NEXT_PUBLIC_LEMON_PRODUCT_LIFETIME_ID || '',
};

export const LEMON_VARIANTS = {
  // Phase 1
  phase1_pro_monthly: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE1_PRO_MONTHLY || '',
  phase1_pro_annual: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE1_PRO_ANNUAL || '',
  phase1_team_monthly: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE1_TEAM_MONTHLY || '',
  phase1_team_annual: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE1_TEAM_ANNUAL || '',
  
  // Phase 2
  phase2_pro_monthly: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE2_PRO_MONTHLY || '',
  phase2_pro_annual: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE2_PRO_ANNUAL || '',
  phase2_team_monthly: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE2_TEAM_MONTHLY || '',
  phase2_team_annual: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE2_TEAM_ANNUAL || '',
  
  // Phase 3
  phase3_pro_monthly: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE3_PRO_MONTHLY || '',
  phase3_pro_annual: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE3_PRO_ANNUAL || '',
  phase3_team_monthly: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE3_TEAM_MONTHLY || '',
  phase3_team_annual: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE3_TEAM_ANNUAL || '',
  phase3_lifetime: process.env.NEXT_PUBLIC_LEMON_VARIANT_PHASE3_LIFETIME || '',
};

/**
 * Get the correct Lemon Squeezy variant ID based on phase, tier, and billing cycle
 */
export function getLemonVariantId(
  phase: 'phase1' | 'phase2' | 'phase3',
  tier: 'pro' | 'team' | 'lifetime',
  billingCycle: 'monthly' | 'annual' | 'lifetime'
): string {
  if (tier === 'lifetime') {
    return LEMON_VARIANTS.phase3_lifetime;
  }
  
  const key = `${phase}_${tier}_${billingCycle}` as keyof typeof LEMON_VARIANTS;
  return LEMON_VARIANTS[key] || '';
}

/**
 * Create a checkout session
 */
export async function createCheckoutSession(params: {
  variantId: string;
  userId: string;
  userEmail: string;
  tier: string;
  billingCycle: string;
  phase: string;
}): Promise<{ url: string }> {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID || '';
  
  const checkout = await lsCreateCheckout(storeId, params.variantId, {
    checkoutData: {
      email: params.userEmail,
      custom: {
        user_id: params.userId,
        tier: params.tier,
        billing_cycle: params.billingCycle,
        phase: params.phase,
      },
    },
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    testMode: process.env.NODE_ENV === 'development',
  });

  const url = checkout.data?.data?.attributes?.url;
  if (!url) {
    throw new Error('Failed to create checkout session');
  }

  return { url };
}

/**
 * Create a customer portal session (for managing subscriptions)
 */
export async function createCustomerPortalSession(customerId: string): Promise<{ url: string }> {
  // Lemon Squeezy customer portal URL format
  const portalUrl = `https://app.lemonsqueezy.com/my-orders/${customerId}`;
  
  return { url: portalUrl };
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const subscription = await lsGetSubscription(subscriptionId);
  return subscription.data?.data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const result = await lsCancelSubscription(subscriptionId);
  return result.data?.data;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}
