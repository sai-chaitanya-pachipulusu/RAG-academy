# Dynamic Pricing System - RAG Academy

## Overview

RAG Academy implements a **fully automated, date-based dynamic pricing system** that transitions through 3 phases without manual intervention. Early subscribers are automatically **grandfathered** into their signup price forever.

## Pricing Phases

### Phase 1: Early Bird Launch (Jan 4 - Apr 4, 2026)

- **Goal**: Build social proof with 1,000 paid users
- **Free Tier**: 30 challenges
- **Pro Tier**: **$12/month** or $99/year
- **Special**: Lifetime price lock guarantee

### Phase 2: Standard Pricing (Apr 5 - Jul 4, 2026)

- **Goal**: Optimize pricing
- **Free Tier**: 25 challenges
- **Pro Tier**: **$15/month** or $144/year
- **Team Tier**: $49/month (5 seats)

### Phase 3: Premium Positioning (Jul 5, 2026+)

- **Goal**: Scale revenue
- **Free Tier**: 20 challenges
- **Pro Tier**: **$19/month** or $180/year
- **Team Tier**: $59/month (5 seats)
- **Lifetime**: $299 one-time

## How It Works

### Automatic Phase Transitions

The system uses **date-based logic** to determine current pricing:

```typescript
// Current date: January 4, 2026
const currentPhase = getCurrentPricingPhase(new Date());
// Returns: Phase 1 config

// On April 5, 2026 (automatically)
const currentPhase = getCurrentPricingPhase(new Date());
// Returns: Phase 2 config
```

### Grandfathering Logic

Users who subscribe in Phase 1 keep their $12/month price **forever**, even when pricing increases to $15 and $19 in later phases.

```typescript
// User subscribed on Jan 15, 2026 (Phase 1)
const userPrice = getGrandfatheredPrice(
  new Date("2026-01-15"),
  getCurrentPricingPhase(new Date("2026-08-01")) // Phase 3
);
// userPrice = $12/month (locked forever)
```

## Technical Implementation

### File Structure

```
src/lib/pricing/
├── config.ts           # Phase definitions & date boundaries
├── usePricing.ts       # React hook for pricing info
└── index.ts            # Exports

src/components/pricing/
├── PricingBanner.tsx   # Top banner with urgency
└── index.ts            # Exports

src/app/(dashboard)/
└── pricing/
    └── page.tsx        # Pricing page

supabase/migrations/
└── 003_add_subscriptions.sql  # Database schema
```

### Key Functions

#### `getCurrentPricingPhase()`

Returns the current pricing phase based on date.

```typescript
const phase = getCurrentPricingPhase(new Date());
console.log(phase.tiers.paid.price.monthly); // 12, 15, or 19
```

#### `getDaysRemainingInPhase()`

Calculates days until next price increase.

```typescript
const daysLeft = getDaysRemainingInPhase(new Date());
console.log(daysLeft); // 91, 45, null (Phase 3 is indefinite)
```

#### `getNextPhaseInfo()`

Returns information about the upcoming phase.

```typescript
const { nextPhase, daysUntil, priceIncrease } = getNextPhaseInfo(new Date());
console.log(priceIncrease); // 3 (from $12 to $15)
```

### React Hook Usage

```typescript
import { usePricing } from "@/lib/pricing/usePricing";

function MyComponent() {
  const { currentPhase, daysRemaining, isEarlyBird, freeChallengeLimit } =
    usePricing();

  return (
    <div>
      <p>Current price: ${currentPhase.tiers.paid.price.monthly}/mo</p>
      <p>Free tier limit: {freeChallengeLimit} challenges</p>
      {isEarlyBird && <p>Early bird: {daysRemaining} days left!</p>}
    </div>
  );
}
```

### Components

#### PricingBanner

Displays urgency banner at top of site.

```typescript
import { PricingBanner } from "@/components/pricing/PricingBanner";

// In your layout or page
<PricingBanner />;
```

#### UpgradeCTA

Upgrade call-to-action with current pricing.

```typescript
import { UpgradeCTA } from "@/components/pricing/PricingBanner";

<UpgradeCTA context="challenge" />;
```

#### PricingBadge

Inline pricing badge for buttons.

```typescript
import { PricingBadge } from "@/components/pricing/PricingBanner";

<button>
  Upgrade <PricingBadge />
</button>;
```

## Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),

  -- Tier & status
  tier TEXT CHECK (tier IN ('free', 'pro', 'team', 'lifetime')),
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual', 'lifetime')),

  -- Grandfathered pricing
  subscribed_phase TEXT CHECK (subscribed_phase IN ('phase1', 'phase2', 'phase3')),
  locked_monthly_price INTEGER, -- Cents (e.g., 1200 = $12.00)
  locked_annual_price INTEGER,  -- Cents (e.g., 9900 = $99.00)

  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Helper Functions

```sql
-- Get user's tier
SELECT get_user_tier('user-id-here');
-- Returns: 'free' | 'pro' | 'team' | 'lifetime'

-- Check challenge access
SELECT has_challenge_access('user-id', 35, 30);
-- Returns: true/false based on tier and free limit
```

