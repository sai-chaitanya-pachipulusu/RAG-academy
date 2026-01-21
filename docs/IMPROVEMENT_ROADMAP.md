# 🚀 RAG Academy - Improvement Roadmap

## ✅ What's Complete (Current State)

### 1. Dynamic Pricing System

- ✅ 3-phase pricing with auto-transitions
- ✅ Grandfathering logic
- ✅ Team subscriptions (5 seats)
- ✅ Database schema (subscriptions, team_members, team_invites)
- ✅ Email sequences (3 emails per phase, not daily)
- ✅ Stripe integration (checkout, webhooks)
- ✅ Paywall logic

### 2. Content

- ✅ 185+ challenges
- ✅ 12 advanced RAG techniques (2025)
- ✅ Curriculum stages
- ✅ Playbooks

---

## 🎯 What Can Be Improved

### **Priority 1: Core Missing Features** 🔴

#### 1. Team Management UI (CRITICAL)

**Status**: Not started  
**Impact**: High - Team subscriptions are unusable without UI

**What's Needed:**

- `/team` - Team dashboard page
  - List active members
  - List pending invites
  - Show seats used (e.g., "3/5 seats used")
  - Invite member form
  - Remove member buttons
- `/invite/[token]` - Accept invite page
  - Show team details
  - Accept/Decline buttons
- `/team/settings` - Team settings

**API Endpoints Needed:**

```typescript
POST   /api/team/invite       // Send invite
POST   /api/team/accept       // Accept invite
DELETE /api/team/member/:id   // Remove member
GET    /api/team              // Get team info
GET    /api/team/invites      // List pending invites
```

**Estimate**: 2-3 days

---

#### 2. Stripe Checkout Integration (CRITICAL)

**Status**: Partially complete (webhook handler exists)  
**Impact**: High - Can't actually collect payments

**What's Missing:**

- Update "Subscribe Now" buttons to call `/api/checkout`
- Handle checkout success/cancel redirects
- Display checkout loading states
- Test with Stripe test mode
- Set up Stripe products and prices in dashboard

**Code Example:**

```typescript
// In pricing page
const handleSubscribe = async (tier: string, billing: string) => {
  setLoading(true);
  const res = await fetch("/api/checkout", {
    method: "POST",
    body: JSON.stringify({ tier, billingCycle: billing }),
  });
  const { url } = await res.json();
  window.location.href = url; // Redirect to Stripe
};
```

**Estimate**: 1 day

---

#### 3. User Billing Dashboard

**Status**: Not started  
**Impact**: High - Users can't manage subscriptions

**What's Needed:**

- `/settings/billing` - Billing dashboard
  - Current plan & price
  - Payment method
  - Billing history
  - Invoice downloads
  - Cancel subscription button
  - Update payment method
- Stripe Customer Portal integration

**Estimate**: 1-2 days

---

### **Priority 2: UX Enhancements** 🟡

#### 4. Challenge Access Enforcement

**Status**: Paywall component exists, but not integrated  
**Impact**: Medium - Free users can currently access all challenges

**What's Needed:**

- Integrate `useSubscription` hook in challenge pages
- Show `<Paywall />` component when limit exceeded
- Add `<UpgradePrompt />` to locked challenge cards
- Update challenge list to show lock icons

**Code Example:**

```typescript
// In challenge page
const { hasAccess } = useSubscription();

if (!hasAccess(challengeIndex)) {
  return <Paywall challengeTitle={title} challengeIndex={index} />;
}
```

**Estimate**: 0.5 days

---

#### 5. Progress Tracking

**Status**: Basic structure exists  
**Impact**: Medium - Users want to see their progress

**What's Needed:**

- Database table: `user_progress`
  - `user_id`, `challenge_id`, `status`, `completed_at`
- Update challenge completion API
- Progress visualization on dashboard
- Completion certificates

**Estimate**: 1 day

---

#### 6. Pricing Page Improvements

