-- RAG Academy: Subscriptions and payment tracking
-- Run this in Supabase SQL Editor

-- 1) Add subscription fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS polar_customer_id text;

-- 2) Create subscriptions table for detailed tracking
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Polar identifiers
  polar_subscription_id text,
  polar_order_id text,
  polar_product_id text,
  polar_price_id text,
  polar_customer_id text,
  
  -- Subscription details
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'revoked', 'lifetime')),
  tier text NOT NULL DEFAULT 'pro' CHECK (tier IN ('free', 'pro', 'team', 'lifetime')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual', 'lifetime')),
  
  -- Period tracking
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure one subscription per user (can be updated/replaced)
  UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_subscription_id ON public.subscriptions(polar_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Auto-update timestamp
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert/update (via webhooks)
DROP POLICY IF EXISTS "subscriptions_service_role_all" ON public.subscriptions;
CREATE POLICY "subscriptions_service_role_all"
ON public.subscriptions FOR ALL
USING (auth.role() = 'service_role');

-- 3) Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = check_user_id
    AND (
      status = 'active' 
      OR status = 'trialing'
      OR status = 'lifetime'
      OR (status = 'past_due' AND current_period_end > now())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Create function to get user's subscription tier
CREATE OR REPLACE FUNCTION public.get_subscription_tier(check_user_id uuid)
RETURNS text AS $$
DECLARE
  sub_tier text;
BEGIN
  SELECT tier INTO sub_tier
  FROM public.subscriptions
  WHERE user_id = check_user_id
  AND (
    status = 'active' 
    OR status = 'trialing'
    OR status = 'lifetime'
    OR (status = 'past_due' AND current_period_end > now())
  )
  ORDER BY 
    CASE tier WHEN 'lifetime' THEN 1 WHEN 'team' THEN 2 WHEN 'pro' THEN 3 ELSE 4 END
  LIMIT 1;
  
  RETURN COALESCE(sub_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) Update profiles policies to allow public read of limited fields (for leaderboard)
DROP POLICY IF EXISTS "profiles_select_public_limited" ON public.profiles;
CREATE POLICY "profiles_select_public_limited"
ON public.profiles FOR SELECT
USING (true);

-- 6) Comment on tables
COMMENT ON TABLE public.subscriptions IS 'Stores user subscription data synced from Polar.sh';
COMMENT ON COLUMN public.subscriptions.status IS 'active, trialing, past_due, canceled, incomplete, revoked, lifetime';
COMMENT ON COLUMN public.subscriptions.tier IS 'free, pro, team, lifetime';