## Migration Guide

### Running the Migration

```bash
# Using Supabase CLI
supabase db push

# Or apply manually
psql -h db.xxx.supabase.co -U postgres -d postgres -f supabase/migrations/003_add_subscriptions.sql
```

### Creating Test Subscriptions

```sql
-- Create a Phase 1 early bird subscriber
INSERT INTO subscriptions (
  user_id,
  tier,
  status,
  billing_cycle,
  subscribed_phase,
  locked_monthly_price,
  locked_annual_price
) VALUES (
  'user-uuid-here',
  'pro',
  'active',
  'monthly',
  'phase1',
  1200,  -- $12.00
  9900   -- $99.00
);
```

## Testing

### Manual Testing

```typescript
// Test Phase 1 (now through Apr 4, 2026)
const phase1 = getCurrentPricingPhase(new Date("2026-02-01"));
console.log(phase1.tiers.paid.price.monthly); // 12

// Test Phase 2 (Apr 5 - Jul 4, 2026)
const phase2 = getCurrentPricingPhase(new Date("2026-05-01"));
console.log(phase2.tiers.paid.price.monthly); // 15

// Test Phase 3 (Jul 5, 2026+)
const phase3 = getCurrentPricingPhase(new Date("2026-08-01"));
console.log(phase3.tiers.paid.price.monthly); // 19
```

### Edge Cases

```typescript
// Exactly on phase boundary (end of Phase 1)
const endPhase1 = getCurrentPricingPhase(new Date("2026-04-04T23:59:59"));
console.log(endPhase1.phase); // "phase1"

// Start of Phase 2
const startPhase2 = getCurrentPricingPhase(new Date("2026-04-05T00:00:00"));
console.log(startPhase2.phase); // "phase2"
```

## Stripe Integration (Next Steps)

### Creating Prices

For each phase, create Stripe prices:

```javascript
// Phase 1: Early Bird
const earlyBirdMonthly = await stripe.prices.create({
  product: "prod_xxx",
  unit_amount: 1200, // $12.00
  currency: "usd",
  recurring: { interval: "month" },
  metadata: { phase: "phase1", tier: "pro" },
});

const earlyBirdAnnual = await stripe.prices.create({
  product: "prod_xxx",
  unit_amount: 9900, // $99.00
  currency: "usd",
  recurring: { interval: "year" },
  metadata: { phase: "phase1", tier: "pro" },
});
```

### Webhook Handler

```typescript
// Handle successful subscription
if (event.type === "checkout.session.completed") {
  const session = event.data.object;
  const currentPhase = getCurrentPricingPhase(new Date());

  // Save subscription with grandfathered pricing
  await supabase.from("subscriptions").insert({
    user_id: session.client_reference_id,
    subscribed_phase: currentPhase.phase,
    locked_monthly_price: currentPhase.tiers.paid.price.monthly * 100,
    locked_annual_price: currentPhase.tiers.paid.price.annual * 100,
    // ... other fields
  });
}
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Phase Conversion Rates**

   - Phase 1: Free → Early Bird conversions
   - Phase 2: Free → Pro conversions
   - Phase 3: All tier conversions

2. **Grandfathered Users**

   ```sql
   SELECT
     subscribed_phase,
     COUNT(*) as user_count,
     SUM(locked_monthly_price) / 100 as mrr
   FROM subscriptions
   WHERE status = 'active'
   GROUP BY subscribed_phase;
   ```

3. **Revenue Impact**
   ```sql
   SELECT
     DATE_TRUNC('month', created_at) as month,
     COUNT(*) as new_subs,
     AVG(locked_monthly_price) / 100 as avg_price
   FROM subscriptions
   GROUP BY month
   ORDER BY month DESC;
   ```

## FAQ

### When does pricing automatically change?

- **Apr 5, 2026 00:00:00 EST**: Phase 1 → Phase 2 ($12 → $15)
- **Jul 5, 2026 00:00:00 EST**: Phase 2 → Phase 3 ($15 → $19)

### Do I need to manually update prices?

No! The system checks the current date on every page load and displays the appropriate pricing automatically.

### How do I override/test different phases locally?

You can temporarily modify the date boundaries in `config.ts` for testing, or use:

```typescript
// Force a specific date for testing
const testPhase = getCurrentPricingPhase(new Date("2026-08-01"));
```

### What if I want to change phase dates?

Update the date constants in `src/lib/pricing/config.ts`:

```typescript
const PHASE_1_END = new Date("2026-04-04T23:59:59-05:00");
const PHASE_2_START = new Date("2026-04-05T00:00:00-05:00");
```

### Can I add a Phase 4?

Yes! Add a new phase config and update the `getCurrentPricingPhase()` function logic.

## Support

For questions or issues with the pricing system:

1. Check the browser console for pricing logs
2. Verify database subscriptions table exists
3. Ensure date boundaries are correct in `config.ts`
4. Check Stripe webhook integration

---

**Built with:** TypeScript, React, Supabase, Stripe  
**Last Updated:** January 4, 2026  
**Current Phase:** Phase 1 (Early Bird Launch)
