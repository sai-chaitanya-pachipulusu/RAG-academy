-- ============================================
-- RAG Academy: Competitions & Events Migration
-- Adds tables for competitions, weekly events, and leaderboards
-- ============================================

-- ============================================
-- 1) Create competitions table
-- ============================================
CREATE TABLE IF NOT EXISTS public.competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  type text NOT NULL CHECK (type IN ('weekly_challenge', 'hackathon', 'speed_run', 'tournament', 'community_event')),
  title text NOT NULL,
  description text NOT NULL,
  challenge_slugs text[] NOT NULL DEFAULT '{}',
  
  -- Timing
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  registration_deadline timestamptz,
  
  -- Status
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  
  -- Scoring
  scoring_type text NOT NULL DEFAULT 'total_score' CHECK (scoring_type IN ('completion_time', 'total_score', 'challenge_count', 'custom')),
  scoring_config jsonb DEFAULT '{}',
  
  -- Rewards
  xp_bonus integer NOT NULL DEFAULT 0,
  badge_id text,
  prizes jsonb DEFAULT '[]',
  
  -- Display
  banner_url text,
  theme_color text,
  icon text,
  
  -- Metadata
  is_public boolean NOT NULL DEFAULT true,
  max_participants integer,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.competitions IS 'Coding competitions and events';

-- ============================================
-- 2) Create competition_participants table
-- ============================================
CREATE TABLE IF NOT EXISTS public.competition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Registration
  registered_at timestamptz NOT NULL DEFAULT now(),
  
  -- Progress
  challenges_completed text[] DEFAULT '{}',
  total_score numeric NOT NULL DEFAULT 0,
  best_time_seconds integer,
  last_submission_at timestamptz,
  
  -- Results
  final_rank integer,
  prizes_won text[] DEFAULT '{}',
  
  -- Constraints
  UNIQUE(competition_id, user_id)
);

COMMENT ON TABLE public.competition_participants IS 'Participants in competitions with their scores';

-- ============================================
-- 3) Create weekly_events table
-- ============================================
CREATE TABLE IF NOT EXISTS public.weekly_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timing
  week_start date NOT NULL,
  week_end date NOT NULL,
  
  -- Challenge
  featured_challenge_slug text NOT NULL,
  challenge_title text NOT NULL,
  
  -- Rewards
  xp_bonus integer NOT NULL DEFAULT 100,
  badge_id text,
  
  -- Display
  theme text NOT NULL,
  description text NOT NULL,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  UNIQUE(week_start)
);

COMMENT ON TABLE public.weekly_events IS 'Weekly featured challenges with bonuses';

-- ============================================
-- 4) Create event_notifications table
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  type text NOT NULL CHECK (type IN ('competition_start', 'competition_end', 'weekly_event', 'prize_awarded', 'rank_change')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  action_label text,
  
  -- Status
  read boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.event_notifications IS 'User notifications for events and competitions';

-- ============================================
-- 5) Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_competitions_status ON public.competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_dates ON public.competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_competitions_type ON public.competitions(type);

CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON public.competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user ON public.competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_score ON public.competition_participants(competition_id, total_score DESC);

CREATE INDEX IF NOT EXISTS idx_weekly_events_dates ON public.weekly_events(week_start, week_end);

CREATE INDEX IF NOT EXISTS idx_event_notifications_user ON public.event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_read ON public.event_notifications(user_id, read);

-- ============================================
-- 6) Create helper functions
-- ============================================

-- Function to get current weekly event
CREATE OR REPLACE FUNCTION get_current_weekly_event()
RETURNS TABLE (
  id uuid,
  week_start date,
  week_end date,
  featured_challenge_slug text,
  challenge_title text,
  xp_bonus integer,
  badge_id text,
  theme text,
  description text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    we.id,
    we.week_start,
    we.week_end,
    we.featured_challenge_slug,
    we.challenge_title,
    we.xp_bonus,
    we.badge_id,
    we.theme,
    we.description
  FROM public.weekly_events we
  WHERE we.week_start <= CURRENT_DATE
    AND we.week_end >= CURRENT_DATE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get competition leaderboard
CREATE OR REPLACE FUNCTION get_competition_leaderboard(comp_id uuid, result_limit integer DEFAULT 100)
RETURNS TABLE (
  rank integer,
  user_id uuid,
  username text,
  avatar_url text,
  score numeric,
  challenges_completed integer,
  best_time_seconds integer,
  last_submission_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cp.total_score DESC)::integer as rank,
    cp.user_id,
    p.username,
    p.avatar_url,
    cp.total_score,
    COALESCE(array_length(cp.challenges_completed, 1), 0)::integer as challenges_completed,
    cp.best_time_seconds,
    cp.last_submission_at
  FROM public.competition_participants cp
  JOIN public.profiles p ON cp.user_id = p.id
  WHERE cp.competition_id = comp_id
  ORDER BY cp.total_score DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update competition status automatically
CREATE OR REPLACE FUNCTION update_competition_status()
RETURNS void AS $$
BEGIN
  -- Mark competitions as active
  UPDATE public.competitions
  SET status = 'active'
  WHERE status = 'upcoming'
    AND start_date <= now()
    AND end_date > now();
  
  -- Mark competitions as completed
  UPDATE public.competitions
  SET status = 'completed'
  WHERE status = 'active'
    AND end_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to register for competition with validation
CREATE OR REPLACE FUNCTION register_for_competition(comp_id uuid, user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  comp_record public.competitions%ROWTYPE;
  participant_count integer;
  result jsonb;
BEGIN
  -- Get competition details
  SELECT * INTO comp_record
  FROM public.competitions
  WHERE id = comp_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Competition not found');
  END IF;
  
  -- Check status
  IF comp_record.status NOT IN ('upcoming', 'active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration is closed');
  END IF;
  
  -- Check registration deadline
  IF comp_record.registration_deadline IS NOT NULL AND comp_record.registration_deadline < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registration deadline has passed');
  END IF;
  
  -- Check participant limit
  IF comp_record.max_participants IS NOT NULL THEN
    SELECT COUNT(*) INTO participant_count
    FROM public.competition_participants
    WHERE competition_id = comp_id;
    
    IF participant_count >= comp_record.max_participants THEN
      RETURN jsonb_build_object('success', false, 'error', 'Competition is full');
    END IF;
  END IF;
  
  -- Try to insert
  BEGIN
    INSERT INTO public.competition_participants (competition_id, user_id)
    VALUES (comp_id, user_uuid);
    
    RETURN jsonb_build_object('success', true);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already registered');
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7) Create triggers
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_competitions_updated_at ON public.competitions;
CREATE TRIGGER trg_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 8) Set up Row Level Security
-- ============================================

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_notifications ENABLE ROW LEVEL SECURITY;

