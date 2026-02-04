import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentPricingPhase } from "@/lib/pricing/config";
import { 
  getPaddleProductId, 
  createPaddleCheckout,
  type PaddleTier,
  type PaddleBillingCycle,
} from "@/lib/payments/paddle";

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Get auth token from request
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || 
                  request.cookies.get("sb-access-token")?.value;

    // Try to get user from session
    let user = null;
    if (token) {
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
      }
    }

    // If no token auth, try cookie-based auth
    if (!user) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        // Parse cookies and try to get session
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { tier, billingCycle } = body;

    // Validate input
    if (!tier || !billingCycle) {
      return NextResponse.json(
        { error: "Missing tier or billingCycle" },
        { status: 400 }
      );
    }

    if (!["pro", "team", "lifetime"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    if (!["monthly", "annual", "lifetime"].includes(billingCycle)) {
      return NextResponse.json(
        { error: "Invalid billing cycle" },
        { status: 400 }
      );
    }

    // Get current pricing phase (for analytics/tracking)
    const currentPhase = getCurrentPricingPhase();
    console.log(`Checkout initiated - Phase: ${currentPhase.name}, Tier: ${tier}, Billing: ${billingCycle}`);

    // Get the correct Paddle product price ID
    const productPriceId = getPaddleProductId(
      tier as PaddleTier, 
      billingCycle as PaddleBillingCycle
    );

    if (!productPriceId) {
      // In development without Paddle configured, return mock URL
      if (process.env.NODE_ENV === "development") {
        console.log("Paddle not configured, returning mock checkout for development");
        return NextResponse.json({
          url: `/settings?checkout=mock&tier=${tier}&billing=${billingCycle}`,
          mock: true,
          message: "Paddle not configured. Configure PADDLE_PRODUCT_* env vars for real checkout.",
        });
      }
      
      return NextResponse.json(
        { error: "Product not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Create Paddle checkout session
    const checkout = await createPaddleCheckout({
      productId: productPriceId,
      userId: user.id,
      userEmail: user.email!,
      tier: tier as PaddleTier,
      billingCycle: billingCycle as PaddleBillingCycle,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings?success=true`,
      metadata: {
        pricing_phase: currentPhase.name,
      },
    });

    // Return the checkout URL for redirect
    return NextResponse.json({
      url: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create checkout session", details: message },
      { status: 500 }
    );
  }
}
