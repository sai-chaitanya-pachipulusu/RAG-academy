import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@supabase/supabase-js";
import { getDaysRemainingInPhase, getCurrentPricingPhase, getNextPhaseInfo } from "@/lib/pricing/config";
import {
  send7DayCountdownEmail,
  send3DayCountdownEmail,
  send1DayCountdownEmail,
} from "@/lib/email/sender";

/**
 * Cron job to send countdown emails
 * Schedule: Daily at 9 AM EST, but only sends on days 7, 3, and 1
 * 
 * Total emails per user per phase: 3 (not daily!)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const daysRemaining = getDaysRemainingInPhase(now);
    const currentPhase = getCurrentPricingPhase(now);
    const nextPhaseInfo = getNextPhaseInfo(now);

    // Skip if we're in the final phase (no more price increases)
    if (!daysRemaining || !nextPhaseInfo.nextPhase) {
      return NextResponse.json({
        message: "No countdown needed - in final phase",
        phase: currentPhase.phase,
      });
    }

    // ONLY send emails on specific days (not daily!)
    let emailType: "7day" | "3day" | "1day" | null = null;
    
    if (daysRemaining === 7) {
      emailType = "7day";
    } else if (daysRemaining === 3) {
      emailType = "3day";
    } else if (daysRemaining === 1) {
      emailType = "1day";
    } else {
      // Not a milestone day - skip
      return NextResponse.json({
        message: `Not a milestone day (${daysRemaining} days remaining)`,
        daysRemaining,
      });
    }

    const currentPrice = currentPhase.tiers.paid.price.monthly;
    const nextPrice = nextPhaseInfo.nextPhase.tiers.paid.price.monthly;

    // Initialize Supabase with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
    }
    const supabase = createServerClient(supabaseUrl, supabaseKey);

    // Get free tier users who haven't upgraded
    const { data: freeUsers, error: usersError } = await supabase.rpc(
      'get_free_tier_users'
    );

    if (usersError) {
      console.error("Error fetching free users:", usersError);
      
      // Fallback: Manual query
      const { data: allUsers } = await supabase.auth.admin.listUsers();
      const { data: paidSubs } = await supabase
        .from("subscriptions")
        .select("user_id")
        .in("tier", ["pro", "team", "lifetime"])
        .eq("status", "active");

      const paidUserIds = new Set(paidSubs?.map(s => s.user_id) || []);
      const freeUsersList = allUsers?.users.filter(u => !paidUserIds.has(u.id)) || [];
      
      return await sendEmailsToUsers(freeUsersList, emailType, daysRemaining, currentPrice, nextPrice, supabase, currentPhase.phase);
    }

    return await sendEmailsToUsers(freeUsers, emailType, daysRemaining, currentPrice, nextPrice, supabase, currentPhase.phase);

  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error.message },
      { status: 500 }
    );
  }
}

async function sendEmailsToUsers(
  users: any[] | null,
  emailType: "7day" | "3day" | "1day",
  daysRemaining: number,
  currentPrice: number,
  nextPrice: number,
  supabase: any,
  phase: string
) {
  if (!users || users.length === 0) {
    return NextResponse.json({ message: "No users to email" });
  }

  // Check if we've already sent this email type for this phase
  const emailKey = `${phase}_${emailType}`;
  
  const results = await Promise.allSettled(
    users.map(async (user: any) => {
      const userEmail = user.email;
      const userName = user.user_metadata?.name || user.raw_user_meta_data?.name || userEmail?.split("@")[0] || "there";

      // Check if this user already received this email
      const { data: existingEmail } = await supabase
        .from("sent_emails")
        .select("id")
        .eq("user_id", user.id)
        .eq("email_type", emailKey)
        .single();

      if (existingEmail) {
        console.log(`Skipping ${userEmail} - already sent ${emailKey}`);
        return { skipped: true };
      }

      // Send email
      let result;
      switch (emailType) {
        case "7day":
          result = await send7DayCountdownEmail(userEmail, daysRemaining, currentPrice, nextPrice);
          break;
        case "3day":
          result = await send3DayCountdownEmail(userEmail, daysRemaining, currentPrice, nextPrice);
          break;
        case "1day":
          result = await send1DayCountdownEmail(userEmail, currentPrice, nextPrice);
          break;
      }

      // Track sent email
      if (result?.success) {
        await supabase.from("sent_emails").insert({
          user_id: user.id,
          email_type: emailKey,
          sent_at: new Date().toISOString(),
        });
      }

      return result;
    })
  );

  const successful = results.filter((r: any) => r.status === "fulfilled" && r.value?.success).length;
  const skipped = results.filter((r: any) => r.status === "fulfilled" && r.value?.skipped).length;
  const failed = results.filter((r: any) => r.status === "rejected").length;

  return NextResponse.json({
    message: `Sent ${emailType} countdown emails`,
    daysRemaining,
    totalUsers: users.length,
    successful,
    skipped,
    failed,
    currentPrice,
    nextPrice,
    emailType,
  });
}
