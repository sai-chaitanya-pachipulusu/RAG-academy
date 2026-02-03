-- RAG Academy: Analytics Dashboard Migration
-- Adds comprehensive analytics tables for time-per-challenge, skill gaps, and learning insights
-- Run this in Supabase SQL Editor

-- ============================================
-- 1) Create challenge_analytics table for detailed challenge metrics
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  
  -- Time tracking
  first_attempt_at timestamptz,
  last_attempt_at timestamptz,
  completed_at timestamptz,
  total_time_spent_seconds integer NOT NULL DEFAULT 0, -- Total time spent on this challenge
  
  -- Attempt tracking
  attempts_count integer NOT NULL DEFAULT 0,
  successful_attempts integer NOT NULL DEFAULT 0,
  failed_attempts integer NOT NULL DEFAULT 0,
  
  -- Performance metrics
  best_score double precision,
  average_score double precision,
  first_attempt_score double precision,
  
  -- Code evolution
  code_versions integer NOT NULL DEFAULT 0, -- Number of code iterations
  lines_of_code_final integer,
  
  -- Difficulty rating (user-provided)
  user_difficulty_rating integer CHECK (user_difficulty_rating BETWEEN 1 AND 5),
  
  -- Help usage
  hints_used integer NOT NULL DEFAULT 0,
  solution_viewed boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user/challenge
  CONSTRAINT unique_user_challenge_analytics UNIQUE (user_id, challenge_slug)
);

COMMENT ON TABLE public.challenge_analytics IS 'Detailed analytics for each challenge attempt by user';
COMMENT ON COLUMN public.challenge_analytics.total_time_spent_seconds IS 'Total time in seconds spent on this challenge across all sessions';
COMMENT ON COLUMN public.challenge_analytics.code_versions IS 'Number of distinct code submissions/iterations';

-- ============================================
-- 2) Create skill_gap_analysis table for identifying learning gaps
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_gap_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Skill categorization
  skill_category text NOT NULL, -- e.g., 'vector_math', 'chunking', 'retrieval', 'evaluation'
  skill_name text NOT NULL, -- e.g., 'cosine_similarity', 'bm25'
  
  -- Gap metrics
  proficiency_score double precision NOT NULL DEFAULT 0, -- 0-100 score
  challenges_attempted integer NOT NULL DEFAULT 0,
  challenges_completed integer NOT NULL DEFAULT 0,
  average_attempts_per_challenge double precision,
  average_time_per_challenge integer, -- in seconds
  
  -- Gap identification
  gap_severity text NOT NULL DEFAULT 'none' CHECK (gap_severity IN ('none', 'minor', 'moderate', 'severe')),
  recommended_challenges text[], -- Array of challenge slugs to improve
  
  -- Comparison to peers (percentile)
  peer_percentile integer CHECK (peer_percentile BETWEEN 0 AND 100),
  
  -- Last calculated
  calculated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user/skill
  CONSTRAINT unique_user_skill_gap UNIQUE (user_id, skill_category, skill_name)
);

COMMENT ON TABLE public.skill_gap_analysis IS 'Identifies skill gaps and learning opportunities per user';
COMMENT ON COLUMN public.skill_gap_analysis.gap_severity IS 'none: >80%, minor: 60-80%, moderate: 40-60%, severe: <40%';

-- ============================================
-- 3) Create learning_sessions table for tracking study sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session details
  session_type text NOT NULL CHECK (session_type IN ('challenge', 'lesson', 'review', 'interview', 'practice')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  
  -- Content worked on
  challenge_slug text,
  lesson_slug text,
  
  -- Session metrics
  challenges_completed integer NOT NULL DEFAULT 0,
  xp_earned integer NOT NULL DEFAULT 0,
  
  -- Focus score (based on activity patterns)
  focus_score integer CHECK (focus_score BETWEEN 0 AND 100),
  
  -- Device/Context
  device_type text,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.learning_sessions IS 'Tracks individual learning sessions for productivity analytics';

-- ============================================
-- 4) Create daily_learning_stats table for aggregated daily metrics
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_learning_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  
  -- Activity counts
  challenges_attempted integer NOT NULL DEFAULT 0,
  challenges_completed integer NOT NULL DEFAULT 0,
  lessons_completed integer NOT NULL DEFAULT 0,
  
  -- Time tracking
  total_study_time_seconds integer NOT NULL DEFAULT 0,
  longest_session_seconds integer,
  
  -- XP and progress
  xp_earned integer NOT NULL DEFAULT 0,
  streak_day boolean NOT NULL DEFAULT false,
  
  -- Performance
  average_score double precision,
  
  -- Skills worked on
  skills_practiced text[],
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user/date
  CONSTRAINT unique_user_daily_stats UNIQUE (user_id, date)
);

