import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentPricingPhase } from "@/lib/pricing/config";
import { 
  getPolarProductPriceId, 
  createPolarCheckout,
  type PolarTier,
  type PolarBillingCycle,
} from "@/lib/payments/polar";

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

    // Get the correct Polar product price ID
    const productPriceId = getPolarProductPriceId(
      tier as PolarTier, 
      billingCycle as PolarBillingCycle
    );

    if (!productPriceId) {
      // In development without Polar configured, return mock URL
      if (process.env.NODE_ENV === "development") {
        console.log("Polar not configured, returning mock checkout for development");
        return NextResponse.json({
          url: `/settings?checkout=mock&tier=${tier}&billing=${billingCycle}`,
          mock: true,
          message: "Polar not configured. Configure POLAR_PRODUCT_* env vars for real checkout.",
        });
      }
      
      return NextResponse.json(
        { error: "Product not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Create Polar checkout session
    const checkout = await createPolarCheckout({
      productPriceId,
      userId: user.id,
      userEmail: user.email!,
      tier: tier as PolarTier,
      billingCycle: billingCycle as PolarBillingCycle,
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