**Status**: Basic page exists  
**Impact**: Low-Medium - Could improve conversions

**What's Needed:**

- Annual/Monthly toggle (currently just text)
- Live countdown timer (more dynamic than "X days left")
- Comparison table showing feature differences
- Testimonials section
- FAQ expansion/collapse
- "Most Popular" badge animations

**Estimate**: 1 day

---

### **Priority 3: Email & Marketing** 🟢

#### 7. Welcome Email on Signup

**Status**: Template exists, not integrated  
**Impact**: Medium - Good for engagement

**What's Needed:**

- Trigger `sendWelcomeEmail()` on user signup
- Supabase trigger or API endpoint
- Test email delivery

**Estimate**: 0.5 days

---

#### 8. Post-Upgrade Thank You Email

**Status**: Template exists, not integrated  
**Impact**: Low - Nice to have

**What's Needed:**

- Trigger `sendThankYouEmail()` after successful checkout
- Include in webhook handler
- Add welcome instructions

**Estimate**: 0.5 days

---

#### 9. Re-engagement Emails

**Status**: Not started  
**Impact**: Low - Could reduce churn

**What's Needed:**

- "You haven't logged in for 7 days" email
- "Complete your first challenge" email
- "New advanced techniques added" email

**Estimate**: 1 day

---

### **Priority 4: Analytics & Monitoring** 📊

#### 10. Conversion Tracking

**Status**: Not started  
**Impact**: High for business insights

**What's Needed:**

- Track key events:
  - Signups
  - Free trial starts
  - Challenge completions
  - Upgrade clicks
  - Successful checkouts
  - Cancellations
- Integration options:
  - Plausible (privacy-friendly)
  - PostHog (product analytics)
  - Google Analytics
  - Mixpanel

**Estimate**: 1 day

---

#### 11. Admin Dashboard

**Status**: Not started  
**Impact**: Medium - Need to monitor business

**What's Needed:**

- `/admin` - Admin-only dashboard
  - MRR (Monthly Recurring Revenue)
  - Active subscriptions by tier
  - Churn rate
  - Conversion funnel
  - Revenue projections
  - Grandfathered users count

**SQL Queries:**

```sql
-- MRR
SELECT SUM(locked_monthly_price) / 100 as mrr
FROM subscriptions
WHERE status = 'active' AND billing_cycle = 'monthly';

-- Conversion rate
SELECT
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') * 100.0 /
  (SELECT COUNT(*) FROM auth.users) as conversion_rate;

-- Grandfathered users
SELECT subscribed_phase, COUNT(*)
FROM subscriptions
WHERE status = 'active'
GROUP BY subscribed_phase;
```

**Estimate**: 2 days

---

### **Priority 5: Performance & Tech Debt** ⚙️

#### 12. Stripe Type Definitions

**Status**: Using `as any` workaround  
**Impact**: Low - Works but not type-safe

**What's Better:**

```typescript
// Instead of: subscription as any
// Install proper types:
npm install --save-dev @stripe/stripe-js

// Use proper types
import type { StripeSubscription } from '@stripe/stripe-js';
```

**Estimate**: 0.5 days

---

#### 13. Error Handling

**Status**: Basic error logging  
**Impact**: Medium - Better error tracking needed

**What's Needed:**

- Integrate Sentry or similar
- Better error messages to users
- Retry logic for failed webhooks
- Dead letter queue for failed emails

**Estimate**: 1 day

---

#### 14. Testing

**Status**: No tests  
**Impact**: Medium - Risky for production

**What's Needed:**

- Unit tests for pricing logic
- Integration tests for Stripe webhooks
- E2E tests for checkout flow
- Test database for Stripe test mode

**Estimate**: 2-3 days

---

#### 15. Environment Configuration

**Status**: Using `.env.example`  
**Impact**: Low - Setup could be easier

**What's Needed:**

