/**
 * Test Payment API Route
 * 
 * Provides endpoints for testing payment flows:
 * - Create test checkout sessions
 * - Simulate webhook events
 * - Validate environment configuration
 * - Test different payment scenarios
 * 
 * Base URL: /api/payments/test
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { 
  createPolarCheckout, 
  getPolarProductPriceId,
  TEST_CARDS,
  type PolarTier,
  type PolarBillingCycle 
} from "@/lib/payments/polar";
import { validatePaymentEnvironment } from "@/lib/payments/validate";

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
 * POST /api/payments/test
 * 
 * Actions:
 * - create-checkout: Create a test checkout session
 * - simulate-webhook: Simulate a webhook event
 * - validate-env: Validate environment configuration
 * - test-cards: Get test card numbers
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "create-checkout":
        return handleCreateCheckout(body);
        
      case "simulate-webhook":
        return handleSimulateWebhook(body);
        
      case "validate-env":
        return handleValidateEnvironment();
        
      case "test-cards":
        return handleGetTestCards();
        
      case "create-test-subscription":
        return handleCreateTestSubscription(body);
        
      case "simulate-payment-scenario":
        return handleSimulatePaymentScenario(body);
        
      default:
        return NextResponse.json(
          { error: "Unknown action", availableActions: [
            "create-checkout",
            "simulate-webhook", 
            "validate-env",
            "test-cards",
            "create-test-subscription",
            "simulate-payment-scenario"
          ]},
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Test payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/test
 * Returns test configuration and available endpoints
 */
export async function GET(): Promise<NextResponse> {
  const validation = await validatePaymentEnvironment();
  
  return NextResponse.json({
    status: "Payment test API active",
    provider: "polar",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      POST: {
        "/api/payments/test": {
          actions: [
            "create-checkout",
            "simulate-webhook",
            "validate-env", 
            "test-cards",
            "create-test-subscription",
            "simulate-payment-scenario"
          ]
        }
      }
    },
    validation,
    testCards: TEST_CARDS,
  });
}

/**
 * Handle create-checkout action
 */
