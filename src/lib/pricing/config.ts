/**
 * PRICING CONFIGURATION
 *
 * Strategy: "Early Bird → Launch → Regular"
 *
 * Phase 1 (Early Bird): Maximize user acquisition with irresistible pricing
 *   - Now until April 1, 2026
 *   - $12/month or $99/year (save 31%)
 *   - Price locked forever for early subscribers
 *
 * Phase 2 (Launch Price): Continue growth with moderate pricing
 *   - April 2 - July 31, 2026
 *   - $19/month or $149/year (save 35%)
 *
 * Phase 3 (Regular): Full pricing aligned with market
 *   - August 1, 2026+
 *   - $29/month or $249/year (save 40%)
 *
 * Key insight: Early adopters get the best deal and become loyal advocates.
 */

import { TOTAL_LESSONS_COUNT } from "@/lib/challenges/catalog";

// Helper to get dynamic challenge count for features
// Note: We can't import CHALLENGES directly here to avoid circular deps
// So we use a reasonable upper estimate that gets updated periodically
const CHALLENGE_COUNT_ESTIMATE = 250; // Update this when adding challenges

export type PricingPhase = "phase1" | "phase2" | "phase3";
export type BillingCycle = "monthly" | "annual" | "lifetime";

export interface PricingTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    annual: number;
    displayMonthly: string;
    displayAnnual: string;
    effectiveMonthly?: string; // For annual display "~$X/mo"
    savingsPercent?: number;
  };
  badge?: string;
  strikethrough?: string;
  features: string[];
  freeChallengeCount: number;
  note?: string;
  popular?: boolean;
  polarProductId?: {
    monthly: string;
    annual: string;
    lifetime?: string;
  };
}

export interface PricingPhaseConfig {
  phase: PricingPhase;
  name: string;
  tagline: string;
  startDate: Date;
  endDate: Date | null;
  goal: string;
  tiers: {
    free: PricingTier;
    paid: PricingTier;
    team?: PricingTier;
    lifetime?: PricingTier;
  };
}

// Phase date boundaries
const PHASE_1_START = new Date("2026-01-04T00:00:00-05:00");
const PHASE_1_END = new Date("2026-04-01T23:59:59-05:00"); // Early Bird ends April 1
const PHASE_2_START = new Date("2026-04-02T00:00:00-05:00");
const PHASE_2_END = new Date("2026-07-31T23:59:59-05:00"); // Launch Price ends July 31
const PHASE_3_START = new Date("2026-08-01T00:00:00-05:00");

/**
 * PHASE 1: Early Bird (Now - April 1, 2026)
 *
 * Goal: Maximize user acquisition with irresistible pricing
 * Strategy: Create urgency with limited-time low price + lifetime lock
 *
 * Pricing:
 * - $12/mo = 60% cheaper than competitors, still profitable
 * - $99/yr = ~$8.25/mo, 31% savings, less than 1 month of LeetCode
 * - Lock-in: Early subscribers keep $12/mo forever
 */
