-- ============================================
-- RAG Academy: Community Solutions Gallery Migration
-- Adds tables for sharing and browsing challenge solutions
-- ============================================

-- ============================================
-- 1) Create shared_solutions table
-- ============================================
CREATE TABLE IF NOT EXISTS public.shared_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  challenge_slug text NOT NULL,
  challenge_title text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  code text NOT NULL,
  language text NOT NULL CHECK (language IN ('python', 'typescript')),
  description text,
  approach text,
  time_complexity text,
  space_complexity text,
  
  -- Engagement metrics
  upvotes integer NOT NULL DEFAULT 0,
  downvotes integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  
  -- Flags
  is_featured boolean NOT NULL DEFAULT false,
  is_solution boolean NOT NULL DEFAULT false,  -- Official solution
  
  -- Moderation
  is_approved boolean NOT NULL DEFAULT true,
  moderation_notes text,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shared_solutions IS 'Community-shared challenge solutions';

-- ============================================
-- 2) Create solution_votes table
-- ============================================
CREATE TABLE IF NOT EXISTS public.solution_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.shared_solutions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote text NOT NULL CHECK (vote IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(solution_id, user_id)
);

COMMENT ON TABLE public.solution_votes IS 'User votes on solutions';

-- ============================================
-- 3) Create solution_comments table
-- ============================================
CREATE TABLE IF NOT EXISTS public.solution_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.shared_solutions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES public.solution_comments(id) ON DELETE CASCADE,
  upvotes integer NOT NULL DEFAULT 0,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.solution_comments IS 'Comments on shared solutions';

