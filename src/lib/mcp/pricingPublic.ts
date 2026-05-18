import {
  getCurrentPricingPhase,
  getDaysRemainingInPhase,
  getNextPhaseInfo,
  type PricingPhaseConfig,
  type PricingTier,
} from "@/lib/pricing/config";
import { getPublicSiteOrigin, toAbsoluteSiteUrl } from "@/lib/mcp/siteUrl";

export const PRICING_PAGE_PATH = "/pricing";
export const CHECKOUT_PAGE_PATH = "/checkout";

export type PublicTier = Omit<PricingTier, "polarProductId">;

function stripTier(tier: PricingTier): PublicTier {
  const { polarProductId: _removed, ...rest } = tier;
  void _removed;
  return rest;
}

function publicPhaseConfig(p: PricingPhaseConfig) {
  return {
    phase: p.phase,
    name: p.name,
    tagline: p.tagline,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate?.toISOString() ?? null,
    goal: p.goal,
    tiers: {
      free: stripTier(p.tiers.free),
      paid: stripTier(p.tiers.paid),
      ...(p.tiers.team ? { team: stripTier(p.tiers.team) } : {}),
      ...(p.tiers.lifetime ? { lifetime: stripTier(p.tiers.lifetime) } : {}),
    },
  };
}

export function getPublicPricingSnapshot(now: Date = new Date()) {
  const current = getCurrentPricingPhase(now);
  const daysLeft = getDaysRemainingInPhase(now);
  const next = getNextPhaseInfo(now);
  const origin = getPublicSiteOrigin();

  return {
    current: publicPhaseConfig(current),
    daysRemainingInCurrentPhase: daysLeft,
    nextPhasePreview: next.nextPhase
      ? {
          phase: next.nextPhase.phase,
          name: next.nextPhase.name,
          paidMonthly: next.nextPhase.tiers.paid.price.monthly,
          daysUntil: next.daysUntil,
          monthlyPriceIncreaseVersusCurrent: next.priceIncrease,
        }
      : null,
    siteLinks: {
      pricingPagePath: PRICING_PAGE_PATH,
      checkoutPagePath: CHECKOUT_PAGE_PATH,
      ...(origin
        ? {
            pricingPageUrl: toAbsoluteSiteUrl(PRICING_PAGE_PATH, origin),
            checkoutPageUrl: toAbsoluteSiteUrl(CHECKOUT_PAGE_PATH, origin),
          }
        : {}),
    },
    mcpAccess: {
      preferredForAgents: "rag_academy_get_pricing",
      discoveryResourceUri: "ragacademy://pricing/public",
      guidance:
        "Agents answering pricing questions should call rag_academy_get_pricing (includes MCP meta). Subscribe to the resource for static discovery; checkout and Polar billing stay on the site.",
    },
    disclaimer:
      "Polar product IDs and payment secrets are never exposed. Display prices follow the in-app pricing schedule.",
  };
}
