/**
 * Email templates for RAG Academy pricing countdown
 * Uses Resend (resend.com) for sending
 */

import { getPlatformStats } from "@/lib/challenges/catalog";


export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Welcome email for new signups
 */
export function getWelcomeEmail(userName: string, freeChallengeCount: number): EmailTemplate {
  return {
    subject: "Welcome to RAG Academy! 🎉",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1d1d1f; font-size: 28px; margin-bottom: 16px;">Welcome to RAG Academy!</h1>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">Hi ${userName},</p>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">
          Welcome to the most comprehensive platform for learning RAG engineering. You now have access to:
        </p>
        
        <ul style="color: #424245; font-size: 17px; line-height: 1.75;">
          <li>${freeChallengeCount} foundational challenges</li>
          <li>Essential playbooks and guides</li>
          <li>Tool comparison matrices</li>
          <li>Community support</li>
        </ul>
        
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 16px; padding: 24px; margin: 32px 0;">
          <p style="color: #92400e; font-size: 15px; font-weight: 600; margin: 0;">
            🎉 Early Bird Special - Limited Time!
          </p>
          <p style="color: #78350f; font-size: 14px; margin-top: 8px; line-height: 1.6;">
            Lock in Pro access at <strong>$12/month forever</strong> before the price increases to $15/month on April 5, 2026.
          </p>
        </div>
        
        <a href="https://rag-academy.com/pricing" style="display: inline-block; background: #1d1d1f; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          View Pricing →
        </a>
        
        <p style="color: #6e6e73; font-size: 15px; margin-top: 32px;">
          Ready to start learning? Head to your <a href="https://rag-academy.com/learn" style="color: #1d1d1f;">curriculum</a>.
        </p>
        
        <p style="color: #6e6e73; font-size: 15px; margin-top: 24px;">
          Best,<br />
          The RAG Academy Team
        </p>
      </div>
    `,
    text: `Welcome to RAG Academy!

Hi ${userName},

Welcome to the most comprehensive platform for learning RAG engineering. You now have access to:

- ${freeChallengeCount} foundational challenges
- Essential playbooks and guides
- Tool comparison matrices
- Community support

🎉 Early Bird Special - Limited Time!

Lock in Pro access at $12/month forever before the price increases to $15/month on April 5, 2026.

View Pricing: https://rag-academy.com/pricing

Ready to start learning? Head to your curriculum: https://rag-academy.com/learn

Best,
The RAG Academy Team
    `,
  };
}

/**
 * 7 days before price increase
 */
export function getCountdown7DaysEmail(daysRemaining: number, currentPrice: number, nextPrice: number): EmailTemplate {
  return {
    subject: `⏰ ${daysRemaining} days left to lock in $${currentPrice}/month`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1d1d1f; font-size: 28px; margin-bottom: 16px;">Price increase in ${daysRemaining} days</h1>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">
          The Early Bird special is ending soon. You have <strong>${daysRemaining} days</strong> to lock in Pro access at $${currentPrice}/month forever.
        </p>
        
        <div style="background: #1d1d1f; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
          <p style="color: #f5f5f7; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
            Current Price
          </p>
          <p style="color: white; font-size: 56px; font-weight: 700; margin: 16px 0; line-height: 1;">
            $${currentPrice}<span style="font-size: 24px; font-weight: 400;">/mo</span>
          </p>
          <p style="color: #a1a1aa; font-size: 14px; margin: 0;">
            Increases to $${nextPrice}/mo on April 5, 2026
          </p>
        </div>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">
          When you upgrade now, you'll get:
        </p>
        
        <ul style="color: #424245; font-size: 17px; line-height: 1.75;">
          <li>All ${getPlatformStats().totalChallenges}+ challenges (including advanced techniques)</li>
          <li>Lifetime price lock at $${currentPrice}/month</li>
          <li>Progress tracking & analytics</li>
          <li>Certificate of completion</li>
          <li>Priority support</li>
        </ul>
        
        <a href="https://rag-academy.com/checkout?tier=pro&billing=annual" style="display: inline-block; background: #1d1d1f; color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 24px;">
          Upgrade Now →
        </a>
        
        <p style="color: #6e6e73; font-size: 14px; margin-top: 32px;">
          Questions? Reply to this email - we're here to help!
        </p>
      </div>
    `,
    text: `Price increase in ${daysRemaining} days

The Early Bird special is ending soon. You have ${daysRemaining} days to lock in Pro access at $${currentPrice}/month forever.

Current Price: $${currentPrice}/mo
Increases to $${nextPrice}/mo on April 5, 2026

When you upgrade now, you'll get:
- All ${getPlatformStats().totalChallenges}+ challenges (including 2025 advanced techniques)
- Lifetime price lock at $${currentPrice}/month
- Progress tracking & analytics
- Certificate of completion
- Priority support

Upgrade Now: https://rag-academy.com/checkout?tier=pro&billing=annual

Questions? Reply to this email - we're here to help!
    `,
  };
}

/**
 * 3 days before price increase
 */
