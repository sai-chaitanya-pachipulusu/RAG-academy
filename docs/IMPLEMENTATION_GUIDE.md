# RAG Academy - Complete Implementation Guide

## Overview

This guide walks you through setting up the complete monetization system including:

1. ✅ Stripe Integration
2. ✅ Checkout Flow
3. ✅ Paywall Logic
4. ✅ Email Sequences
5. ✅ Team Pricing (included in Phase 1)

---

## 1. Stripe Setup

### Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Get API keys from Dashboard → Developers → API keys

### Step 2: Create Products

Create 3 products in Stripe Dashboard:

```
Product 1: RAG Academy Pro
- Description: Individual Pro access to RAG Academy
- ID: Save as NEXT_PUBLIC_STRIPE_PRODUCT_PRO_ID

Product 2: RAG Academy Team
- Description: Team access with 5 seats
- ID: Save as NEXT_PUBLIC_STRIPE_PRODUCT_TEAM_ID

Product 3: RAG Academy Lifetime
- Description: One-time lifetime access
- ID: Save as NEXT_PUBLIC_STRIPE_PRODUCT_LIFETIME_ID
```

### Step 3: Create Prices

For **each phase**, create prices:

#### Phase 1 (Early Bird):

```
Pro Monthly: $12/month
- ID: NEXT_PUBLIC_STRIPE_PRICE_PHASE1_PRO_MONTHLY

Pro Annual: $99/year
- ID: NEXT_PUBLIC_STRIPE_PRICE_PHASE1_PRO_ANNUAL

Team Monthly: $39/month
- ID: NEXT_PUBLIC_STRIPE_PRICE_PHASE1_TEAM_MONTHLY

Team Annual: $390/year
- ID: NEXT_PUBLIC_STRIPE_PRICE_PHASE1_TEAM_ANNUAL
```

#### Phase 2 (Standard):

```
Pro Monthly: $15/month
Pro Annual: $144/year
Team Monthly: $49/month
Team Annual: $470/year
```

#### Phase 3 (Premium):

```
Pro Monthly: $19/month
Pro Annual: $180/year
Team Monthly: $59/month
Team Annual: $570/year
Lifetime: $299 one-time
```

### Step 4: Set Up Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Save webhook secret as `STRIPE_WEBHOOK_SECRET`

---

## 2. Supabase Setup

### Step 1: Run Migration

```bash
# Apply the subscriptions migration
supabase db push

# Or manually:
psql -h your-db.supabase.co -U postgres -d postgres -f supabase/migrations/003_add_subscriptions.sql
```

### Step 2: Verify Tables

```sql
-- Check subscriptions table
SELECT * FROM subscriptions LIMIT 5;

-- Test helper functions
SELECT get_user_tier('user-id-here');
SELECT has_challenge_access('user-id-here', 35, 30);
```

---

## 3. Resend (Email) Setup

### Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Create account
3. Get API key from dashboard
4. Add API key as `RESEND_API_KEY`

### Step 2: Verify Domain

1. Go to Domains → Add Domain
2. Add `rag-academy.com`
3. Add DNS records provided by Resend
4. Wait for verification

### Step 3: Install Resend

```bash
npm install resend
```

---

## 4. Environment Variables

Create `.env.local` with these vars (see `.env.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Products
NEXT_PUBLIC_STRIPE_PRODUCT_PRO_ID=prod_...
NEXT_PUBLIC_STRIPE_PRODUCT_TEAM_ID=prod_...

# Phase 1 Prices (etc...)
NEXT_PUBLIC_STRIPE_PRICE_PHASE1_PRO_MONTHLY=price_...

# Resend
RESEND_API_KEY=re_...

# Cron
CRON_SECRET=random-secret-string-here
```

---

## 5. Vercel Cron Jobs

### Step 1: Create `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/countdown-emails",
      "schedule": "0 14 * * *"
    }
  ]
}
```

Schedule: Daily at 9 AM EST (14:00 UTC)

### Step 2: Deploy

```bash
vercel --prod
```

Cron jobs auto-activate on Vercel Pro plans.

---

## 6. Testing

### Test Stripe Checkout

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000/pricing

# Click "Subscribe Now"
# Use Stripe test card: 4242 4242 4242 4242
```

### Test Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

### Test Paywall

```typescript
// Visit any challenge beyond the free limit
http://localhost:3000/challenges/advanced-technique

# Should show paywall if not subscribed
```

### Test Emails

```typescript
// Send test email
import { sendWelcomeEmail } from "@/lib/email/sender";

await sendWelcomeEmail("test@example.com", "Test User", 30);
```

---

## 7. Deployment Checklist

### Before Going Live:

- [ ] All Stripe price IDs added to `.env`
- [ ] Webhook endpoint verified in Stripe
- [ ] Database migration applied
- [ ] Resend domain verified
- [ ] Cron job scheduled in Vercel
- [ ] Test checkout flow end-to-end
- [ ] Test webhook handling
- [ ] Test email delivery
- [ ] Switch to Stripe live mode
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain

---

## 8. Monitoring

### Key Metrics to Track

```sql
-- Active subscriptions by tier
SELECT tier, COUNT(*)
FROM subscriptions
WHERE status = 'active'
GROUP BY tier;

-- Monthly Recurring Revenue (MRR)
SELECT SUM(locked_monthly_price) / 100 as mrr_usd
FROM subscriptions
WHERE status = 'active' AND billing_cycle = 'monthly';

-- Grandfathered users (Phase 1)
SELECT COUNT(*)
FROM subscriptions
WHERE subscribed_phase = 'phase1' AND status = 'active';

-- Conversion rate
SELECT
  (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') * 100.0 /
  (SELECT COUNT(*) FROM auth.users) as conversion_rate;
```

### Stripe Dashboard

Monitor:

- MRR growth
- Churn rate
- Failed payments
- Successful checkouts

---

## 9. Troubleshooting

### Webhook Not Working

```bash
# Check webhook logs in Stripe Dashboard
# Verify STRIPE_WEBHOOK_SECRET matches

# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Email Not Sending

```typescript
// Check Resend dashboard for delivery status
// Verify RESEND_API_KEY is correct
// Check domain verification

// Test with Resend playground
```

### Paywall Not Appearing

```typescript
// Check user subscription in database
SELECT * FROM subscriptions WHERE user_id = 'user-id';

// Verify challenge index calculation
// Free limit should match current phase
```

---

## 10. Next Steps

After implementing all 4 components:

1. **Launch Early Bird Campaign**

   - Announce on social media
   - Email existing users
   - Create urgency content

2. **Monitor Performance**

   - Track conversion rates
   - Monitor churn
   - Collect user feedback

3. **Prepare for Phase 2**
   - Plan marketing for price increase
   - Update pricing page messaging
   - Prepare transition emails

---

## Support

Questions? Email: support@rag-academy.com

Created: January 4, 2026
Last Updated: January 4, 2026
