/**
 * Polar Webhook Handler
 *
 * Handles all Polar webhook events:
 * - checkout.created
 * - checkout.completed
 * - checkout.payment_failed
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 * - subscription.expired
 *
 * Webhook URL: /api/webhooks/polar
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPolarWebhookSignature, type PolarTier } from "@/lib/payments/polar";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = await request.text();
    const signature = request.headers.get("polar-signature");
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (signature) {
      const isValid = verifyPolarWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(payload);
    const eventType = event.type;
    const data = event.data;

    console.log(`Received Polar webhook: ${eventType}`);

    await logWebhookEvent(event);

    switch (eventType) {
      case "checkout.completed":
        await handleCheckoutCompleted(data);
        break;

      case "checkout.payment_failed":
        await handleCheckoutPaymentFailed(data);
        break;

      case "subscription.created":
        await handleSubscriptionCreated(data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(data);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(data);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(data);
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true, eventType });
  } catch (error: any) {
    console.error("Polar webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "Polar webhook endpoint active",
    timestamp: new Date().toISOString(),
  });
}

async function handleCheckoutCompleted(data: any): Promise<void> {
  const customData = data.metadata || {};
  const userId = customData.userId;
  const tier = (customData.tier || "pro") as PolarTier;

  if (!userId) {
    console.error("No userId found in checkout completed metadata");
    return;
  }

  const supabase = getSupabaseAdmin();

  await syncSubscriptionToDatabase(supabase, {
    userId,
    tier,
    status: "active",
    subscriptionId: data.subscriptionId,
    currentPeriodEnd: data.currentPeriodEnd,
  });

  console.log(`Checkout completed for user ${userId}: ${data.id}`);
}

async function handleCheckoutPaymentFailed(data: any): Promise<void> {
  const customData = data.metadata || {};
  const userId = customData.userId;

  console.log(`Checkout payment failed for user ${userId}: ${data.id}`);
}

async function handleSubscriptionCreated(data: any): Promise<void> {
  const customData = data.customerMetadata || {};
  const userId = customData.userId;
  const tier = (customData.tier || "pro") as PolarTier;

  if (!userId) {
    console.error("No userId found in subscription created metadata");
    return;
  }

  const supabase = getSupabaseAdmin();

  await syncSubscriptionToDatabase(supabase, {
    userId,
    tier,
    status: "active",
    subscriptionId: data.id,
    currentPeriodEnd: data.currentPeriodEnd,
  });

  console.log(`Subscription created for user ${userId}: ${data.id}`);
}

async function handleSubscriptionUpdated(data: any): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("user_id, tier")
    .eq("subscription_id", data.id)
    .single();

  const userId = existingSub?.user_id;
  const tier = existingSub?.tier || "pro";

  if (!userId) {
    console.error("No user found for subscription update:", data.id);
    return;
  }

  await syncSubscriptionToDatabase(supabase, {
    userId,
    tier: tier as PolarTier,
    status: mapPolarStatus(data.status),
    subscriptionId: data.id,
    currentPeriodEnd: data.currentPeriodEnd,
  });

  console.log(`Subscription updated: ${data.id}, status: ${data.status}`);
}

async function handleSubscriptionCanceled(data: any): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", data.id)
    .single();

  if (!existingSub?.user_id) {
    console.error("No user found for canceled subscription:", data.id);
    return;
  }

  await syncSubscriptionToDatabase(supabase, {
    userId: existingSub.user_id,
    tier: "pro",
    status: "canceled",
    subscriptionId: data.id,
    currentPeriodEnd: data.currentPeriodEnd,
    canceledAt: new Date().toISOString(),
  });

  console.log(`Subscription canceled for user ${existingSub.user_id}: ${data.id}`);
}

async function handleSubscriptionExpired(data: any): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", data.id)
    .single();

  if (!existingSub?.user_id) {
    console.error("No user found for expired subscription:", data.id);
    return;
  }

  await syncSubscriptionToDatabase(supabase, {
    userId: existingSub.user_id,
    tier: "free",
    status: "expired",
    subscriptionId: data.id,
  });

  console.log(`Subscription expired for user ${existingSub.user_id}: ${data.id}`);
}

function mapPolarStatus(polarStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
  };
  return statusMap[polarStatus] || polarStatus;
}

async function logWebhookEvent(event: any): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();

    await supabase.from("webhook_logs").insert({
      provider: "polar",
      event_type: event.type,
      event_id: event.id,
      payload: event,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log webhook event:", error);
  }
}

async function syncSubscriptionToDatabase(
  supabase: any,
  params: {
    userId: string;
    tier: PolarTier;
    status: string;
    subscriptionId?: string;
    currentPeriodEnd?: string;
    canceledAt?: string;
  }
): Promise<void> {
  const { error } = await supabase
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

  if (error) {
    throw new Error(`Failed to sync subscription: ${error.message}`);
  }
}
