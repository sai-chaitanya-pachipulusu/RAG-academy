-- ===========================================
-- RAG Academy: Additional Migrations (Run After INITIAL_SETUP.sql)
-- ===========================================
-- This file combines all migrations NOT included in INITIAL_SETUP.sql
-- Run this ONCE in Supabase SQL Editor after running INITIAL_SETUP.sql

-- ===========================================
-- PART 1: Leaderboard & Rankings System
-- ===========================================
-- From: 004_leaderboard_and_profiles.sql

-- 1. Ensure profiles table has all required columns
DO $$
BEGIN
    -- Add username if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username TEXT;
    END IF;

    -- Add avatar_url if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add xp if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;

    -- Add streak_days if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'streak_days') THEN
        ALTER TABLE profiles ADD COLUMN streak_days INTEGER DEFAULT 0;
    END IF;

    -- Add last_activity_date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_activity_date') THEN
        ALTER TABLE profiles ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add created_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Create indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(streak_days DESC);

-- 3. Create leaderboard_cache table for faster queries
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT,
    xp INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    rank_all_time INTEGER,
    rank_weekly INTEGER,
    rank_monthly INTEGER,
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank ON leaderboard_cache(rank_all_time);

-- 4. Create function to update leaderboard cache
CREATE OR REPLACE FUNCTION update_leaderboard_cache()
RETURNS VOID AS $$
BEGIN
    -- Truncate and rebuild cache
    TRUNCATE leaderboard_cache;
    
    INSERT INTO leaderboard_cache (user_id, username, xp, challenges_completed, streak_days)
    SELECT 
        p.id,
        p.username,
        COALESCE(p.xp, 0),
        COALESCE((SELECT COUNT(*) FROM challenge_progress cp 
                  WHERE cp.user_id = p.id AND cp.status = 'completed'), 0),
        COALESCE(p.streak_days, 0)
    FROM profiles p;
    
    -- Update all-time ranks
    UPDATE leaderboard_cache lc
    SET rank_all_time = ranked.rank
    FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY xp DESC, challenges_completed DESC) as rank
        FROM leaderboard_cache
    ) ranked
    WHERE lc.user_id = ranked.user_id;
    
    -- Update weekly ranks (only users active in last 7 days)
    UPDATE leaderboard_cache lc
    SET rank_weekly = ranked.rank
    FROM (
        SELECT lc2.user_id, ROW_NUMBER() OVER (ORDER BY lc2.xp DESC) as rank
        FROM leaderboard_cache lc2
        JOIN profiles p ON p.id = lc2.user_id
        WHERE p.last_activity_date > NOW() - INTERVAL '7 days'
    ) ranked
    WHERE lc.user_id = ranked.user_id;
    
    -- Update monthly ranks
    UPDATE leaderboard_cache lc
    SET rank_monthly = ranked.rank
    FROM (
        SELECT lc2.user_id, ROW_NUMBER() OVER (ORDER BY lc2.xp DESC) as rank
        FROM leaderboard_cache lc2
        JOIN profiles p ON p.id = lc2.user_id
        WHERE p.last_activity_date > NOW() - INTERVAL '30 days'
    ) ranked
    WHERE lc.user_id = ranked.user_id;
    
    -- Update timestamp
    UPDATE leaderboard_cache SET last_computed_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to update profile on challenge completion
CREATE OR REPLACE FUNCTION on_challenge_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        -- Update last activity
        UPDATE profiles 
        SET last_activity_date = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_challenge_completed ON challenge_progress;
CREATE TRIGGER trigger_challenge_completed
    AFTER INSERT OR UPDATE ON challenge_progress
    FOR EACH ROW
    EXECUTE FUNCTION on_challenge_completed();

-- 6. RLS for leaderboard_cache
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON leaderboard_cache;
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard_cache
    FOR SELECT USING (true);

COMMENT ON TABLE leaderboard_cache IS 'Cached leaderboard data for fast queries. Rebuild with update_leaderboard_cache()';

-- ===========================================
-- PART 2: Arena Mode Challenge Submissions
-- ===========================================
-- From: 20240523000000_create_submissions.sql

-- Create a table for comprehensive challenge submissions (Arena Mode / Benchmarks)
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  challenge_slug text not null,
  
  -- Key metrics
  score double precision not null default 0, -- 0-100
  latency_ms double precision,
  
  -- Full metrics blob (e.g. { "docs": 50, "queries": 1 })
  metrics jsonb default '{}'::jsonb,
  
  -- The code that achieved this score
  code_snapshot text,
  
  created_at timestamptz default now() not null
);

