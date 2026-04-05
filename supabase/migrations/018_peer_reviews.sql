-- ============================================
-- RAG Academy: Peer Reviews
-- Migration 018
--
-- Stores peer reviews for project submissions
-- ============================================

CREATE TABLE IF NOT EXISTS public.peer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id text NOT NULL,
  project_title text NOT NULL,
  criteria jsonb NOT NULL DEFAULT '[]',
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 10),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for project lookup
CREATE INDEX IF NOT EXISTS idx_peer_reviews_project
  ON public.peer_reviews(project_id);

-- Index for reviewer lookup
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer
  ON public.peer_reviews(reviewer_id);

-- RLS
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.peer_reviews FOR SELECT
  USING (true);

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews"
  ON public.peer_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.peer_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

COMMENT ON TABLE public.peer_reviews IS 'Peer reviews for project submissions';
