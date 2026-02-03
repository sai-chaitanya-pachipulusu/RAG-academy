-- RAG Academy: Email System Migration
-- Creates tables for email preferences, logs, and queue
-- Run this in Supabase SQL Editor

-- ============================================
-- 1) Create email_preferences table
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email type toggles (default to true for transactional, false for marketing)
  welcome_email BOOLEAN NOT NULL DEFAULT true,
  streak_reminders BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  challenge_notifications BOOLEAN NOT NULL DEFAULT true,
  achievement_notifications BOOLEAN NOT NULL DEFAULT true,
  subscription_notifications BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  
  -- Scheduling preferences
  preferred_time TIME NOT NULL DEFAULT '09:00:00',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  
  -- Unsubscribe all
  unsubscribed_all BOOLEAN NOT NULL DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint: one preference record per user
  UNIQUE(user_id)
);

-- Add comment for documentation
COMMENT ON TABLE public.email_preferences IS 'User email preferences and unsubscribe settings';
COMMENT ON COLUMN public.email_preferences.welcome_email IS 'Send welcome email on registration';
COMMENT ON COLUMN public.email_preferences.streak_reminders IS 'Daily streak reminder emails';
COMMENT ON COLUMN public.email_preferences.weekly_digest IS 'Weekly progress summary emails';
COMMENT ON COLUMN public.email_preferences.challenge_notifications IS 'Challenge completion emails';
COMMENT ON COLUMN public.email_preferences.achievement_notifications IS 'Achievement unlock emails';
COMMENT ON COLUMN public.email_preferences.subscription_notifications IS 'Subscription/payment related emails';
COMMENT ON COLUMN public.email_preferences.marketing_emails IS 'Marketing and promotional emails';
COMMENT ON COLUMN public.email_preferences.preferred_time IS 'Preferred time for daily emails (streak reminders)';
COMMENT ON COLUMN public.email_preferences.unsubscribed_all IS 'User has unsubscribed from all emails';

-- ============================================
-- 2) Create email_logs table for tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Email details
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  
  -- Provider details
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_message_id TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'complained', 'opened', 'clicked', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Error tracking
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_logs IS 'Tracks all sent emails and their delivery status';
COMMENT ON COLUMN public.email_logs.status IS 'Current status: pending, sent, delivered, bounced, complained, opened, clicked, failed';
COMMENT ON COLUMN public.email_logs.metadata IS 'Additional data like IP, user agent, etc.';

-- ============================================
-- 3) Create email_queue table for batch processing
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  
  -- Email content
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Retry logic
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.email_queue IS 'Queue for scheduled/batch email processing';
COMMENT ON COLUMN public.email_queue.priority IS '1 = highest, 10 = lowest priority';
COMMENT ON COLUMN public.email_queue.scheduled_for IS 'When the email should be sent';

-- ============================================
-- 4) Create indexes for performance
-- ============================================

-- Email preferences indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON public.email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribed ON public.email_preferences(unsubscribed_all) WHERE unsubscribed_all = true;

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON public.email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_provider_message_id ON public.email_logs(provider_message_id);

-- Email queue indexes
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON public.email_queue(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON public.email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON public.email_queue(priority, scheduled_for);

-- ============================================
-- 5) Enable Row Level Security
-- ============================================

-- Email preferences RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
  ON public.email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON public.email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert email preferences"
  ON public.email_preferences
  FOR INSERT
  WITH CHECK (true);

-- Email logs RLS (read-only for users, admin write)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email logs"
  ON public.email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage email logs"
  ON public.email_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Email queue RLS (service role only)
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage email queue"
  ON public.email_queue
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6) Create function to auto-create preferences on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.create_email_preferences_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_email_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_email_preferences_on_signup();

-- ============================================
-- 7) Create function to update timestamps
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON public.email_preferences;
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_logs_updated_at ON public.email_logs;
CREATE TRIGGER update_email_logs_updated_at
  BEFORE UPDATE ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_queue_updated_at ON public.email_queue;
CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON public.email_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8) Create helper function to check if email should be sent
-- ============================================
CREATE OR REPLACE FUNCTION public.should_send_email(
  p_user_id UUID,
  p_email_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prefs RECORD;
BEGIN
  -- Get user preferences
  SELECT * INTO v_prefs
  FROM public.email_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences exist, allow (will be created by trigger)
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Check if unsubscribed from all
  IF v_prefs.unsubscribed_all THEN
    RETURN false;
  END IF;
  
  -- Check specific email type
  CASE p_email_type
    WHEN 'welcome' THEN RETURN v_prefs.welcome_email;
    WHEN 'streak_reminder' THEN RETURN v_prefs.streak_reminders;
    WHEN 'weekly_digest' THEN RETURN v_prefs.weekly_digest;
    WHEN 'challenge_completed' THEN RETURN v_prefs.challenge_notifications;
    WHEN 'achievement_unlocked' THEN RETURN v_prefs.achievement_notifications;
    WHEN 'subscription_confirmation' THEN RETURN v_prefs.subscription_notifications;
    WHEN 'marketing' THEN RETURN v_prefs.marketing_emails;
    ELSE RETURN true; -- Default to allow for unknown types
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9) Create view for email analytics
-- ============================================
CREATE OR REPLACE VIEW public.email_analytics AS
SELECT
  email_type,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'opened') as opened,
  COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'opened') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0),
    2
  ) as open_rate,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'clicked') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0),
    2
  ) as click_rate
FROM public.email_logs
GROUP BY email_type, DATE_TRUNC('day', created_at);

COMMENT ON VIEW public.email_analytics IS 'Daily email performance metrics';
