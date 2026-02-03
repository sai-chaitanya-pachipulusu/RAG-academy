# RAG Academy Payment System

This directory contains the payment system integration for RAG Academy, using Paddle as the payment processor.

## Overview

The payment system handles:
- Subscription management (Pro, Team, Lifetime tiers)
- Checkout creation and processing
- Webhook handling for payment events
- Test environment for development

## Architecture

```
src/lib/payments/
├── paddle.ts       # Core Paddle integration
├── validate.ts     # Environment validation
├── polar.ts        # Legacy Polar stub (for compatibility)
└── README.md       # This file

src/app/api/
├── checkout/route.ts           # Create checkout sessions
├── payments/test/route.ts      # Test payment API
└── webhooks/paddle/route.ts    # Paddle webhook handler

src/app/(dashboard)/settings/billing/test/page.tsx  # Test UI
src/app/admin/payments/page.tsx                     # Admin dashboard
src/components/payments/TestCardDisplay.tsx         # Test card component
```

## Environment Variables

Required environment variables:

```bash
# Paddle Configuration
PADDLE_API_KEY=your_paddle_api_key
PADDLE_WEBHOOK_SECRET=your_webhook_secret
PADDLE_ENVIRONMENT=sandbox  # or "production"

# Paddle Product IDs (from Paddle dashboard)
PADDLE_PRODUCT_PRO_MONTHLY=pri_xxx
PADDLE_PRODUCT_PRO_ANNUAL=pri_xxx
PADDLE_PRODUCT_TEAM_MONTHLY=pri_xxx
PADDLE_PRODUCT_TEAM_ANNUAL=pri_xxx
PADDLE_PRODUCT_LIFETIME=pri_xxx

# Supabase (for subscription storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Testing Payments Locally

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the Test Page

Navigate to: `http://localhost:3000/settings/billing/test`

### 3. Use Test Card Numbers

The test page includes all test card numbers. Common ones:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 9995` | Insufficient funds |

For any test card:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### 4. Test Webhooks Locally

Paddle webhooks require a public URL. Use ngrok:

```bash
# Install ngrok if needed
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Configure in Paddle Dashboard:
1. Go to Developer → Webhooks
2. Add webhook URL: `https://abc123.ngrok.io/api/webhooks/paddle`
3. Select events: `subscription.created`, `subscription.updated`, etc.

### 5. Test Different Scenarios

The test page includes scenarios for:
- New subscription
- Upgrade tier
- Cancel subscription
- Payment failure
- Subscription renewal

## Webhook Events

The webhook handler (`/api/webhooks/paddle`) processes these events:

### Subscription Events
- `subscription.created` - New subscription created
- `subscription.updated` - Subscription details changed
- `subscription.canceled` - Subscription canceled
- `subscription.past_due` - Payment failed

### Transaction Events
- `transaction.completed` - Payment successful
- `transaction.past_due` - Payment failed
- `transaction.ready` - Transaction initiated

## Database Schema

### subscriptions table
```sql
create table subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  tier text not null default 'free',
  status text not null default 'none',
  subscription_id text,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### transactions table
```sql
create table transactions (
  id uuid default gen_random_uuid() primary key,
  transaction_id text not null unique,
  status text not null,
  amount text,
  currency text default 'USD',
  customer_id text,
  subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### webhook_logs table
```sql
create table webhook_logs (
  id uuid default gen_random_uuid() primary key,
  provider text not null,
  event_type text not null,
  event_id text,
  payload jsonb,
  created_at timestamptz default now()
);
```

## API Endpoints

### POST /api/checkout
Create a checkout session for a user.

```json
{
  "tier": "pro",
  "billingCycle": "monthly"
}
```

### POST /api/payments/test
Test payment API with various actions:

```json
{
  "action": "create-checkout",
  "tier": "pro",
  "billingCycle": "monthly"
}
```

Actions:
- `create-checkout` - Create test checkout
- `simulate-webhook` - Simulate webhook event
- `validate-env` - Validate environment
- `test-cards` - Get test card numbers
- `create-test-subscription` - Create test subscription
- `simulate-payment-scenario` - Run test scenario

### POST /api/webhooks/paddle
Receive Paddle webhook events.

## Troubleshooting

### "PADDLE_API_KEY not configured"
Add `PADDLE_API_KEY` to your `.env.local` file.

### "Invalid webhook signature"
- Ensure `PADDLE_WEBHOOK_SECRET` is set correctly
- Check that the webhook is coming from Paddle
- Verify the webhook URL is correct

### Checkout not creating
- Verify product IDs are set in environment variables
- Check that you're using sandbox keys for testing
- Look at browser console and server logs for errors

### Webhooks not received
- Ensure ngrok is running and URL is correct in Paddle dashboard
- Check that the webhook endpoint is accessible
- Verify webhook events are selected in Paddle dashboard

### Subscription not updating after payment
- Check webhook logs in admin dashboard
- Verify webhook handler is processing events correctly
- Look for errors in server logs

## Production Deployment

1. Switch to production environment:
   ```bash
   PADDLE_ENVIRONMENT=production
   ```

2. Update product IDs to production prices

3. Configure production webhook URL in Paddle dashboard

4. Ensure `PADDLE_WEBHOOK_SECRET` is set for security

5. Test a small transaction to verify everything works

## Security Considerations

- Always verify webhook signatures in production
- Use environment variables for all secrets
- Never log full card numbers
- Use HTTPS for all payment-related endpoints
- Store minimal payment data (use Paddle's vault)

## Support

For Paddle-specific issues:
- Paddle Documentation: https://developer.paddle.com/
- Paddle Support: https://www.paddle.com/help

For RAG Academy payment issues:
- Check the admin dashboard: `/admin/payments`
- Review webhook logs
- Validate environment configuration
