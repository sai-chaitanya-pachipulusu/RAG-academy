/**
 * Paddle Webhook Handler
 * 
 * Handles all Paddle webhook events:
 * - subscription.created
 * - subscription.updated
 * - subscription.canceled
 * - subscription.past_due
 * - transaction.completed
 * - transaction.past_due
 * - transaction.ready
 * 
 * Webhook URL: /api/webhooks/paddle
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { 
  verifyPaddleWebhookSignature, 
  syncSubscriptionToDatabase,
  type PaddleTier 
} from "@/lib/payments/paddle";

// Initialize Supabase with service role
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(url, key);
}

/**
 * POST handler for Paddle webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the raw body for signature verification
    const payload = await request.text();
    const signature = request.headers.get("paddle-signature");
    
    // Verify webhook signature
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (webhookSecret) {
      const isValid = verifyPaddleWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn("PADDLE_WEBHOOK_SECRET not set, skipping signature verification");
    }
    
    // Parse the webhook payload
    const event = JSON.parse(payload);
    const eventType = event.event_type;
    
    console.log(`Received Paddle webhook: ${eventType}`, {
      eventId: event.event_id,
      occurredAt: event.occurred_at,
    });
    
    // Log webhook event for debugging
    await logWebhookEvent(event);
    
    // Handle different event types
    switch (eventType) {
      case "subscription.created":
        await handleSubscriptionCreated(event);
        break;
        
      case "subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
        
      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;
        
      case "subscription.past_due":
        await handleSubscriptionPastDue(event);
        break;
        
      case "transaction.completed":
        await handleTransactionCompleted(event);
        break;
        
      case "transaction.past_due":
        await handleTransactionPastDue(event);
        break;
        
      case "transaction.ready":
        await handleTransactionReady(event);
        break;
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
    
    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true, eventType });
    
  } catch (error: any) {
    console.error("Paddle webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription.created event
 */
async function handleSubscriptionCreated(event: any): Promise<void> {
  const subscription = event.data;
  const customData = subscription.custom_data || {};
  
  const userId = customData.userId;
  const tier = (customData.tier || "pro") as PaddleTier;
  
  if (!userId) {
    console.error("No userId found in subscription custom_data");
    return;
  }
  
  const supabase = getSupabaseAdmin();
  
  await syncSubscriptionToDatabase(supabase, {
    userId,
    tier,
    status: subscription.status,
    subscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_billing_period?.ends_at,
  });
  
  console.log(`Subscription created for user ${userId}: ${subscription.id}`);
}

/**
 * Handle subscription.updated event
 */
async function handleSubscriptionUpdated(event: any): Promise<void> {
  const subscription = event.data;
  const customData = subscription.custom_data || {};
  
  const userId = customData.userId;
  const tier = (customData.tier || "pro") as PaddleTier;
  
  if (!userId) {
    // Try to find user by subscription ID
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("subscription_id", subscription.id)
      .single();
    
    if (!data?.user_id) {
      console.error("No user found for subscription update:", subscription.id);
      return;
    }
  }
  
  const supabase = getSupabaseAdmin();
  
  await syncSubscriptionToDatabase(supabase, {
    userId: userId || subscription.customer_id,
    tier,
    status: subscription.status,
    subscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_billing_period?.ends_at,
  });
  
  console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
}

/**
 * Handle subscription.canceled event
 */
async function handleSubscriptionCanceled(event: any): Promise<void> {
  const subscription = event.data;
  const supabase = getSupabaseAdmin();
  
  // Find the user by subscription ID
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", subscription.id)
    .single();
  
  if (!data?.user_id) {
    console.error("No user found for canceled subscription:", subscription.id);
    return;
  }
  
  await syncSubscriptionToDatabase(supabase, {
    userId: data.user_id,
    tier: "pro", // Keep tier for access until period ends
    status: "canceled",
    subscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_billing_period?.ends_at,
    canceledAt: new Date().toISOString(),
  });
  
  console.log(`Subscription canceled for user ${data.user_id}: ${subscription.id}`);
}

/**
 * Handle subscription.past_due event
 */
async function handleSubscriptionPastDue(event: any): Promise<void> {
  const subscription = event.data;
  const supabase = getSupabaseAdmin();
  
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("subscription_id", subscription.id)
    .single();
  
  if (!data?.user_id) {
    console.error("No user found for past due subscription:", subscription.id);
    return;
  }
  
  await syncSubscriptionToDatabase(supabase, {
    userId: data.user_id,
    tier: "pro",
    status: "past_due",
    subscriptionId: subscription.id,
    currentPeriodEnd: subscription.current_billing_period?.ends_at,
  });
  
  console.log(`Subscription past due: ${subscription.id}`);
}

/**
 * Handle transaction.completed event
 */
async function handleTransactionCompleted(event: any): Promise<void> {
  const transaction = event.data;
  
  // Log successful payment
  await logTransaction({
    transactionId: transaction.id,
    status: "completed",
    amount: transaction.details?.totals?.total,
    currency: transaction.currency_code,
    customerId: transaction.customer_id,
    subscriptionId: transaction.subscription_id,
    createdAt: transaction.created_at,
  });
  
  console.log(`Transaction completed: ${transaction.id}`);
}

/**
 * Handle transaction.past_due event
 */
async function handleTransactionPastDue(event: any): Promise<void> {
  const transaction = event.data;
  
  await logTransaction({
    transactionId: transaction.id,
    status: "past_due",
    amount: transaction.details?.totals?.total,
    currency: transaction.currency_code,
    customerId: transaction.customer_id,
    subscriptionId: transaction.subscription_id,
    createdAt: transaction.created_at,
  });
  
  console.log(`Transaction past due: ${transaction.id}`);
}

/**
 * Handle transaction.ready event
 */
async function handleTransactionReady(event: any): Promise<void> {
  const transaction = event.data;
  
  await logTransaction({
    transactionId: transaction.id,
    status: "ready",
    amount: transaction.details?.totals?.total,
    currency: transaction.currency_code,
    customerId: transaction.customer_id,
    subscriptionId: transaction.subscription_id,
    createdAt: transaction.created_at,
  });
  
  console.log(`Transaction ready: ${transaction.id}`);
}

/**
 * Log webhook event for debugging
 */
async function logWebhookEvent(event: any): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    
    await supabase.from("webhook_logs").insert({
      provider: "paddle",
      event_type: event.event_type,
      event_id: event.event_id,
      payload: event,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't fail the webhook if logging fails
    console.error("Failed to log webhook event:", error);
  }
}

/**
 * Log transaction for analytics
 */
async function logTransaction(params: {
  transactionId: string;
  status: string;
  amount: string;
  currency: string;
  customerId: string;
  subscriptionId?: string;
  createdAt: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    
    await supabase.from("transactions").upsert({
      transaction_id: params.transactionId,
      status: params.status,
      amount: params.amount,
      currency: params.currency,
      customer_id: params.customerId,
      subscription_id: params.subscriptionId,
      created_at: params.createdAt,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "transaction_id",
    });
  } catch (error) {
    console.error("Failed to log transaction:", error);
  }
}

/**
 * GET handler for webhook verification (optional)
 * Some payment providers use this to verify the endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ 
    status: "Paddle webhook endpoint active",
    timestamp: new Date().toISOString(),
  });
}