-- Competitions: Public can view public competitions
DROP POLICY IF EXISTS "competitions_select_public" ON public.competitions;
CREATE POLICY "competitions_select_public"
  ON public.competitions FOR SELECT
  USING (is_public = true);

-- Competition participants: Users can view all participants
DROP POLICY IF EXISTS "competition_participants_select_public" ON public.competition_participants;
CREATE POLICY "competition_participants_select_public"
  ON public.competition_participants FOR SELECT
  USING (true);

-- Competition participants: Users can manage their own registration
DROP POLICY IF EXISTS "competition_participants_manage_own" ON public.competition_participants;
CREATE POLICY "competition_participants_manage_own"
  ON public.competition_participants FOR ALL
  USING (user_id = auth.uid());

-- Weekly events: Public can view
DROP POLICY IF EXISTS "weekly_events_select_public" ON public.weekly_events;
CREATE POLICY "weekly_events_select_public"
  ON public.weekly_events FOR SELECT
  USING (true);

-- Event notifications: Users can only see their own
DROP POLICY IF EXISTS "event_notifications_select_own" ON public.event_notifications;
CREATE POLICY "event_notifications_select_own"
  ON public.event_notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "event_notifications_update_own" ON public.event_notifications;
CREATE POLICY "event_notifications_update_own"
  ON public.event_notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- 9) Create views
-- ============================================

-- View: Active competitions with participant counts
CREATE OR REPLACE VIEW public.active_competitions AS
SELECT 
  c.*,
  COUNT(cp.id) as participant_count
FROM public.competitions c
LEFT JOIN public.competition_participants cp ON c.id = cp.competition_id
WHERE c.status IN ('upcoming', 'active')
GROUP BY c.id;

-- View: User competition stats
CREATE OR REPLACE VIEW public.user_competition_stats AS
SELECT 
  cp.user_id,
  COUNT(*) as total_competitions,
  COUNT(*) FILTER (WHERE cp.final_rank = 1) as first_place_finishes,
  COUNT(*) FILTER (WHERE cp.final_rank <= 3) as podium_finishes,
  SUM(cp.total_score) as total_score,
  MAX(cp.final_rank) as best_rank
FROM public.competition_participants cp
WHERE cp.final_rank IS NOT NULL
GROUP BY cp.user_id;

COMMENT ON VIEW public.active_competitions IS 'Currently active and upcoming competitions with participant counts';
COMMENT ON VIEW public.user_competition_stats IS 'Competition statistics per user';

-- ============================================
-- 10) Insert sample weekly events
-- ============================================

-- Only insert if no events exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.weekly_events LIMIT 1) THEN
    INSERT INTO public.weekly_events (
      week_start, week_end, featured_challenge_slug, challenge_title,
      xp_bonus, badge_id, theme, description
    ) VALUES
    (
      CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer),
      CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer) + 6,
      'cosine-similarity',
      'Vector Similarity Mastery',
      150,
      'vector-master',
      'Vector Math',
      'Master the fundamentals of vector similarity with cosine and dot product challenges'
    ),
    (
      CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer) + 7,
      CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer) + 13,
      'chunking-strategies',
      'Chunking Championship',
      150,
      'chunking-master',
      'Document Chunking',
      'Explore different chunking strategies and their impact on retrieval quality'
    ),
    (
      CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer) + 14,
      CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::integer) + 20,
      'hnsw-index',
      'Indexing Deep Dive',
      200,
      'index-architect',
      'Vector Indexing',
      'Build and optimize HNSW indexes for efficient similarity search'
    );
  END IF;
END $$;
