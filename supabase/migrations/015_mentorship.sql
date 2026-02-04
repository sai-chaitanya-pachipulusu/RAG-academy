-- ============================================
-- RAG Academy: Mentorship & Peer Matching Migration
-- Adds tables for mentorship, peer matching, and session tracking
-- ============================================

-- ============================================
-- 1) Create mentor_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile info
  bio text,
  skills text[] DEFAULT '{}',
  skill_level text NOT NULL DEFAULT 'intermediate' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience integer,
  
  -- Availability
  is_available boolean NOT NULL DEFAULT true,
  max_mentees integer NOT NULL DEFAULT 3,
  current_mentees integer NOT NULL DEFAULT 0,
  
  -- Stats
  total_sessions integer NOT NULL DEFAULT 0,
  total_mentees integer NOT NULL DEFAULT 0,
  rating numeric(2,1) NOT NULL DEFAULT 5.0,
  review_count integer NOT NULL DEFAULT 0,
  
  -- Preferences
  preferred_session_types text[] DEFAULT ARRAY['one_on_one'],
  timezone text,
  languages text[] DEFAULT ARRAY['en'],
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mentor_profiles IS 'Mentor profiles and availability';

-- ============================================
-- 2) Create mentorship_requests table
-- ============================================
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Request details
  message text NOT NULL,
  goals text[] DEFAULT '{}',
  preferred_session_type text NOT NULL DEFAULT 'one_on_one' CHECK (preferred_session_type IN ('one_on_one', 'group', 'code_review', 'pair_programming')),
  
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  completed_at timestamptz,
  
  -- Constraints
  CONSTRAINT unique_accepted_mentorship UNIQUE (mentor_id, mentee_id)
);

COMMENT ON TABLE public.mentorship_requests IS 'Mentorship requests between users';

-- ============================================
-- 3) Create mentorship_sessions table
-- ============================================
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  
  -- Session details
  type text NOT NULL CHECK (type IN ('one_on_one', 'group', 'code_review', 'pair_programming')),
  topic text,
  notes text,
  
  -- Scheduling
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer,
  
  -- Status
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  
  -- Feedback
  mentor_feedback text,
  mentee_feedback text,
  mentee_rating integer CHECK (mentee_rating BETWEEN 1 AND 5),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

COMMENT ON TABLE public.mentorship_sessions IS 'Individual mentorship sessions';

-- ============================================
-- 4) Create mentorship_reviews table
-- ============================================
CREATE TABLE IF NOT EXISTS public.mentorship_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback text NOT NULL,
  would_recommend boolean NOT NULL DEFAULT true,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(mentorship_id, reviewer_id)
);

COMMENT ON TABLE public.mentorship_reviews IS 'Reviews for completed mentorships';

-- ============================================
-- 5) Create peer_matches cache table
-- ============================================
CREATE TABLE IF NOT EXISTS public.peer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Matching data
  skill_overlap text[] DEFAULT '{}',
  complementary_skills text[] DEFAULT '{}',
  compatibility_score integer NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
  
  -- Status
  is_active boolean NOT NULL DEFAULT true,
  
  -- Timestamps
  calculated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  
  UNIQUE(user_id, matched_user_id)
);

COMMENT ON TABLE public.peer_matches IS 'Cached peer matching results';

