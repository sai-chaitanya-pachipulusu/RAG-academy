-- ============================================
-- RAG Academy: Project Certificates
-- Migration 017
--
-- Stores certificates earned by completing project tracks
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_certificates (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_title text NOT NULL,
  completed_at timestamptz NOT NULL,
  certificate_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_project_certificates_user
  ON public.project_certificates(user_id);

-- Index for track lookup
CREATE INDEX IF NOT EXISTS idx_project_certificates_track
  ON public.project_certificates(track_id);

-- RLS
ALTER TABLE public.project_certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates"
  ON public.project_certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own certificates
CREATE POLICY "Users can insert own certificates"
  ON public.project_certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all certificates
CREATE POLICY "Service role full access"
  ON public.project_certificates FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.project_certificates IS 'Certificates earned by completing project tracks';