COMMENT ON TABLE public.daily_learning_stats IS 'Aggregated daily learning statistics per user';

-- ============================================
-- 5) Create peer_comparison table for benchmarking
-- ============================================
CREATE TABLE IF NOT EXISTS public.peer_comparison (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Comparison period
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  -- User stats
  user_challenges_completed integer NOT NULL DEFAULT 0,
  user_total_time_seconds integer NOT NULL DEFAULT 0,
  user_average_score double precision,
  
  -- Peer stats (same skill level/timeframe)
  peer_group_size integer NOT NULL DEFAULT 0,
  peer_median_challenges integer NOT NULL DEFAULT 0,
  peer_median_time_seconds integer NOT NULL DEFAULT 0,
  peer_median_score double precision,
  
  -- Percentiles
  challenges_percentile integer CHECK (challenges_percentile BETWEEN 0 AND 100),
  time_percentile integer CHECK (time_percentile BETWEEN 0 AND 100),
  score_percentile integer CHECK (score_percentile BETWEEN 0 AND 100),
  
  calculated_at timestamptz NOT NULL DEFAULT now(),
  
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.peer_comparison IS 'Benchmarks user performance against peers';

-- ============================================
-- 6) Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_challenge_analytics_user ON public.challenge_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_analytics_challenge ON public.challenge_analytics(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_challenge_analytics_completed ON public.challenge_analytics(completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skill_gap_user ON public.skill_gap_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_category ON public.skill_gap_analysis(skill_category);
CREATE INDEX IF NOT EXISTS idx_skill_gap_severity ON public.skill_gap_analysis(gap_severity);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON public.learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_started ON public.learning_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_type ON public.learning_sessions(session_type);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user ON public.daily_learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON public.daily_learning_stats(date);

CREATE INDEX IF NOT EXISTS idx_peer_comparison_user ON public.peer_comparison(user_id);

-- ============================================
-- 7) Create function to calculate skill gaps
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_skill_gaps(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  skill_record RECORD;
  proficiency DOUBLE PRECISION;
  severity TEXT;
BEGIN
  -- This would be called periodically to update skill gaps
  -- For each skill category, calculate proficiency and gap severity
  
  FOR skill_record IN 
    SELECT 
      ca.challenge_slug,
      COUNT(*) as attempts,
      COUNT(*) FILTER (WHERE ca.completed_at IS NOT NULL) as completed,
      AVG(ca.attempts_count) as avg_attempts,
      AVG(ca.total_time_spent_seconds) as avg_time
    FROM public.challenge_analytics ca
    WHERE ca.user_id = p_user_id
    GROUP BY ca.challenge_slug
  LOOP
    -- Calculate proficiency (simplified logic)
    IF skill_record.attempts > 0 THEN
      proficiency := (skill_record.completed::DOUBLE PRECISION / skill_record.attempts) * 100;
      
      -- Determine severity
      IF proficiency >= 80 THEN
        severity := 'none';
      ELSIF proficiency >= 60 THEN
        severity := 'minor';
      ELSIF proficiency >= 40 THEN
        severity := 'moderate';
      ELSE
        severity := 'severe';
      END IF;
      
      -- Insert or update skill gap record
      INSERT INTO public.skill_gap_analysis (
        user_id, skill_category, skill_name, proficiency_score,
        challenges_attempted, challenges_completed, 
        average_attempts_per_challenge, average_time_per_challenge,
        gap_severity, calculated_at
      ) VALUES (
        p_user_id, 
        'general', 
        skill_record.challenge_slug,
        proficiency,
        skill_record.attempts,
        skill_record.completed,
        skill_record.avg_attempts,
        skill_record.avg_time::INTEGER,
        severity,
        NOW()
      )
      ON CONFLICT (user_id, skill_category, skill_name) 
      DO UPDATE SET
        proficiency_score = EXCLUDED.proficiency_score,
        challenges_attempted = EXCLUDED.challenges_attempted,
        challenges_completed = EXCLUDED.challenges_completed,
        average_attempts_per_challenge = EXCLUDED.average_attempts_per_challenge,
        average_time_per_challenge = EXCLUDED.average_time_per_challenge,
        gap_severity = EXCLUDED.gap_severity,
        calculated_at = EXCLUDED.calculated_at,
        updated_at = NOW();
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.calculate_skill_gaps IS 'Calculates and updates skill gap analysis for a user';

-- ============================================
-- 8) Create function to update daily stats
-- ============================================
CREATE OR REPLACE FUNCTION public.update_daily_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_stats RECORD;
BEGIN
  -- Get or create daily stats for today
  SELECT * INTO current_stats
  FROM public.daily_learning_stats
  WHERE user_id = NEW.user_id AND date = today_date;
  
  IF current_stats IS NULL THEN
    INSERT INTO public.daily_learning_stats (
      user_id, date, challenges_attempted, challenges_completed, xp_earned
    ) VALUES (
      NEW.user_id, today_date, 1, 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'completed' THEN 50 ELSE 0 END
    );
  ELSE
    UPDATE public.daily_learning_stats
    SET 
      challenges_attempted = challenges_attempted + 1,
      challenges_completed = challenges_completed + CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
      xp_earned = xp_earned + CASE WHEN NEW.status = 'completed' THEN 50 ELSE 0 END,
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND date = today_date;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update daily stats on challenge progress change
DROP TRIGGER IF EXISTS update_daily_stats_trigger ON public.user_progress;
CREATE TRIGGER update_daily_stats_trigger
  AFTER INSERT OR UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_stats();

-- ============================================
-- 9) Enable RLS
-- ============================================
ALTER TABLE public.challenge_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_comparison ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10) Create RLS policies
-- ============================================
-- Users can only see their own analytics
CREATE POLICY "Users can view own challenge analytics"
  ON public.challenge_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge analytics"
  ON public.challenge_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge analytics"
  ON public.challenge_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own skill gaps"
  ON public.skill_gap_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning sessions"
  ON public.learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions"
  ON public.learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning sessions"
  ON public.learning_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily stats"
  ON public.daily_learning_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own peer comparison"
  ON public.peer_comparison FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 11) Create views for common analytics queries