const PHASE_1_CONFIG: PricingPhaseConfig = {
  phase: "phase1",
  name: "Early Bird",
  tagline: "Lock in the best price forever",
  startDate: PHASE_1_START,
  endDate: PHASE_1_END,
  goal: "Maximize early user acquisition with irresistible pricing",
  tiers: {
    free: {
      id: "free",
      name: "Free",
      price: {
        monthly: 0,
        annual: 0,
        displayMonthly: "$0",
        displayAnnual: "$0",
      },
      features: [
        "20 foundational challenges",
        "5 essential playbooks",
        "All tool comparisons",
        "Community Discord access",
        "Weekly newsletter",
      ],
      freeChallengeCount: 20,
    },
    paid: {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 12,
        annual: 99,
        displayMonthly: "$12",
        displayAnnual: "$99",
        effectiveMonthly: "$8.25",
        savingsPercent: 31,
      },
      badge: "🐦 Early Bird",
      strikethrough: "$29/mo",
      features: [
        "All 250+ challenges (Python + TypeScript)",
        "All playbooks & research papers",
        "7 production datasets with ground truth",
        "Interactive visualizers",
        "Progress tracking & XP system",
        "Certificate of completion",
        "Priority email support",
        "Early Bird badge forever",
      ],
      freeChallengeCount: 20,
      note: "Subscribe by April 1st and lock in $12/month for life. Future users will pay $29/month.",
      popular: true,
      polarProductId: {
        monthly: process.env.PADDLE_PRODUCT_PRO_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_PRO_ANNUAL || "",
      },
    },
    team: {
      id: "team",
      name: "Team",
      price: {
        monthly: 29,
        annual: 199,
        displayMonthly: "$29",
        displayAnnual: "$199",
        effectiveMonthly: "$16.58",
        savingsPercent: 43,
      },
      badge: "Best for Teams",
      strikethrough: "$49/mo",
      features: [
        "Everything in Pro",
        "5 team seats included",
        "Team progress dashboard",
        "Shared learning paths",
        "Private Slack channel",
        "Monthly team office hours",
        "Priority onboarding call",
      ],
      freeChallengeCount: 20,
      note: "Lock in $29/mo for your team. Increases to $49/mo on July 5, 2026.",
      polarProductId: {
        monthly: process.env.PADDLE_PRODUCT_TEAM_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_TEAM_ANNUAL || "",
      },
    },
    lifetime: {
      id: "lifetime",
      name: "Lifetime",
      price: {
        monthly: 0,
        annual: 149,
        displayMonthly: "$149",
        displayAnnual: "$149",
      },
      badge: "🔥 Best Value",
      strikethrough: "$299",
      features: [
        "Everything in Pro, forever",
        "All future content & features",
        "Founding member status",
        "Early access to new courses",
        "Exclusive founders Discord",
        "Your name in credits",
      ],
      freeChallengeCount: 20,
      note: "One-time payment. Less than 5 months of Pro. Lock in forever.",
      polarProductId: {
        monthly: "",
        annual: "",
        lifetime: process.env.PADDLE_PRODUCT_LIFETIME || "",
      },
    },
  },
};

/**
 * PHASE 2: Launch Price (April 2 - July 31, 2026)
 *
 * Goal: Continue growth with moderate pricing
 * Strategy: Still competitive but moving toward market rate
 *
 * Pricing:
 * - $19/mo = 35% cheaper than final price, competitive with market
 * - $149/yr = ~$12.40/mo, 35% savings
 */
const PHASE_2_CONFIG: PricingPhaseConfig = {
  phase: "phase2",
  name: "Launch Price",
  tagline: "Limited time offer",
  startDate: PHASE_2_START,
  endDate: PHASE_2_END,
  goal: "Continue growth with moderate pricing",
  tiers: {
    free: {
      id: "free",
      name: "Free",
      price: {
        monthly: 0,
        annual: 0,
        displayMonthly: "$0",
        displayAnnual: "$0",
      },
      features: [
        "20 foundational challenges",
        "5 essential playbooks",
        "All tool comparisons",
        "Community Discord access",
      ],
      freeChallengeCount: 20,
    },
    paid: {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 19,
        annual: 149,
        displayMonthly: "$19",
        displayAnnual: "$149",
        effectiveMonthly: "$12.40",
        savingsPercent: 35,
      },
      strikethrough: "$29/mo",
      features: [
        "All 250+ challenges (Python + TypeScript)",
        "All playbooks & research papers",
        "7 production datasets with ground truth",
        "Interactive visualizers",
        "Progress tracking & XP system",
        "Certificate of completion",
        "Email support",
      ],
      freeChallengeCount: 20,
      note: "Launch price ends July 31. Price increases to $29/mo on August 1.",
      popular: true,
      polarProductId: {
        monthly: process.env.PADDLE_PRODUCT_PRO_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_PRO_ANNUAL || "",
      },
    },
    team: {
      id: "team",
      name: "Team",
      price: {
        monthly: 49,
        annual: 349,
        displayMonthly: "$49",
        displayAnnual: "$349",
        effectiveMonthly: "$29.08",
        savingsPercent: 41,
      },
      badge: "Best for Teams",
      features: [
        "Everything in Pro",
        "5 team seats included",
        "Team progress dashboard",
        "Shared learning paths",
        "Dedicated Slack channel",
        "Quarterly team office hours",
      ],
      freeChallengeCount: 20,
      polarProductId: {
        monthly: process.env.PADDLE_PRODUCT_TEAM_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_TEAM_ANNUAL || "",
      },
    },
    lifetime: {
      id: "lifetime",
      name: "Lifetime",
      price: {
        monthly: 0,
        annual: 69,
        displayMonthly: "$69",
        displayAnnual: "$69",
      },
      badge: "Best Value",
      features: [
        "Everything in Pro, forever",
        "All future content & features",
        "Early access to new courses",
        "Private community channel",
      ],
      freeChallengeCount: 20,
      note: "One-time payment. Price increases to $149 in January 2027.",
      polarProductId: {
        monthly: "",
        annual: "",
        lifetime: process.env.PADDLE_PRODUCT_LIFETIME || "",
      },
    },
  },
};

