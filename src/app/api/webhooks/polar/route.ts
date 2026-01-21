/**
 * Polar.sh Webhook Handler
 * 
 * Receives events from Polar for:
 * - Checkout completion
 * - Subscription lifecycle (created, updated, canceled, revoked)
 * - Order/payment events (one-time purchases like lifetime)
 * - Benefit grants (feature access)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifyPolarWebhook,
  parsePolarWebhookEvent,
  POLAR_EVENTS,
} from "@/lib/payments/polar";

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase admin credentials not configured");
  }

  return createClient(url, serviceKey);
};

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("webhook-signature") || 
                      request.headers.get("x-polar-signature") || "";

    // Verify webhook signature (skip in development if not configured)
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (webhookSecret && !verifyPolarWebhook(signature, rawBody)) {
      console.error("Invalid Polar webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the webhook body
    const body = JSON.parse(rawBody);
    const event = parsePolarWebhookEvent(body);

    console.log(`Polar webhook received: ${event.eventType}`, {
      userId: event.userId,
      subscriptionId: event.subscriptionId,
      checkoutId: event.checkoutId,
    });

    const supabase = getSupabaseAdmin();

    // Handle different event types
    switch (event.eventType) {
      // Checkout events
      case POLAR_EVENTS.CHECKOUT_UPDATED:
        if (event.checkoutStatus === "succeeded") {
          await handleCheckoutSucceeded(supabase, event);
        }
        break;

      // Subscription lifecycle
      case POLAR_EVENTS.SUBSCRIPTION_CREATED:
      case POLAR_EVENTS.SUBSCRIPTION_ACTIVE:
        await handleSubscriptionCreated(supabase, event);
        break;

      case POLAR_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(supabase, event);
        break;

      case POLAR_EVENTS.SUBSCRIPTION_CANCELED:
        await handleSubscriptionCanceled(supabase, event);
        break;

      case POLAR_EVENTS.SUBSCRIPTION_REVOKED:
        await handleSubscriptionRevoked(supabase, event);
        break;

      // One-time orders (lifetime purchase)
      case POLAR_EVENTS.ORDER_CREATED:
        await handleOrderCreated(supabase, event);
        break;

      // Benefit grants
      case POLAR_EVENTS.BENEFIT_GRANT_CREATED:
        await handleBenefitGrantCreated(supabase, event);
        break;

      case POLAR_EVENTS.BENEFIT_GRANT_REVOKED:
        await handleBenefitGrantRevoked(supabase, event);
        break;

      default:
        console.log(`Unhandled Polar event: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutSucceeded(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  // Checkout succeeded - subscription or order will follow
  console.log(`Checkout succeeded: ${event.checkoutId}`, {
    userId: event.userId,
    tier: event.tier,
  });
}

async function handleSubscriptionCreated(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  if (!event.userId) {
    console.error("No userId in subscription event");
    return;
  }

  // Upsert subscription record
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: event.userId,
      polar_subscription_id: event.subscriptionId,
      polar_product_id: event.productId,
      polar_price_id: event.priceId,
      status: "active",
      tier: event.tier || "pro",
      billing_cycle: event.billingCycle || "monthly",
      current_period_end: event.currentPeriodEnd,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to create subscription:", error);
    throw error;
  }

  // Update user profile with subscription status
  await supabase
    .from("profiles")
    .update({
      subscription_tier: event.tier || "pro",
      subscription_status: "active",
    })
    .eq("id", event.userId);

  console.log(`Subscription created for user ${event.userId}`);
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  if (!event.subscriptionId) return;

  const status = mapPolarStatus(event.subscriptionStatus);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status,
      current_period_end: event.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", event.subscriptionId);

  if (error) {
    console.error("Failed to update subscription:", error);
  }

  // Also update by user_id as fallback
  if (event.userId) {
    await supabase
      .from("profiles")
      .update({
        subscription_status: status,
      })
      .eq("id", event.userId);
  }
}

async function handleSubscriptionCanceled(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  if (!event.subscriptionId) return;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: event.canceledAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("polar_subscription_id", event.subscriptionId);

  if (error) {
    console.error("Failed to cancel subscription:", error);
  }

  // Update user profile
  if (event.userId) {
    await supabase
      .from("profiles")
      .update({
        subscription_status: "canceled",
      })
      .eq("id", event.userId);
  }

  console.log(`Subscription canceled: ${event.subscriptionId}`);
}

async function handleSubscriptionRevoked(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  // Revoked = access removed immediately (refund, chargeback, etc.)
  if (!event.userId && !event.subscriptionId) return;

  const updateData = {
    status: "revoked",
    updated_at: new Date().toISOString(),
  };

  if (event.subscriptionId) {
    await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("polar_subscription_id", event.subscriptionId);
  }

  if (event.userId) {
    await supabase
      .from("profiles")
      .update({
        subscription_tier: "free",
        subscription_status: "revoked",
      })
      .eq("id", event.userId);
  }

  console.log(`Subscription revoked: ${event.subscriptionId || event.userId}`);
}

async function handleOrderCreated(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  // One-time order (lifetime purchase)
  if (!event.userId) return;

  // Check if this is a lifetime purchase based on tier metadata
  if (event.tier === "lifetime") {
    await supabase.from("subscriptions").upsert(
      {
        user_id: event.userId,
        polar_order_id: event.checkoutId,
        polar_product_id: event.productId,
        status: "lifetime",
        tier: "lifetime",
        billing_cycle: "lifetime",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    await supabase
      .from("profiles")
      .update({
        subscription_tier: "lifetime",
        subscription_status: "active",
      })
      .eq("id", event.userId);

    console.log(`Lifetime access granted to user: ${event.userId}`);
  }
}

async function handleBenefitGrantCreated(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  // Benefit granted - can be used for feature flags
  console.log(`Benefit granted for user: ${event.userId}`, event.rawData);
  
  // Optional: Store benefit grants for feature access
  // await supabase.from("benefit_grants").insert({ ... });
}

async function handleBenefitGrantRevoked(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: ReturnType<typeof parsePolarWebhookEvent>
) {
  // Benefit revoked - remove feature access
  console.log(`Benefit revoked for user: ${event.userId}`, event.rawData);
}

/**
 * Map Polar subscription status to our internal status.
 */
function mapPolarStatus(polarStatus: string | undefined): string {
  switch (polarStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    default:
      return polarStatus || "unknown";
  }
}