export function getCountdown3DaysEmail(daysRemaining: number, currentPrice: number, nextPrice: number): EmailTemplate {
  return {
    subject: `🚨 Last chance: $${currentPrice}/month ends in ${daysRemaining} days`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
          <p style="color: white; font-size: 20px; font-weight: 700; margin: 0;">
            ⏰ Only ${daysRemaining} days left!
          </p>
          <p style="color: #fecaca; font-size: 14px; margin-top: 8px;">
            Early Bird pricing ends April 4, 2026
          </p>
        </div>
        
        <h1 style="color: #1d1d1f; font-size: 28px; margin-bottom: 16px;">Don't miss out</h1>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">
          This is your last chance to lock in <strong>$${currentPrice}/month forever</strong>. In ${daysRemaining} days, the price increases to $${nextPrice}/month.
        </p>
        
        <div style="border-left: 4px solid #1d1d1f; padding-left: 16px; margin: 24px 0;">
          <p style="color: #1d1d1f; font-size: 19px; font-weight: 600; margin: 0;">
            Save ${(nextPrice - currentPrice) * 12}/year
          </p>
          <p style="color: #6e6e73; font-size: 15px; margin-top: 4px;">
            By upgrading now vs. waiting until April 5
          </p>
        </div>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">
          Remember, when you upgrade during Early Bird, your price is <strong>locked in forever</strong>. Even when we raise prices in the future, you'll always pay $${currentPrice}/month.
        </p>
        
        <a href="https://rag-academy.com/checkout?tier=pro&billing=annual" style="display: inline-block; background: #dc2626; color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 24px;">
          Lock In $${currentPrice}/mo Forever →
        </a>
        
        <p style="color: #6e6e73; font-size: 14px; margin-top: 32px;">
          Still have questions? <a href="https://rag-academy.com/pricing" style="color: #1d1d1f;">View pricing details</a>
        </p>
      </div>
    `,
    text: `⏰ Only ${daysRemaining} days left!

Early Bird pricing ends April 4, 2026

Don't miss out

This is your last chance to lock in $${currentPrice}/month forever. In ${daysRemaining} days, the price increases to $${nextPrice}/month.

Save ${(nextPrice - currentPrice) * 12}/year by upgrading now vs. waiting until April 5

Remember, when you upgrade during Early Bird, your price is locked in forever. Even when we raise prices in the future, you'll always pay $${currentPrice}/month.

Lock In $${currentPrice}/mo Forever: https://rag-academy.com/checkout?tier=pro&billing=annual

Still have questions? View pricing details: https://rag-academy.com/pricing
    `,
  };
}

/**
 * 1 day before price increase
 */
export function getCountdown1DayEmail(currentPrice: number, nextPrice: number): EmailTemplate {
  return {
    subject: `🚨 Final Hours: $${currentPrice}/month ends tomorrow`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%); border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: center;">
          <p style="color: white; font-size: 32px; font-weight: 700; margin: 0;">
            ⚠️ FINAL HOURS
          </p>
          <p style="color: #fca5a5; font-size: 16px; margin-top: 12px;">
            Early Bird pricing ends tomorrow
          </p>
        </div>
        
        <p style="color: #424245; font-size: 19px; font-weight: 600; line-height: 1.6;">
          This is it. Tomorrow, the price increases from $${currentPrice}/month to $${nextPrice}/month.
        </p>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6; margin-top: 16px;">
          If you've been thinking about upgrading to Pro, now is the time. After tomorrow:
        </p>
        
        <ul style="color: #424245; font-size: 17px; line-height: 1.75;">
          <li>Pro tier will cost <strong>$${nextPrice}/month</strong></li>
          <li>You'll pay <strong>$${(nextPrice - currentPrice) * 12}/year more</strong></li>
          <li>The Early Bird price lock will be gone forever</li>
        </ul>
        
        <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0;">
            💡 Pro Tip: Choose Annual Billing
          </p>
          <p style="color: #78350f; font-size: 15px; margin-top: 8px; line-height: 1.6;">
            Save an extra 31% by paying annually. That's just $99/year instead of $144.
          </p>
        </div>
        
        <a href="https://rag-academy.com/checkout?tier=pro&billing=annual" style="display: inline-block; background: #dc2626; color: white; padding: 18px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 17px; margin-top: 24px;">
          Upgrade Before It's Too Late →
        </a>
        
        <p style="color: #6e6e73; font-size: 15px; margin-top: 32px; line-height: 1.6;">
          P.S. We offer a 14-day money-back guarantee. If you're not satisfied, we'll refund you - no questions asked.
        </p>
      </div>
    `,
    text: `⚠️ FINAL HOURS

Early Bird pricing ends tomorrow

This is it. Tomorrow, the price increases from $${currentPrice}/month to $${nextPrice}/month.

If you've been thinking about upgrading to Pro, now is the time. After tomorrow:
- Pro tier will cost $${nextPrice}/month
- You'll pay $${(nextPrice - currentPrice) * 12}/year more
- The Early Bird price lock will be gone forever

💡 Pro Tip: Choose Annual Billing
Save an extra 31% by paying annually. That's just $99/year instead of $144.

Upgrade Before It's Too Late: https://rag-academy.com/checkout?tier=pro&billing=annual

P.S. We offer a 14-day money-back guarantee. If you're not satisfied, we'll refund you - no questions asked.
    `,
  };
}