-- ============================================

-- View: User learning summary
CREATE OR REPLACE VIEW public.v_user_learning_summary AS
SELECT 
  user_id,
  COUNT(DISTINCT challenge_slug) as total_challenges_attempted,
  COUNT(DISTINCT challenge_slug) FILTER (WHERE completed_at IS NOT NULL) as total_challenges_completed,
  SUM(total_time_spent_seconds) as total_time_spent_seconds,
  AVG(best_score) as average_best_score,
  SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END)::FLOAT / 
    NULLIF(COUNT(*), 0) * 100 as completion_rate
FROM public.challenge_analytics
GROUP BY user_id;

COMMENT ON VIEW public.v_user_learning_summary IS 'Summary of user learning activity across all challenges';

-- View: Weekly activity heatmap data
CREATE OR REPLACE VIEW public.v_weekly_activity AS
SELECT 
  user_id,
  DATE_TRUNC('week', date) as week_start,
  SUM(challenges_completed) as challenges_completed,
  SUM(total_study_time_seconds) as total_study_time_seconds,
  SUM(xp_earned) as xp_earned,
  COUNT(DISTINCT date) FILTER (WHERE challenges_completed > 0) as active_days
FROM public.daily_learning_stats
GROUP BY user_id, DATE_TRUNC('week', date);

COMMENT ON VIEW public.v_weekly_activity IS 'Weekly aggregated learning activity';
