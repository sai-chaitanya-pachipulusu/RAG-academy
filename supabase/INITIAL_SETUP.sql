-- ===========================================
-- RAG Academy: Complete Initial Database Setup
-- ===========================================
-- Run this ONCE in Supabase SQL Editor to set up everything
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New query
-- Paste this entire file and click "Run"

-- ===========================================
-- PART 0: Migration Safety - Ensure Paddle columns exist
-- ===========================================

-- First, ensure the subscriptions table exists with Paddle columns
-- This handles cases where the table was created with old column names
DO $$
BEGIN
  -- Check if subscriptions table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') THEN
    -- Add missing Paddle columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'paddle_subscription_id' AND table_schema = 'public') THEN
      ALTER TABLE public.subscriptions ADD COLUMN paddle_subscription_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'paddle_order_id' AND table_schema = 'public') THEN
      ALTER TABLE public.subscriptions ADD COLUMN paddle_order_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'paddle_product_id' AND table_schema = 'public') THEN
      ALTER TABLE public.subscriptions ADD COLUMN paddle_product_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'paddle_price_id' AND table_schema = 'public') THEN
      ALTER TABLE public.subscriptions ADD COLUMN paddle_price_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'paddle_customer_id' AND table_schema = 'public') THEN
      ALTER TABLE public.subscriptions ADD COLUMN paddle_customer_id text;
    END IF;
  END IF;
END $$;

-- ===========================================
-- PART 1: Core Tables (profiles + challenge progress)
-- ===========================================

-- 1) Profiles: 1 row per user (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  avatar_url text,
  xp integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  last_activity_date date,
  -- Subscription fields (updated by webhooks)
  subscription_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'none',
  paddle_customer_id text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Challenge progress: per-user per-challenge
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  attempts integer NOT NULL DEFAULT 0,
  user_code text,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, challenge_slug)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user
  ON public.challenge_progress(user_id);

-- ===========================================
-- PART 2: Subscriptions (for Paddle payments)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Paddle identifiers
  paddle_subscription_id text,
  paddle_order_id text,
  paddle_product_id text,
  paddle_price_id text,
  paddle_customer_id text,
  
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
  
  -- Ensure one subscription per user
  UNIQUE(user_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paddle_subscription_id ON public.subscriptions(paddle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);

-- ===========================================
-- PART 3: Helper Functions
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_challenge_progress_updated_at ON public.challenge_progress;
CREATE TRIGGER trg_challenge_progress_updated_at
BEFORE UPDATE ON public.challenge_progress
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to check if user has active subscription
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

-- Function to get user's subscription tier
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

-- ===========================================
-- PART 4: Row Level Security (RLS)
-- ===========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read (for leaderboard), users can update their own
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Challenge progress: Users can only see/modify their own
DROP POLICY IF EXISTS "challenge_progress_select_own" ON public.challenge_progress;
CREATE POLICY "challenge_progress_select_own"
ON public.challenge_progress FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_progress_insert_own" ON public.challenge_progress;
CREATE POLICY "challenge_progress_insert_own"
ON public.challenge_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "challenge_progress_update_own" ON public.challenge_progress;
CREATE POLICY "challenge_progress_update_own"
ON public.challenge_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Subscriptions: Users can read their own, service role can do everything
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Service role policy for webhooks (INSERT/UPDATE/DELETE)
-- Note: Service role bypasses RLS by default, so this is just for documentation

-- ===========================================
-- PART 5: Auto-create profile on signup
-- ===========================================

-- This function creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- PART 6: Comments
-- ===========================================

COMMENT ON TABLE public.profiles IS 'User profiles with XP, streaks, and subscription status';
COMMENT ON TABLE public.challenge_progress IS 'Tracks user progress on each challenge';
COMMENT ON TABLE public.subscriptions IS 'Subscription data synced from Paddle via webhooks';
COMMENT ON COLUMN public.subscriptions.status IS 'active, trialing, past_due, canceled, incomplete, revoked, lifetime';
COMMENT ON COLUMN public.subscriptions.tier IS 'free, pro, team, lifetime';

-- ===========================================
-- DONE! Your database is now set up.
-- ===========================================
-- 
-- Next steps:
-- 1. Set up Paddle webhook at: https://vendors.paddle.com → Developer Tools → Notifications
--    - URL: https://ragacademy.space/api/webhooks/paddle
--    - Secret: Use your PADDLE_WEBHOOK_SECRET from .env
--    - Events: subscription.*, order.*, checkout.*
-- 
-- 2. Deploy to Vercel with your environment variables
-- 
-- 3. Test the payment flow!