/**
 * PHASE 3: Regular Price (August 1, 2026+)
 *
 * Goal: Full pricing aligned with market
 * Strategy: Premium pricing justified by value and social proof
 *
 * Pricing:
 * - $29/mo = competitive with LeetCode Premium ($35), cheaper than Educative ($59)
 * - $249/yr = ~$20.75/mo, 40% savings, competitive with annual plans
 */
const PHASE_3_CONFIG: PricingPhaseConfig = {
  phase: "phase3",
  name: "Regular",
  tagline: "Standard pricing",
  startDate: PHASE_3_START,
  endDate: null,
  goal: "Full pricing aligned with market rates",
  tiers: {
    free: {
      id: "free",
      name: "Free",
      price: {
        monthly: 0,
        annual: 0,
        displayMonthly: "$0",
        displayAnnual: "$0",
      },
      features: [
        "20 foundational challenges",
        "3 essential playbooks",
        "All tool comparisons",
        "Community Discord access",
      ],
      freeChallengeCount: 20,
    },
    paid: {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 29,
        annual: 249,
        displayMonthly: "$29",
        displayAnnual: "$249",
        effectiveMonthly: "$20.75",
        savingsPercent: 40,
      },
      features: [
        "All 250+ challenges (Python + TypeScript)",
        "All playbooks & research papers",
        "7 production datasets with ground truth",
        "Interactive visualizers",
        "Progress tracking & XP system",
        "Certificate of completion",
        "Priority support",
      ],
      freeChallengeCount: 20,
      popular: true,
      polarProductId: {
        monthly: process.env.PADDLE_PRODUCT_PRO_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_PRO_ANNUAL || "",
      },
    },
    team: {
      id: "team",
      name: "Team",
      price: {
        monthly: 79,
        annual: 599,
        displayMonthly: "$79",
        displayAnnual: "$599",
        effectiveMonthly: "$49.92",
        savingsPercent: 37,
      },
      badge: "Best for Teams",
      features: [
        "Everything in Pro",
        "5 team seats included",
        "Team analytics dashboard",
        "Custom learning paths",
        "Dedicated Slack channel",
        "SSO integration",
        "Priority onboarding",
        "Custom invoicing",
      ],
      freeChallengeCount: 20,
      note: "Additional seats: $79/mo each",
      polarProductId: {
        monthly: process.env.PADDLE_PRODUCT_TEAM_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_TEAM_ANNUAL || "",
      },
    },
    lifetime: {
      id: "lifetime",
      name: "Lifetime",
      price: {
        monthly: 0,
        annual: 149,
        displayMonthly: "$149",
        displayAnnual: "$149",
      },
      badge: "Best Value",
      features: [
        "Everything in Pro, forever",
        "All future content & features",
        "Early access to new courses",
        "Private community channel",
      ],
      freeChallengeCount: 20,
      note: "One-time payment. Never pay again.",
      polarProductId: {
        monthly: "",
        annual: "",
        lifetime: process.env.PADDLE_PRODUCT_LIFETIME || "",
      },
    },
  },
};

export const PRICING_PHASES: Record<PricingPhase, PricingPhaseConfig> = {
  phase1: PHASE_1_CONFIG,
  phase2: PHASE_2_CONFIG,
  phase3: PHASE_3_CONFIG,
};

/**
 * Get current pricing phase based on current date
 */
export function getCurrentPricingPhase(now: Date = new Date()): PricingPhaseConfig {
  const currentTime = now.getTime();
  
  if (currentTime >= PHASE_3_START.getTime()) {
    return PHASE_3_CONFIG;
  } else if (currentTime >= PHASE_2_START.getTime()) {
    return PHASE_2_CONFIG;
  } else {
    return PHASE_1_CONFIG;
  }
}