-- Enable RLS
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.challenge_submissions;
CREATE POLICY "Users can insert their own submissions"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own submissions" ON public.challenge_submissions;
CREATE POLICY "Users can view their own submissions"
  ON public.challenge_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view top submissions (Leaderboard)" ON public.challenge_submissions;
CREATE POLICY "Everyone can view top submissions (Leaderboard)"
  ON public.challenge_submissions FOR SELECT
  USING (true);

-- Indexes for challenge_submissions
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user ON public.challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge ON public.challenge_submissions(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_score ON public.challenge_submissions(score DESC);

-- ===========================================
-- PART 3: Submission History (LeetCode-style)
-- ===========================================
-- From: 006_submission_history.sql

-- Create submission_history table
CREATE TABLE IF NOT EXISTS public.submission_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  
  -- Submission details
  code text NOT NULL,
  language text NOT NULL DEFAULT 'python',
  
  -- Result
  status text NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'runtime_error', 'time_limit', 'compilation_error')),
  passed boolean NOT NULL DEFAULT false,
  
  -- Performance metrics
  execution_time_ms integer,
  memory_kb integer,
  score double precision, -- For benchmark challenges (0-100)
  
  -- Test results
  tests_passed integer DEFAULT 0,
  tests_total integer DEFAULT 0,
  
  -- Error info (if failed)
  error_message text,
  error_type text,
  
  -- Additional metrics (flexible JSON)
  metrics jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_submission_history_user_id ON public.submission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_challenge ON public.submission_history(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_submission_history_user_challenge ON public.submission_history(user_id, challenge_slug);
CREATE INDEX IF NOT EXISTS idx_submission_history_submitted_at ON public.submission_history(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "submission_history_insert_own" ON public.submission_history;
CREATE POLICY "submission_history_insert_own"
ON public.submission_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "submission_history_select_own" ON public.submission_history;
CREATE POLICY "submission_history_select_own"
ON public.submission_history FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "submission_history_service_role_all" ON public.submission_history;
CREATE POLICY "submission_history_service_role_all"
ON public.submission_history FOR ALL
USING (auth.role() = 'service_role');

-- Function to get submission stats for a user
CREATE OR REPLACE FUNCTION public.get_submission_stats(p_user_id uuid)
RETURNS TABLE (
  total_submissions bigint,
  accepted_submissions bigint,
  challenges_attempted bigint,
  challenges_solved bigint,
  acceptance_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as total_submissions,
    COUNT(*) FILTER (WHERE passed = true)::bigint as accepted_submissions,
    COUNT(DISTINCT challenge_slug)::bigint as challenges_attempted,
    COUNT(DISTINCT challenge_slug) FILTER (WHERE passed = true)::bigint as challenges_solved,
    ROUND(
      (COUNT(*) FILTER (WHERE passed = true)::numeric / NULLIF(COUNT(*)::numeric, 0)) * 100, 
      2
    ) as acceptance_rate
  FROM public.submission_history
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent submissions for a challenge
CREATE OR REPLACE FUNCTION public.get_challenge_submissions(
  p_user_id uuid, 
  p_challenge_slug text,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  status text,
  passed boolean,
  execution_time_ms integer,
  score double precision,
  submitted_at timestamptz,
  code text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sh.id,
    sh.status,
    sh.passed,
    sh.execution_time_ms,
    sh.score,
    sh.submitted_at,
    sh.code
  FROM public.submission_history sh
  WHERE sh.user_id = p_user_id AND sh.challenge_slug = p_challenge_slug
  ORDER BY sh.submitted_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.submission_history IS 'Stores all code submission attempts for challenges (like LeetCode)';
COMMENT ON COLUMN public.submission_history.status IS 'accepted, wrong_answer, runtime_error, time_limit, compilation_error';
COMMENT ON COLUMN public.submission_history.score IS 'For benchmark challenges, the efficiency score (0-100)';

-- ===========================================
-- DONE! All additional migrations applied.
-- ===========================================
-- 
-- Summary of what was added:
-- 1. Leaderboard cache table with ranking functions
-- 2. Arena mode challenge_submissions table
-- 3. LeetCode-style submission_history table
-- 
-- Your database is now fully set up!
