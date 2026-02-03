-- RAG Academy: Discussion System
-- Real-time collaborative discussions for challenge pages
-- Run this in Supabase SQL Editor

-- ============================================
-- 1) Create discussion_threads table
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussion_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_slug text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Thread content
  category text NOT NULL CHECK (category IN ('question', 'solution', 'optimization', 'bug_report', 'tip', 'general')),
  title text NOT NULL,
  content text NOT NULL,
  code_snippet text,
  
  -- Engagement metrics (stored for performance)
  upvotes integer NOT NULL DEFAULT 0,
  reply_count integer NOT NULL DEFAULT 0,
  
  -- Thread status
  is_pinned boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 2) Create discussion_replies table
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Reply content
  content text NOT NULL,
  code_snippet text,
  
  -- Engagement metrics
  upvotes integer NOT NULL DEFAULT 0,
  
  -- Answer status
  is_accepted_answer boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 3) Create discussion_votes table (for tracking user votes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.discussion_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id uuid REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  vote_type smallint NOT NULL CHECK (vote_type IN (-1, 1)), -- -1 for downvote, 1 for upvote
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure either thread_id or reply_id is set, but not both
  CONSTRAINT check_vote_target CHECK (
    (thread_id IS NOT NULL AND reply_id IS NULL) OR
    (thread_id IS NULL AND reply_id IS NOT NULL)
  ),
  
  -- Prevent duplicate votes
  CONSTRAINT unique_thread_vote UNIQUE (user_id, thread_id),
  CONSTRAINT unique_reply_vote UNIQUE (user_id, reply_id)
);

-- ============================================
-- 4) Indexes for efficient queries
-- ============================================
-- Threads
CREATE INDEX IF NOT EXISTS idx_threads_challenge ON public.discussion_threads(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_threads_user ON public.discussion_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_category ON public.discussion_threads(category);
CREATE INDEX IF NOT EXISTS idx_threads_created ON public.discussion_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_pinned ON public.discussion_threads(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_threads_upvotes ON public.discussion_threads(upvotes DESC);

-- Replies
CREATE INDEX IF NOT EXISTS idx_replies_thread ON public.discussion_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_replies_user ON public.discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_accepted ON public.discussion_replies(is_accepted_answer DESC);
CREATE INDEX IF NOT EXISTS idx_replies_upvotes ON public.discussion_replies(upvotes DESC);

-- Votes
CREATE INDEX IF NOT EXISTS idx_votes_thread ON public.discussion_votes(thread_id);
CREATE INDEX IF NOT EXISTS idx_votes_reply ON public.discussion_votes(reply_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.discussion_votes(user_id);

-- ============================================
-- 5) Enable Row Level Security
-- ============================================
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6) RLS Policies for discussion_threads
-- ============================================

-- Everyone can read threads
DROP POLICY IF EXISTS "threads_read_all" ON public.discussion_threads;
CREATE POLICY "threads_read_all"
  ON public.discussion_threads
  FOR SELECT
  USING (true);

-- Authenticated users can create threads
DROP POLICY IF EXISTS "threads_insert_auth" ON public.discussion_threads;
CREATE POLICY "threads_insert_auth"
  ON public.discussion_threads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own threads
DROP POLICY IF EXISTS "threads_update_own" ON public.discussion_threads;
CREATE POLICY "threads_update_own"
  ON public.discussion_threads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own threads
DROP POLICY IF EXISTS "threads_delete_own" ON public.discussion_threads;
CREATE POLICY "threads_delete_own"
  ON public.discussion_threads
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7) RLS Policies for discussion_replies
-- ============================================

-- Everyone can read replies
DROP POLICY IF EXISTS "replies_read_all" ON public.discussion_replies;
CREATE POLICY "replies_read_all"
  ON public.discussion_replies
  FOR SELECT
  USING (true);

-- Authenticated users can create replies
DROP POLICY IF EXISTS "replies_insert_auth" ON public.discussion_replies;
CREATE POLICY "replies_insert_auth"
  ON public.discussion_replies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own replies
DROP POLICY IF EXISTS "replies_update_own" ON public.discussion_replies;
CREATE POLICY "replies_update_own"
  ON public.discussion_replies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own replies
DROP POLICY IF EXISTS "replies_delete_own" ON public.discussion_replies;
CREATE POLICY "replies_delete_own"
  ON public.discussion_replies
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8) RLS Policies for discussion_votes
-- ============================================

-- Users can read all votes (to show vote counts)
DROP POLICY IF EXISTS "votes_read_all" ON public.discussion_votes;
CREATE POLICY "votes_read_all"
  ON public.discussion_votes
  FOR SELECT
  USING (true);

-- Authenticated users can vote
DROP POLICY IF EXISTS "votes_insert_auth" ON public.discussion_votes;
CREATE POLICY "votes_insert_auth"
  ON public.discussion_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
