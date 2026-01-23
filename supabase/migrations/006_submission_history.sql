-- RAG Academy: Submission History
-- Stores all code submission attempts for each challenge (like LeetCode/HackerRank)
-- Run this in Supabase SQL Editor

-- 1) Create submission_history table
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

-- 2) Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_submission_history_user_id ON public.submission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_challenge ON public.submission_history(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_submission_history_user_challenge ON public.submission_history(user_id, challenge_slug);
CREATE INDEX IF NOT EXISTS idx_submission_history_submitted_at ON public.submission_history(submitted_at DESC);

-- 3) Enable RLS
ALTER TABLE public.submission_history ENABLE ROW LEVEL SECURITY;

-- 4) RLS Policies
-- Users can insert their own submissions
DROP POLICY IF EXISTS "submission_history_insert_own" ON public.submission_history;
CREATE POLICY "submission_history_insert_own"
ON public.submission_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submission history
DROP POLICY IF EXISTS "submission_history_select_own" ON public.submission_history;
CREATE POLICY "submission_history_select_own"
ON public.submission_history FOR SELECT
USING (auth.uid() = user_id);

-- Service role can do everything (for admin/analytics)
DROP POLICY IF EXISTS "submission_history_service_role_all" ON public.submission_history;
CREATE POLICY "submission_history_service_role_all"
ON public.submission_history FOR ALL
USING (auth.role() = 'service_role');

-- 5) Function to get submission stats for a user
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

-- 6) Function to get recent submissions for a challenge
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

-- 7) Comments
COMMENT ON TABLE public.submission_history IS 'Stores all code submission attempts for challenges (like LeetCode)';
COMMENT ON COLUMN public.submission_history.status IS 'accepted, wrong_answer, runtime_error, time_limit, compilation_error';
COMMENT ON COLUMN public.submission_history.score IS 'For benchmark challenges, the efficiency score (0-100)';