-- ============================================
-- 6) Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_available ON public.mentor_profiles(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_skills ON public.mentor_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON public.mentor_profiles(rating DESC);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON public.mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee ON public.mentorship_requests(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);

CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentorship ON public.mentorship_sessions(mentorship_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_scheduled ON public.mentorship_sessions(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_peer_matches_user ON public.peer_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_peer_matches_score ON public.peer_matches(user_id, compatibility_score DESC);

-- ============================================
-- 7) Create helper functions
-- ============================================

-- Function to increment mentor mentees count
CREATE OR REPLACE FUNCTION increment_mentor_mentees(mentor_request_id uuid)
RETURNS void AS $$
DECLARE
  mentor_uuid uuid;
BEGIN
  SELECT mentor_id INTO mentor_uuid
  FROM public.mentorship_requests
  WHERE id = mentor_request_id;
  
  UPDATE public.mentor_profiles
  SET current_mentees = current_mentees + 1
  WHERE user_id = mentor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update mentor stats after session
CREATE OR REPLACE FUNCTION update_mentor_stats(p_session_id uuid)
RETURNS void AS $$
DECLARE
  mentor_uuid uuid;
  session_count integer;
BEGIN
  -- Get mentor ID
  SELECT mr.mentor_id INTO mentor_uuid
  FROM public.mentorship_sessions ms
  JOIN public.mentorship_requests mr ON ms.mentorship_id = mr.id
  WHERE ms.id = p_session_id;
  
  -- Count total sessions
  SELECT COUNT(*) INTO session_count
  FROM public.mentorship_sessions ms
  JOIN public.mentorship_requests mr ON ms.mentorship_id = mr.id
  WHERE mr.mentor_id = mentor_uuid
    AND ms.status = 'completed';
  
  -- Update stats
  UPDATE public.mentor_profiles
  SET total_sessions = session_count
  WHERE user_id = mentor_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update mentor rating
CREATE OR REPLACE FUNCTION update_mentor_rating(p_mentor_id uuid)
RETURNS void AS $$
DECLARE
  avg_rating numeric;
  review_count integer;
BEGIN
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count
  FROM public.mentorship_reviews mr
  JOIN public.mentorship_requests mreq ON mr.mentorship_id = mreq.id
  WHERE mreq.mentor_id = p_mentor_id
    AND mr.reviewee_id = p_mentor_id;
  
  UPDATE public.mentor_profiles
  SET rating = COALESCE(avg_rating, 5.0),
      review_count = review_count
  WHERE user_id = p_mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find peer matches
CREATE OR REPLACE FUNCTION find_peer_matches(
  p_user_id uuid,
  p_user_skills text[],
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  user_id uuid,
  username text,
  avatar_url text,
  skill_overlap text[],
  complementary_skills text[],
  compatibility_score integer,
  last_active_at timestamptz,
  challenges_completed bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH user_skills AS (
    SELECT UNNEST(p_user_skills) as skill
  ),
  other_users AS (
    SELECT DISTINCT
      p.id as other_id,
      p.username,
      p.avatar_url,
      p.last_activity_date,
      array_agg(DISTINCT sga.skill_name) as their_skills
    FROM public.profiles p
    LEFT JOIN public.skill_gap_analysis sga ON p.id = sga.user_id
    WHERE p.id != p_user_id
      AND p.last_activity_date > now() - interval '30 days'
    GROUP BY p.id, p.username, p.avatar_url, p.last_activity_date
  ),
  matches AS (
    SELECT 
      ou.other_id,
      ou.username,
      ou.avatar_url,
      ou.last_activity_date as last_active_at,
      ARRAY(
        SELECT UNNEST(ou.their_skills)
        INTERSECT
        SELECT skill FROM user_skills
      ) as overlap,
      ARRAY(
        SELECT UNNEST(ou.their_skills)
        EXCEPT
        SELECT skill FROM user_skills
      ) as complementary
    FROM other_users ou
    WHERE ou.their_skills && p_user_skills
  )
  SELECT 
    m.other_id as user_id,
    m.username,
    m.avatar_url,
    m.overlap as skill_overlap,
    m.complementary as complementary_skills,
    (array_length(m.overlap, 1) * 10 + array_length(m.complementary, 1) * 5)::integer as compatibility_score,
    m.last_active_at,
    (SELECT COUNT(*) FROM public.challenge_progress cp WHERE cp.user_id = m.other_id AND cp.status = 'completed') as challenges_completed
  FROM matches m
  ORDER BY compatibility_score DESC, m.last_active_at DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8) Create triggers
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mentor_profiles_updated_at ON public.mentor_profiles;
CREATE TRIGGER trg_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 9) Set up Row Level Security
-- ============================================

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_matches ENABLE ROW LEVEL SECURITY;

-- Mentor profiles: Public can view available mentors
DROP POLICY IF EXISTS "mentor_profiles_select_public" ON public.mentor_profiles;
CREATE POLICY "mentor_profiles_select_public"
  ON public.mentor_profiles FOR SELECT
  USING (is_available = true);

-- Mentor profiles: Users can manage their own
DROP POLICY IF EXISTS "mentor_profiles_manage_own" ON public.mentor_profiles;
CREATE POLICY "mentor_profiles_manage_own"
  ON public.mentor_profiles FOR ALL
  USING (user_id = auth.uid());

-- Mentorship requests: Users can view their own
DROP POLICY IF EXISTS "mentorship_requests_select_own" ON public.mentorship_requests;
CREATE POLICY "mentorship_requests_select_own"
  ON public.mentorship_requests FOR SELECT
  USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

-- Mentorship requests: Users can create (as mentee)
DROP POLICY IF EXISTS "mentorship_requests_insert_own" ON public.mentorship_requests;
CREATE POLICY "mentorship_requests_insert_own"
  ON public.mentorship_requests FOR INSERT
  WITH CHECK (mentee_id = auth.uid());

-- Mentorship requests: Mentor can update status
DROP POLICY IF EXISTS "mentorship_requests_update_mentor" ON public.mentorship_requests;
CREATE POLICY "mentorship_requests_update_mentor"
  ON public.mentorship_requests FOR UPDATE
  USING (mentor_id = auth.uid());

-- Mentorship sessions: Participants can view
DROP POLICY IF EXISTS "mentorship_sessions_select_participant" ON public.mentorship_sessions;
CREATE POLICY "mentorship_sessions_select_participant"
  ON public.mentorship_sessions FOR SELECT
  USING (
    mentorship_id IN (
      SELECT id FROM public.mentorship_requests
      WHERE mentor_id = auth.uid() OR mentee_id = auth.uid()
    )
  );

-- Mentorship sessions: Participants can manage
DROP POLICY IF EXISTS "mentorship_sessions_manage_participant" ON public.mentorship_sessions;
CREATE POLICY "mentorship_sessions_manage_participant"
  ON public.mentorship_sessions FOR ALL
  USING (
    mentorship_id IN (
      SELECT id FROM public.mentorship_requests
      WHERE mentor_id = auth.uid() OR mentee_id = auth.uid()
    )
  );

-- Mentorship reviews: Participants can view
DROP POLICY IF EXISTS "mentorship_reviews_select_participant" ON public.mentorship_reviews;
CREATE POLICY "mentorship_reviews_select_participant"
  ON public.mentorship_reviews FOR SELECT
  USING (
    mentorship_id IN (
      SELECT id FROM public.mentorship_requests
      WHERE mentor_id = auth.uid() OR mentee_id = auth.uid()
    )
  );

-- Mentorship reviews: Reviewer can create
DROP POLICY IF EXISTS "mentorship_reviews_insert_own" ON public.mentorship_reviews;
CREATE POLICY "mentorship_reviews_insert_own"
  ON public.mentorship_reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

-- Peer matches: Users can view their own
DROP POLICY IF EXISTS "peer_matches_select_own" ON public.peer_matches;
CREATE POLICY "peer_matches_select_own"
  ON public.peer_matches FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- 10) Create views
-- ============================================

-- View: Available mentors with stats
CREATE OR REPLACE VIEW public.available_mentors AS
SELECT 
  mp.*,
  p.username,
  p.avatar_url,
  p.xp,
  (mp.max_mentees - mp.current_mentees) as available_slots
FROM public.mentor_profiles mp
JOIN public.profiles p ON mp.user_id = p.id
WHERE mp.is_available = true
  AND mp.current_mentees < mp.max_mentees
ORDER BY mp.rating DESC, mp.total_sessions DESC;

-- View: Active mentorships
CREATE OR REPLACE VIEW public.active_mentorships AS
SELECT 
  mr.*,
  m.username as mentor_username,
  m.avatar_url as mentor_avatar,
  me.username as mentee_username,
  me.avatar_url as mentee_avatar
FROM public.mentorship_requests mr
JOIN public.profiles m ON mr.mentor_id = m.id
JOIN public.profiles me ON mr.mentee_id = me.id
WHERE mr.status = 'accepted';

COMMENT ON VIEW public.available_mentors IS 'Mentors currently accepting new mentees';
COMMENT ON VIEW public.active_mentorships IS 'Currently active mentorship relationships';