DROP POLICY IF EXISTS "votes_update_own" ON public.discussion_votes;
CREATE POLICY "votes_update_own"
  ON public.discussion_votes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
DROP POLICY IF EXISTS "votes_delete_own" ON public.discussion_votes;
CREATE POLICY "votes_delete_own"
  ON public.discussion_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9) Functions for vote management
-- ============================================

-- Function to update thread upvote count
CREATE OR REPLACE FUNCTION public.update_thread_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussion_threads
    SET upvotes = upvotes + NEW.vote_type
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussion_threads
    SET upvotes = upvotes - OLD.vote_type
    WHERE id = OLD.thread_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.discussion_threads
    SET upvotes = upvotes - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.thread_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update reply upvote count
CREATE OR REPLACE FUNCTION public.update_reply_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussion_replies
    SET upvotes = upvotes + NEW.vote_type
    WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussion_replies
    SET upvotes = upvotes - OLD.vote_type
    WHERE id = OLD.reply_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.discussion_replies
    SET upvotes = upvotes - OLD.vote_type + NEW.vote_type
    WHERE id = NEW.reply_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update reply count when replies are added/deleted
CREATE OR REPLACE FUNCTION public.update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.discussion_threads
    SET reply_count = reply_count + 1
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.discussion_threads
    SET reply_count = reply_count - 1
    WHERE id = OLD.thread_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10) Triggers for automatic updates
-- ============================================
DROP TRIGGER IF EXISTS thread_vote_trigger ON public.discussion_votes;
CREATE TRIGGER thread_vote_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.discussion_votes
  FOR EACH ROW
  WHEN (pg_trigger_depth() = 0)
  EXECUTE FUNCTION public.update_thread_vote_count();

DROP TRIGGER IF EXISTS reply_vote_trigger ON public.discussion_votes;
CREATE TRIGGER reply_vote_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.discussion_votes
  FOR EACH ROW
  WHEN (pg_trigger_depth() = 0)
  EXECUTE FUNCTION public.update_reply_vote_count();

DROP TRIGGER IF EXISTS reply_count_trigger ON public.discussion_replies;
CREATE TRIGGER reply_count_trigger
  AFTER INSERT OR DELETE ON public.discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_reply_count();

-- ============================================
-- 11) Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS threads_updated_at ON public.discussion_threads;
CREATE TRIGGER threads_updated_at
  BEFORE UPDATE ON public.discussion_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12) Enable Real-time for all tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_votes;

-- ============================================
-- 13) Function to check if user has voted
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_thread_vote(p_thread_id uuid, p_user_id uuid)
RETURNS smallint AS $$
DECLARE
  v_vote_type smallint;
BEGIN
  SELECT vote_type INTO v_vote_type
  FROM public.discussion_votes
  WHERE thread_id = p_thread_id AND user_id = p_user_id;
  
  RETURN COALESCE(v_vote_type, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_reply_vote(p_reply_id uuid, p_user_id uuid)
RETURNS smallint AS $$
DECLARE
  v_vote_type smallint;
BEGIN
  SELECT vote_type INTO v_vote_type
  FROM public.discussion_votes
  WHERE reply_id = p_reply_id AND user_id = p_user_id;
  
  RETURN COALESCE(v_vote_type, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 14) Function to accept answer (only thread author can do this)
-- ============================================
CREATE OR REPLACE FUNCTION public.accept_answer(p_reply_id uuid, p_thread_id uuid)
RETURNS void AS $$
DECLARE
  v_thread_user_id uuid;
BEGIN
  -- Get the thread author
  SELECT user_id INTO v_thread_user_id
  FROM public.discussion_threads
  WHERE id = p_thread_id;
  
  -- Check if current user is the thread author
  IF v_thread_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the thread author can accept an answer';
  END IF;
  
  -- Unaccept any previously accepted answer
  UPDATE public.discussion_replies
  SET is_accepted_answer = false
  WHERE thread_id = p_thread_id AND is_accepted_answer = true;
  
  -- Accept the new answer
  UPDATE public.discussion_replies
  SET is_accepted_answer = true
  WHERE id = p_reply_id AND thread_id = p_thread_id;
  
  -- Mark thread as resolved
  UPDATE public.discussion_threads
  SET is_resolved = true
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 15) Function to mark thread as resolved
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_thread_resolved(p_thread_id uuid, p_resolved boolean)
RETURNS void AS $$
DECLARE
  v_thread_user_id uuid;
BEGIN
  -- Get the thread author
  SELECT user_id INTO v_thread_user_id
  FROM public.discussion_threads
  WHERE id = p_thread_id;
  
  -- Check if current user is the thread author
  IF v_thread_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the thread author can change resolved status';
  END IF;
  
  UPDATE public.discussion_threads
  SET is_resolved = p_resolved
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
