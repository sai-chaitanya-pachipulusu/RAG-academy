/**
 * PRICING CONFIGURATION
 * 
 * Strategy: "Grow First, Monetize Later"
 * 
 * Phase 1 (Launch): Maximize user acquisition with irresistible pricing
 * Phase 2 (Growth): Gradually increase as brand builds
 * Phase 3 (Mature): Full pricing with established reputation
 * 
 * Key insight: A new platform with 0 users cannot charge LeetCode prices.
 * Build social proof first, then optimize revenue.
 */

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
  paddleProductId?: {
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
const PHASE_1_END = new Date("2026-07-04T23:59:59-05:00"); // 6 months
const PHASE_2_START = new Date("2026-07-05T00:00:00-05:00");
const PHASE_2_END = new Date("2027-01-04T23:59:59-05:00"); // 6 months
const PHASE_3_START = new Date("2027-01-05T00:00:00-05:00");

/**
 * PHASE 1: Launch & User Acquisition (Jan 4 - Jul 4, 2026)
 * 
 * Goal: Get 1,000+ paying users for social proof
 * Strategy: "No-brainer" pricing to maximize conversion
 * 
 * Pricing logic:
 * - $9/mo = less than Netflix, single digit = impulse buy
 * - $69/yr = less than 1 month of LeetCode Premium, insane value
 * - $149 lifetime = early adopter FOMO, creates ambassadors
 */
const PHASE_1_CONFIG: PricingPhaseConfig = {
  phase: "phase1",
  name: "Founding Member",
  tagline: "Lock in launch pricing forever",
  startDate: PHASE_1_START,
  endDate: PHASE_1_END,
  goal: "Get 1,000+ paying users for social proof",
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
        "40 foundational challenges",
        "5 essential playbooks",
        "All tool comparisons",
        "Community Discord access",
        "Weekly newsletter",
      ],
      freeChallengeCount: 40,
    },
    paid: {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 9,
        annual: 69,
        displayMonthly: "$9",
        displayAnnual: "$69",
        effectiveMonthly: "$5.75",
        savingsPercent: 36,
      },
      badge: "🚀 Launch Price",
      strikethrough: "$15/mo",
      features: [
        "All 250+ challenges (Python + TypeScript)",
        "All playbooks & research papers",
        "7 production datasets with ground truth",
        "Interactive visualizers",
        "Progress tracking & XP system",
        "Certificate of completion",
        "Priority email support",
        "Founding member badge forever",
      ],
      freeChallengeCount: 40,
      note: "Lock in $9/mo forever. Price increases to $15/mo on July 5, 2026.",
      popular: true,
      paddleProductId: {
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
      freeChallengeCount: 40,
      note: "Lock in $29/mo for your team. Increases to $49/mo on July 5, 2026.",
      paddleProductId: {
        monthly: process.env.PADDLE_PRODUCT_TEAM_MONTHLY || "",
        annual: process.env.PADDLE_PRODUCT_TEAM_ANNUAL || "",
      },
    },
    lifetime: {
      id: "lifetime",
      name: "Lifetime",
      price: {
        monthly: 0,
        annual: 35,
        displayMonthly: "$35",
        displayAnnual: "$35",
      },
      badge: "🔥 Best Value",
      strikethrough: "$99",
      features: [
        "Everything in Pro, forever",
        "All future content & features",
        "Founding member status",
        "Early access to new courses",
        "Exclusive founders Discord",
        "Your name in credits",
      ],
      freeChallengeCount: 40,
      note: "One-time payment. Less than 1 month of LeetCode Premium. Lock in forever.",
      paddleProductId: {
        monthly: "",
        annual: "",
        lifetime: process.env.POLAR_PRODUCT_LIFETIME || "",
      },
    },
  },
};

/**
 * PHASE 2: Growth (Jul 5, 2026 - Jan 4, 2027)
 * 
 * Goal: Scale to 5,000+ users with word of mouth
 * Strategy: Modest increase while still being competitive
 */
const PHASE_2_CONFIG: PricingPhaseConfig = {
  phase: "phase2",
  name: "Growth",
  tagline: "Join thousands learning RAG",
  startDate: PHASE_2_START,
  endDate: PHASE_2_END,
  goal: "Scale to 5,000+ users",
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
        "30 foundational challenges",
        "5 essential playbooks",
        "All tool comparisons",
        "Community Discord access",
      ],
      freeChallengeCount: 30,
    },
    paid: {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 15,
        annual: 99,
        displayMonthly: "$15",
        displayAnnual: "$99",
        effectiveMonthly: "$8.25",
        savingsPercent: 45,
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
      freeChallengeCount: 30,
      note: "Current price. Increases to $29/mo in January 2027.",
      popular: true,
      paddleProductId: {
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
      freeChallengeCount: 30,
      paddleProductId: {
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
      freeChallengeCount: 30,
      note: "One-time payment. Price increases to $149 in January 2027.",
      paddleProductId: {
        monthly: "",
        annual: "",
        lifetime: process.env.POLAR_PRODUCT_LIFETIME || "",
      },
    },
  },
};

/**
 * PHASE 3: Mature (Jan 5, 2027+)
 * 
 * Goal: Revenue optimization with established brand
 * Strategy: Premium pricing justified by social proof
 */
const PHASE_3_CONFIG: PricingPhaseConfig = {
  phase: "phase3",
  name: "Standard",
  tagline: "The #1 RAG engineering platform",
  startDate: PHASE_3_START,
  endDate: null,
  goal: "Revenue optimization with established brand",
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
        "25 foundational challenges",
        "3 essential playbooks",
        "All tool comparisons",
        "Community Discord access",
      ],
      freeChallengeCount: 25,
    },
    paid: {
      id: "pro",
      name: "Pro",
      price: {
        monthly: 29,
        annual: 199,
        displayMonthly: "$29",
        displayAnnual: "$199",
        effectiveMonthly: "$16.58",
        savingsPercent: 43,
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
      freeChallengeCount: 25,
      popular: true,
      paddleProductId: {
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
      freeChallengeCount: 25,
      note: "Additional seats: $79/mo each",
      paddleProductId: {
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
      freeChallengeCount: 25,
      note: "One-time payment. Never pay again.",
      paddleProductId: {
        monthly: "",
        annual: "",
        lifetime: process.env.POLAR_PRODUCT_LIFETIME || "",
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