/**
 * Get days remaining in current phase
 */
export function getDaysRemainingInPhase(now: Date = new Date()): number | null {
  const currentPhase = getCurrentPricingPhase(now);
  
  if (!currentPhase.endDate) {
    return null;
  }
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const timeRemaining = currentPhase.endDate.getTime() - now.getTime();
  return Math.ceil(timeRemaining / msPerDay);
}

/**
 * Get next phase info
 */
export function getNextPhaseInfo(now: Date = new Date()): {
  nextPhase: PricingPhaseConfig | null;
  daysUntil: number | null;
  priceIncrease: number | null;
} {
  const currentPhase = getCurrentPricingPhase(now);
  
  if (currentPhase.phase === "phase3") {
    return { nextPhase: null, daysUntil: null, priceIncrease: null };
  }
  
  const nextPhase = currentPhase.phase === "phase1" 
    ? PHASE_2_CONFIG 
    : PHASE_3_CONFIG;
  
  const daysUntil = getDaysRemainingInPhase(now);
  
  const currentPrice = currentPhase.tiers.paid.price.monthly;
  const nextPrice = nextPhase.tiers.paid.price.monthly;
  const priceIncrease = nextPrice - currentPrice;
  
  return { nextPhase, daysUntil, priceIncrease };
}

/**
 * Get grandfathered price for early subscribers
 */
export function getGrandfatheredPrice(
  userSubscribedDate: Date,
  currentPhase: PricingPhaseConfig
): PricingTier {
  const subscribedPhase = getCurrentPricingPhase(userSubscribedDate);
  return subscribedPhase.tiers.paid;
}

/**
 * Calculate annual savings
 */
export function calculateAnnualSavings(tier: PricingTier): {
  monthlyCost: number;
  annualCost: number;
  savings: number;
  savingsPercent: number;
} {
  const monthlyCost = tier.price.monthly * 12;
  const annualCost = tier.price.annual;
  const savings = monthlyCost - annualCost;
  const savingsPercent = monthlyCost > 0 ? Math.round((savings / monthlyCost) * 100) : 0;
  
  return { monthlyCost, annualCost, savings, savingsPercent };
}

/**
 * Pricing comparison table for reference
 * 
 * Platform      | Monthly | Annual  | Notes
 * --------------|---------|---------|------------------
 * LeetCode      | $35     | $159    | 10M+ users, established
 * DataCamp      | $25     | $149    | General data science
 * Educative     | $59     | $199    | Interactive courses
 * AlgoExpert    | —       | $99     | DSA focused
 * Deep-ML       | Free    | $29     | ML focused
 * --------------|---------|---------|------------------
 * RAG Academy   |         |         |
 *   Phase 1     | $9      | $69     | Launch - user acquisition
 *   Phase 2     | $15     | $99     | Growth - still competitive
 *   Phase 3     | $29     | $199    | Mature - premium positioning
 */

/**
 * Marketing copy for each phase
 */
export const PRICING_MARKETING = {
  phase1: {
    headline: "Join as a Founding Member",
    subheadline: "Lock in launch pricing forever. Only available until July 2026.",
    urgency: "🔥 {spotsRemaining} founding member spots remaining",
    socialProof: "Join {userCount} engineers already learning RAG",
    valueProps: [
      "Less than a coffee per week",
      "Cancel anytime, keep your price forever",
      "All future content included at launch price",
    ],
  },
  phase2: {
    headline: "Join Thousands Learning RAG",
    subheadline: "The most comprehensive RAG engineering curriculum online.",
    socialProof: "Trusted by {userCount}+ engineers at top companies",
    valueProps: [
      "Still 40% below our standard pricing",
      "Used by teams at Google, Meta, OpenAI",
      "14-day money-back guarantee",
    ],
  },
  phase3: {
    headline: "The #1 RAG Engineering Platform",
    subheadline: "Learn from the best. Build production systems.",
    socialProof: "Join {userCount}+ engineers. 4.9★ average rating.",
    valueProps: [
      "250+ hands-on challenges",
      "Used by 500+ companies",
      "Industry-recognized certificate",
    ],
  },
} as const;