async function handleCreateCheckout(body: any): Promise<NextResponse> {
  const { tier, billingCycle, testScenario } = body;
  
  // Validate inputs
  if (!tier || !billingCycle) {
    return NextResponse.json(
      { error: "Missing required fields: tier, billingCycle" },
      { status: 400 }
    );
  }
  
  const validTiers: PolarTier[] = ["pro", "team", "lifetime"];
  const validCycles: PolarBillingCycle[] = ["monthly", "annual", "lifetime"];
  
  if (!validTiers.includes(tier)) {
    return NextResponse.json(
      { error: `Invalid tier. Must be one of: ${validTiers.join(", ")}` },
      { status: 400 }
    );
  }
  
  if (!validCycles.includes(billingCycle)) {
    return NextResponse.json(
      { error: `Invalid billingCycle. Must be one of: ${validCycles.join(", ")}` },
      { status: 400 }
    );
  }
  
  // Get product ID
  const productId = getPolarProductPriceId(tier, billingCycle);
  
  if (!productId) {
    return NextResponse.json(
      { 
        error: "Product not configured",
        message: `No product ID found for ${tier}/${billingCycle}. Check environment variables.`,
        envVar: `POLAR_PRODUCT_${tier.toUpperCase()}_${billingCycle.toUpperCase()}`
      },
      { status: 500 }
    );
  }
  
  try {
    // Create test checkout
    const checkout = await createPolarCheckout({
      productPriceId: productId,
      userId: body.userId || "test-user-" + Date.now(),
      userEmail: body.email || "",
      tier,
      billingCycle,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/billing/test?success=true`,
      metadata: {
        test: "true",
        scenario: testScenario || "default",
      },
    });
    
    return NextResponse.json({
      success: true,
      checkout: {
        id: checkout.id,
        url: checkout.url,
      },
      testInstructions: {
        message: "Use the checkout URL to complete a test payment",
        cards: TEST_CARDS,
        nextSteps: [
          "Open the checkout URL",
          "Enter test card details",
          "Complete the payment",
          "Check webhook logs at /admin/payments"
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create checkout", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle simulate-webhook action
 */
async function handleSimulateWebhook(body: any): Promise<NextResponse> {
  const { eventType, payload } = body;
  
  if (!eventType) {
    return NextResponse.json(
      { error: "Missing eventType" },
      { status: 400 }
    );
  }
  
  const validEvents = [
    "subscription.created",
    "subscription.updated", 
    "subscription.canceled",
    "subscription.past_due",
    "transaction.completed",
    "transaction.past_due",
    "transaction.ready"
  ];
  
  if (!validEvents.includes(eventType)) {
    return NextResponse.json(
      { error: `Invalid eventType. Must be one of: ${validEvents.join(", ")}` },
      { status: 400 }
    );
  }
  
  // Create simulated webhook payload
  const simulatedEvent = {
    event_id: `test-${Date.now()}`,
    event_type: eventType,
    occurred_at: new Date().toISOString(),
    data: {
      id: `test-${eventType.replace(".", "-")}-${Date.now()}`,
      ...payload,
    }
  };
  
    // Forward to actual webhook handler
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/polar`;
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "polar-signature": "test-signature",
      },
      body: JSON.stringify(simulatedEvent),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: "Webhook simulation failed", details: error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Simulated ${eventType} webhook`,
      event: simulatedEvent,
      webhookResponse: await response.json(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to simulate webhook", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle validate-env action
 */
async function handleValidateEnvironment(): Promise<NextResponse> {
  const validation = await validatePaymentEnvironment();
  
  return NextResponse.json(validation);
}

/**
 * Handle test-cards action
 */
async function handleGetTestCards(): Promise<NextResponse> {
  return NextResponse.json({
    testCards: TEST_CARDS,
    instructions: {
      general: "Use these test card numbers in the Polar checkout",
      expiry: "Any future date (e.g., 12/25)",
      cvc: "Any 3 digits (e.g., 123)",
      zip: "Any 5 digits (e.g., 12345)",
    },
    scenarios: {
      success: "Use the success card for a normal payment flow",
      decline: "Use the declined card to test error handling",
      threeDSecure: "Use the 3D Secure card to test authentication flow",
      insufficientFunds: "Use this card to test retry logic",
    }
  });
}

/**
 * Handle create-test-subscription action
 * Creates a test subscription directly in the database
 */
async function handleCreateTestSubscription(body: any): Promise<NextResponse> {
  const { userId, tier, status, subscriptionId } = body;
  
  if (!userId || !tier) {
    return NextResponse.json(
      { error: "Missing required fields: userId, tier" },
      { status: 400 }
    );
  }
  
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      user_id: userId,
      tier,
      status: status || "active",
      subscription_id: subscriptionId || `test-sub-${Date.now()}`,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    } as any, {
      onConflict: "user_id",
    });
  
  if (error) {
    return NextResponse.json(
      { error: "Failed to create test subscription", details: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    message: "Test subscription created",
    subscription: {
      userId,
      tier,
      status: status || "active",
      subscriptionId: subscriptionId || `test-sub-${Date.now()}`,
    }
  });
}

/**
 * Handle simulate-payment-scenario action
 * Simulates complete payment scenarios for testing
 */
async function handleSimulatePaymentScenario(body: any): Promise<NextResponse> {
  const { scenario } = body;
  
  const scenarios: Record<string, () => Promise<NextResponse>> = {
    "new-subscription": () => simulateNewSubscription(body),
    "upgrade-tier": () => simulateUpgradeTier(body),
    "cancel-subscription": () => simulateCancelSubscription(body),
    "payment-failure": () => simulatePaymentFailure(body),
    "subscription-renewal": () => simulateSubscriptionRenewal(body),
  };
  
  if (!scenarios[scenario]) {
    return NextResponse.json(
      { 
        error: "Unknown scenario",
        availableScenarios: Object.keys(scenarios)
      },
      { status: 400 }
    );
  }
  
  return scenarios[scenario]();
}

// Scenario simulation functions
async function simulateNewSubscription(body: any): Promise<NextResponse> {
  return NextResponse.json({
    scenario: "new-subscription",
    description: "New user subscribes to Pro monthly",
    steps: [
      { step: 1, action: "User selects Pro Monthly plan" },
      { step: 2, action: "Checkout created with test card 4242 4242 4242 4242" },
      { step: 3, action: "Payment successful, webhook received" },
      { step: 4, action: "Subscription activated in database" },
      { step: 5, action: "User redirected to success page" },
    ],
    testCard: TEST_CARDS.success,
    expectedResult: "Active subscription with Pro tier",
  });
}

async function simulateUpgradeTier(body: any): Promise<NextResponse> {
  return NextResponse.json({
    scenario: "upgrade-tier",
    description: "User upgrades from Pro monthly to Pro annual",
    steps: [
      { step: 1, action: "User initiates upgrade from monthly to annual" },
      { step: 2, action: "Prorated charge calculated" },
      { step: 3, action: "Payment processed for upgrade" },
      { step: 4, action: "Subscription updated with new billing cycle" },
      { step: 5, action: "Confirmation email sent" },
    ],
    expectedResult: "Subscription updated to annual billing",
  });
}

async function simulateCancelSubscription(body: any): Promise<NextResponse> {
  return NextResponse.json({
    scenario: "cancel-subscription",
    description: "User cancels their subscription",
    steps: [
      { step: 1, action: "User clicks cancel subscription" },
      { step: 2, action: "Cancellation scheduled for end of period" },
      { step: 3, action: "Webhook received: subscription.canceled" },
      { step: 4, action: "Status updated to 'canceled' in database" },
      { step: 5, action: "User retains access until period end" },
    ],
    expectedResult: "Subscription status: canceled, access until period end",
  });
}

async function simulatePaymentFailure(body: any): Promise<NextResponse> {
  return NextResponse.json({
    scenario: "payment-failure",
    description: "Subscription renewal payment fails",
    steps: [
      { step: 1, action: "Renewal payment attempted" },
      { step: 2, action: "Payment fails with declined card" },
      { step: 3, action: "Webhook received: transaction.past_due" },
      { step: 4, action: "Subscription status: past_due" },
      { step: 5, action: "Retry logic initiated" },
      { step: 6, action: "User notified of payment failure" },
    ],
    testCard: TEST_CARDS.declined,
    expectedResult: "Subscription past_due, retry scheduled",
  });
}

async function simulateSubscriptionRenewal(body: any): Promise<NextResponse> {
  return NextResponse.json({
    scenario: "subscription-renewal",
    description: "Successful subscription renewal",
    steps: [
      { step: 1, action: "Billing period ends" },
      { step: 2, action: "Automatic renewal payment processed" },
      { step: 3, action: "Webhook received: transaction.completed" },
      { step: 4, action: "Subscription period extended" },
      { step: 5, action: "Receipt email sent to user" },
    ],
    expectedResult: "Subscription renewed, period extended",
  });
}
