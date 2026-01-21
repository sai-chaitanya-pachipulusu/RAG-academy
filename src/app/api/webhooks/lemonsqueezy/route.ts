import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/payments/lemonsqueezy";
import { sendThankYouEmail } from "@/lib/email/sender";

const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Handle different event types
    switch (event.meta.event_name) {
      case "order_created": {
        await handleOrderCreated(supabase, event);
        break;
      }

      case "subscription_created": {
        await handleSubscriptionCreated(supabase, event);
        break;
      }

      case "subscription_updated": {
        await handleSubscriptionUpdated(supabase, event);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        await handleSubscriptionCancelled(supabase, event);
        break;
      }

      case "subscription_payment_success": {
        await handlePaymentSuccess(supabase, event);
        break;
      }

      case "subscription_payment_failed": {
        await handlePaymentFailed(supabase, event);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.meta.event_name}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle order created (one-time purchase like lifetime)
 */
async function handleOrderCreated(supabase: any, event: any) {
  const order = event.data;
  const custom = order.attributes.first_order_item.product.custom_data || {};
  
  const userId = custom.userId || order.attributes.user_id;
  const userEmail = order.attributes.user_email;
  const tier = custom.tier || 'lifetime';
  const phase = custom.phase || 'phase3';

  if (!userId) {
    console.error("No user ID in order");
    return;
  }

  // Pricing map for grandfathering
  const pricingMap: Record<string, { monthly: number; annual: number }> = {
    phase1: { monthly: 1200, annual: 9900 },
    phase2: { monthly: 1500, annual: 14400 },
    phase3: { monthly: 1900, annual: 18000 },
  };

  const lockedPrices = pricingMap[phase] || pricingMap.phase3;

  // Create subscription record
  const { error } = await supabase.from("subscriptions").upsert({
    owner_id: userId,
    owner_email: userEmail,
    tier,
    status: "active",
    billing_cycle: "lifetime",
    subscribed_phase: phase,
    locked_monthly_price: tier === "team" ? lockedPrices.monthly * 3.25 : lockedPrices.monthly,
    locked_annual_price: tier === "team" ? lockedPrices.annual * 3.96 : lockedPrices.annual,
    max_seats: tier === "team" ? 5 : 1,
    lemon_customer_id: order.attributes.customer_id,
    lemon_order_id: order.id,
  });

  if (error) {
    console.error("Error creating subscription:", error);
  } else {
    console.log(`✅ Lifetime subscription created for user ${userId}`);
    
    // Send thank you email
    const price = order.attributes.total / 100;
    await sendThankYouEmail(userEmail, userName(custom), tier, price, phase);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(supabase: any, event: any) {
  const subscription = event.data;
  const custom = subscription.attributes.product.custom_data || {};
  
  const userId = custom.userId;
  const userEmail = subscription.attributes.user_email;
  const tier = custom.tier || 'pro';
  const billingCycle = custom.billingCycle || 'monthly';
  const phase = custom.phase || 'phase1';

  if (!userId) {
    console.error("No user ID in subscription");
    return;
  }

  // Pricing map for grandfathering
  const pricingMap: Record<string, { monthly: number; annual: number }> = {
    phase1: { monthly: 1200, annual: 9900 },
    phase2: { monthly: 1500, annual: 14400 },
    phase3: { monthly: 1900, annual: 18000 },
  };

  const lockedPrices = pricingMap[phase] || pricingMap.phase1;

  // Create subscription record
  const { error } = await supabase.from("subscriptions").upsert({
    owner_id: userId,
    owner_email: userEmail,
    tier,
    status: subscription.attributes.status,
    billing_cycle: billingCycle,
    subscribed_phase: phase,
    locked_monthly_price: tier === "team" ? lockedPrices.monthly * 3.25 : lockedPrices.monthly,
    locked_annual_price: tier === "team" ? lockedPrices.annual * 3.96 : lockedPrices.annual,
    max_seats: tier === "team" ? 5 : 1,
    lemon_customer_id: subscription.attributes.customer_id,
    lemon_subscription_id: subscription.id,
    current_period_start: new Date(subscription.attributes.renews_at),
    current_period_end: new Date(subscription.attributes.ends_at || subscription.attributes.renews_at),
  });

  if (error) {
    console.error("Error creating subscription:", error);
  } else {
    console.log(`✅ Subscription created for user ${userId}`);
    
    // Send thank you email
    const price = subscription.attributes.first_subscription_item.price / 100;
    await sendThankYouEmail(userEmail, userName(custom), tier, price, phase);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(supabase: any, event: any) {
  const subscription = event.data;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: subscription.attributes.status,
      current_period_start: new Date(subscription.attributes.renews_at),
      current_period_end: new Date(
        subscription.attributes.ends_at || subscription.attributes.renews_at
      ),
      canceled_at: subscription.attributes.cancelled
        ? new Date()
        : null,
    })
    .eq("lemon_subscription_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
  }
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(supabase: any, event: any) {
  const subscription = event.data;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date(),
    })
    .eq("lemon_subscription_id", subscription.id);

  if (error) {
    console.error("Error cancelling subscription:", error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(supabase: any, event: any) {
  const subscription = event.data;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
    })
    .eq("lemon_subscription_id", subscription.id);

  if (error) {
    console.error("Error updating payment status:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(supabase: any, event: any) {
  const subscription = event.data;

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
    })
    .eq("lemon_subscription_id", subscription.id);

  if (error) {
    console.error("Error updating payment failure:", error);
  }
}

/**
 * Extract user name from custom data or email
 */
function userName(custom: any): string {
  return custom.userName || custom.userEmail?.split('@')[0] || 'there';
}