/**
 * Post-upgrade thank you email
 */
export function getThankYouEmail(userName: string, tier: string, price: number, phase: string): EmailTemplate {
  return {
    subject: "Welcome to RAG Academy Pro! 🎉",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1d1d1f; font-size: 32px; margin-bottom: 16px;">Welcome to Pro! 🎉</h1>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">Hi ${userName},</p>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6;">
          Thank you for upgrading to RAG Academy ${tier === "team" ? "Team" : "Pro"}! You now have access to:
        </p>
        
        <ul style="color: #424245; font-size: 17px; line-height: 1.75;">
          <li><strong>All ${getPlatformStats().totalChallenges}+ challenges</strong> including 2025 advanced techniques</li>
          <li><strong>Progress tracking</strong> to monitor your learning journey</li>
          <li><strong>Priority support</strong> via email and Discord</li>
          <li><strong>Certificates of completion</strong> for your portfolio</li>
          ${tier === "team" ? "<li><strong>5 team seats</strong> to share with your colleagues</li>" : ""}
        </ul>
        
        <div style="background: #dcfce7; border-radius: 16px; padding: 24px; margin: 32px 0;">
          <p style="color: #166534; font-size: 16px; font-weight: 600; margin: 0;">
            ✅ Your price is locked in
          </p>
          <p style="color: #15803d; font-size: 15px; margin-top: 8px; line-height: 1.6;">
            You're paying ${price === 12 ? "$12/month" : price === 15 ? "$15/month" : "$19/month"} - and that price will ${phase === "phase1" ? "<strong>never increase</strong>" : "stay the same"}. Even when we raise prices for new users, you'll always pay the same rate.
          </p>
        </div>
        
        <h2 style="color: #1d1d1f; font-size: 22px; margin-top: 32px; margin-bottom: 16px;">Getting Started</h2>
        
        <div style="border-left: 4px solid #1d1d1f; padding-left: 16px; margin-bottom: 16px;">
          <p style="color: #1d1d1f; font-size: 17px; font-weight: 600; margin: 0;">
            1. Continue your learning path
          </p>
          <p style="color: #6e6e73; font-size: 15px; margin-top: 4px;">
            Head to <a href="https://rag-academy.com/learn" style="color: #1d1d1f;">your curriculum</a> to pick up where you left off.
          </p>
        </div>
        
        <div style="border-left: 4px solid #1d1d1f; padding-left: 16px; margin-bottom: 16px;">
          <p style="color: #1d1d1f; font-size: 17px; font-weight: 600; margin: 0;">
            2. Explore advanced techniques
          </p>
          <p style="color: #6e6e73; font-size: 15px; margin-top: 4px;">
            Check out the <a href="https://rag-academy.com/challenges?filter=advanced" style="color: #1d1d1f;">2025 advanced RAG techniques</a>.
          </p>
        </div>
        
        <div style="border-left: 4px solid #1d1d1f; padding-left: 16px;">
          <p style="color: #1d1d1f; font-size: 17px; font-weight: 600; margin: 0;">
            3. Join our community
          </p>
          <p style="color: #6e6e73; font-size: 15px; margin-top: 4px;">
            Get help and connect with other RAG engineers in our <a href="https://discord.gg/rag-academy" style="color: #1d1d1f;">Discord community</a>.
          </p>
        </div>
        
        <p style="color: #424245; font-size: 17px; line-height: 1.6; margin-top: 32px;">
          Have questions? Just reply to this email - I personally read every message.
        </p>
        
        <p style="color: #6e6e73; font-size: 15px; margin-top: 24px;">
          Happy learning!<br />
          The RAG Academy Team
        </p>
      </div>
    `,
    text: `Welcome to Pro! 🎉

Hi ${userName},

Thank you for upgrading to RAG Academy ${tier === "team" ? "Team" : "Pro"}!

You now have access to:
- All ${getPlatformStats().totalChallenges}+ challenges including 2025 advanced techniques
- Progress tracking to monitor your learning journey
- Priority support via email and Discord
- Certificates of completion for your portfolio
${tier === "team" ? "- 5 team seats to share with your colleagues" : ""}

✅ Your price is locked in
You're paying ${price === 12 ? "$12/month" : price === 15 ? "$15/month" : "$19/month"} - and that price will ${phase === "phase1" ? "never increase" : "stay the same"}.

Getting Started:

1. Continue your learning path
   Head to your curriculum: https://rag-academy.com/learn

2. Explore advanced techniques
   Check out the 2025 advanced RAG techniques: https://rag-academy.com/challenges?filter=advanced

3. Join our community
   Get help and connect with other RAG engineers: https://discord.gg/rag-academy

Have questions? Just reply to this email - I personally read every message.

Happy learning!
The RAG Academy Team
    `,
  };
}