-- ============================================
-- 4) Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shared_solutions_challenge ON public.shared_solutions(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_shared_solutions_user ON public.shared_solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_solutions_featured ON public.shared_solutions(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_shared_solutions_upvotes ON public.shared_solutions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_shared_solutions_created ON public.shared_solutions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solution_votes_solution ON public.solution_votes(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_user ON public.solution_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_solution_comments_solution ON public.solution_comments(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_comments_parent ON public.solution_comments(parent_id);

-- ============================================
-- 5) Create helper functions
-- ============================================

-- Function to vote on solution
CREATE OR REPLACE FUNCTION vote_on_solution(
  p_solution_id uuid,
  p_user_id uuid,
  p_vote text
)
RETURNS integer AS $$
DECLARE
  existing_vote text;
  new_score integer;
BEGIN
  -- Check existing vote
  SELECT vote INTO existing_vote
  FROM public.solution_votes
  WHERE solution_id = p_solution_id AND user_id = p_user_id;
  
  IF existing_vote IS NULL THEN
    -- New vote
    INSERT INTO public.solution_votes (solution_id, user_id, vote)
    VALUES (p_solution_id, p_user_id, p_vote);
    
    IF p_vote = 'up' THEN
      UPDATE public.shared_solutions SET upvotes = upvotes + 1 WHERE id = p_solution_id;
    ELSE
      UPDATE public.shared_solutions SET downvotes = downvotes + 1 WHERE id = p_solution_id;
    END IF;
  ELSIF existing_vote != p_vote THEN
    -- Change vote
    UPDATE public.solution_votes SET vote = p_vote
    WHERE solution_id = p_solution_id AND user_id = p_user_id;
    
    IF p_vote = 'up' THEN
      UPDATE public.shared_solutions 
      SET upvotes = upvotes + 1, downvotes = downvotes - 1 
      WHERE id = p_solution_id;
    ELSE
      UPDATE public.shared_solutions 
      SET upvotes = upvotes - 1, downvotes = downvotes + 1 
      WHERE id = p_solution_id;
    END IF;
  ELSE
    -- Remove vote (toggle off)
    DELETE FROM public.solution_votes 
    WHERE solution_id = p_solution_id AND user_id = p_user_id;
    
    IF p_vote = 'up' THEN
      UPDATE public.shared_solutions SET upvotes = upvotes - 1 WHERE id = p_solution_id;
    ELSE
      UPDATE public.shared_solutions SET downvotes = downvotes - 1 WHERE id = p_solution_id;
    END IF;
  END IF;
  
  -- Return new score
  SELECT (upvotes - downvotes) INTO new_score
  FROM public.shared_solutions
  WHERE id = p_solution_id;
  
  RETURN new_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_solution_views(solution_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.shared_solutions
  SET view_count = view_count + 1
  WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_solution_comment_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.shared_solutions
    SET comment_count = comment_count + 1
    WHERE id = NEW.solution_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.shared_solutions
    SET comment_count = comment_count - 1
    WHERE id = OLD.solution_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
DROP TRIGGER IF EXISTS trg_update_comment_count ON public.solution_comments;
CREATE TRIGGER trg_update_comment_count
  AFTER INSERT OR DELETE ON public.solution_comments
  FOR EACH ROW EXECUTE FUNCTION update_solution_comment_count();

-- ============================================
-- 6) Create triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_shared_solutions_updated_at ON public.shared_solutions;
CREATE TRIGGER trg_shared_solutions_updated_at
  BEFORE UPDATE ON public.shared_solutions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_solution_comments_updated_at ON public.solution_comments;
CREATE TRIGGER trg_solution_comments_updated_at
  BEFORE UPDATE ON public.solution_comments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 7) Set up Row Level Security
-- ============================================

ALTER TABLE public.shared_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution_comments ENABLE ROW LEVEL SECURITY;

-- Shared solutions: Public can view approved solutions
DROP POLICY IF EXISTS "shared_solutions_select_public" ON public.shared_solutions;
CREATE POLICY "shared_solutions_select_public"
  ON public.shared_solutions FOR SELECT
  USING (is_approved = true);

-- Shared solutions: Users can manage their own
DROP POLICY IF EXISTS "shared_solutions_manage_own" ON public.shared_solutions;
CREATE POLICY "shared_solutions_manage_own"
  ON public.shared_solutions FOR ALL
  USING (user_id = auth.uid());

-- Solution votes: Users can view all
DROP POLICY IF EXISTS "solution_votes_select_public" ON public.solution_votes;
CREATE POLICY "solution_votes_select_public"
  ON public.solution_votes FOR SELECT
  USING (true);

-- Solution votes: Users can manage their own
DROP POLICY IF EXISTS "solution_votes_manage_own" ON public.solution_votes;
CREATE POLICY "solution_votes_manage_own"
  ON public.solution_votes FOR ALL
  USING (user_id = auth.uid());

-- Solution comments: Public can view approved
DROP POLICY IF EXISTS "solution_comments_select_public" ON public.solution_comments;
CREATE POLICY "solution_comments_select_public"
  ON public.solution_comments FOR SELECT
  USING (is_approved = true);

-- Solution comments: Users can manage their own
DROP POLICY IF EXISTS "solution_comments_manage_own" ON public.solution_comments;
CREATE POLICY "solution_comments_manage_own"
  ON public.solution_comments FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- 8) Create views
-- ============================================

-- View: User solution statistics
CREATE OR REPLACE VIEW public.user_solution_stats AS
SELECT 
  ss.user_id,
  p.username,
  p.avatar_url,
  COUNT(*) as solution_count,
  SUM(ss.upvotes) as total_upvotes,
  SUM(ss.view_count) as total_views
FROM public.shared_solutions ss
JOIN public.profiles p ON ss.user_id = p.id
WHERE ss.is_approved = true
GROUP BY ss.user_id, p.username, p.avatar_url;

-- View: Top solutions per challenge
CREATE OR REPLACE VIEW public.top_challenge_solutions AS
SELECT DISTINCT ON (challenge_slug)
  id,
  challenge_slug,
  challenge_title,
  user_id,
  upvotes,
  view_count,
  created_at
FROM public.shared_solutions
WHERE is_approved = true
ORDER BY challenge_slug, upvotes DESC;

COMMENT ON VIEW public.user_solution_stats IS 'Statistics for users who share solutions';
COMMENT ON VIEW public.top_challenge_solutions IS 'Top-voted solution for each challenge';

-- ============================================
-- 9) Insert sample featured solutions
-- ============================================

-- Only insert if no solutions exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.shared_solutions LIMIT 1) THEN
    -- This would be populated with actual sample solutions
    -- For now, we leave it empty for real user content
    NULL;
  END IF;
END $$;