- Setup script: `npm run setup`
  - Checks for required env vars
  - Validates Stripe connection
  - Tests Supabase connection
  - Verifies email (Resend) working
- Better `.env.example` documentation

**Estimate**: 0.5 days

---

### **Priority 6: Nice-to-Haves** ✨

#### 16. Referral Program

**Status**: Not started  
**Impact**: Medium - Could drive growth

**What's Needed:**

- Referral codes
- 1 month free for referrer
- 20% off for referee
- Referral tracking table
- Referral dashboard

**Estimate**: 2 days

---

#### 17. Annual Billing Incentive

**Status**: Shows pricing, no incentive  
**Impact**: Low - Could improve LTV

**What's Needed:**

- Badge showing "Save 31%" on annual
- Highlight annual savings more prominently
- Maybe: 2 months free on annual (from $144 → $120)

**Estimate**: 0.5 days

---

#### 18. Team Seat Upgrades

**Status**: Fixed at 5 seats  
**Impact**: Low - Some teams might need more

**What's Needed:**

- Allow purchasing additional seats
- Pricing: +$7/month per extra seat
- Update subscription record
- Update Stripe subscription quantity

**Estimate**: 1 day

---

#### 19. Lifetime Deal Scarcity

**Status**: Lifetime tier exists but always available in Phase 3  
**Impact**: Low - Could create urgency

**What's Needed:**

- Limited quantity (e.g., "Only 100 lifetime spots")
- Counter showing remaining spots
- Remove once sold out

**Estimate**: 0.5 days

---

#### 20. Social Proof

**Status**: Not started  
**Impact**: Medium - Helps conversions

**What's Needed:**

- Display subscriber count on homepage
  - "Join 1,234 engineers learning RAG"
- Testimonials section on pricing page
- Company logos (if applicable)
- GitHub stars count

**Estimate**: 1 day

---

## 📅 Recommended Implementation Order

### Week 1 (Critical Launch Blockers)

1. ✅ Stripe Checkout Integration (1 day)
2. ✅ Challenge Access Enforcement (0.5 days)
3. ✅ Team Management UI (3 days)

### Week 2 (Core Features)

4. ✅ User Billing Dashboard (2 days)
5. ✅ Progress Tracking (1 day)
6. ✅ Welcome Emails (0.5 days)
7. ✅ Admin Dashboard (2 days)

### Week 3 (Polish & Growth)

8. ✅ Conversion Tracking (1 day)
9. ✅ Pricing Page Improvements (1 day)
10. ✅ Social Proof (1 day)
11. ✅ Referral Program (2 days)

### Week 4 (Quality & Reliability)

12. ✅ Testing Suite (3 days)
13. ✅ Error Handling (1 day)
14. ✅ Stripe Type Fixes (0.5 days)

---

## 💰 Quick Wins (< 1 day, High Impact)

1. **Stripe Checkout** (1 day) - Start making money!
2. **Challenge Access** (0.5 days) - Enforce paywall
3. **Welcome Email** (0.5 days) - Better onboarding
4. **Environment Setup** (0.5 days) - Easier deployment

---

## 🎯 Focus for Next Sprint

**If you only do 3 things, do these:**

1. **Stripe Checkout Integration** - Without this, you can't make money
2. **Team Management UI** - Team subscriptions are half your revenue
3. **Challenge Access Enforcement** - Free tier needs limits

**Total Time**: ~5 days  
**Revenue Impact**: HIGH 💰

---

## 📊 Success Metrics

Track these to measure success:

- **MRR** (Monthly Recurring Revenue)
- **Conversion Rate** (Free → Paid)
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value)
- **Churn Rate**
- **Grandfathered Users** (Phase 1 subscribers)

**Goal for Phase 1**: 1,000 paid users @ $12/mo = $12,000 MRR

---

**Current Status**: 85% complete for MVP launch  
**Remaining**: Team UI, Stripe integration, Access enforcement  
**ETA to Launch**: 5-7 days of focused work
