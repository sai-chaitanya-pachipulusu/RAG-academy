-- RAG Academy: Progress Synchronization System
-- Robust sync with conflict resolution and offline support
-- Run this in Supabase SQL Editor

-- ============================================
-- 1) Create user_progress table for synced progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  
  -- Progress state
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  attempts integer NOT NULL DEFAULT 0,
  best_score double precision,
  last_submitted_code text,
  completed_at timestamptz,
  
  -- Sync metadata
  synced_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  checksum text NOT NULL, -- Data integrity checksum
  
  -- Device/Client info
  client_timestamp timestamptz NOT NULL DEFAULT now(),
  device_id text,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user/challenge
  CONSTRAINT unique_user_challenge_progress UNIQUE (user_id, challenge_slug)
);

-- ============================================
-- 2) Create sync_queue table for offline operations
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Operation details
  operation_type text NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
  entity_type text NOT NULL CHECK (entity_type IN ('challenge_progress', 'lesson_progress', 'streak', 'xp')),
  payload jsonb NOT NULL,
  
  -- Retry logic
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 5,
  last_error text,
  next_retry_at timestamptz,
  
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  
  -- Priority for ordering (higher = process first)
  priority integer NOT NULL DEFAULT 0
);

-- ============================================
-- 3) Create progress_conflicts table for conflict tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.progress_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  
  -- Conflict details
  conflict_type text NOT NULL CHECK (conflict_type IN ('version_mismatch', 'concurrent_edit', 'checksum_mismatch', 'timestamp_conflict')),
  
  -- Local (client) state
  local_state jsonb NOT NULL,
  local_version integer NOT NULL,
  local_timestamp timestamptz NOT NULL,
  
  -- Remote (server) state
  remote_state jsonb NOT NULL,
  remote_version integer NOT NULL,
  remote_timestamp timestamptz NOT NULL,
  
  -- Resolution
  resolution_strategy text CHECK (resolution_strategy IN ('server_wins', 'client_wins', 'merge', 'manual')),
  resolved_state jsonb,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  
  -- Status
  status text NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'ignored')),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- 4) Create sync_sessions table for tracking sync operations
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync details
  device_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  
  -- Results
  items_pushed integer DEFAULT 0,
  items_pulled integer DEFAULT 0,
  conflicts_detected integer DEFAULT 0,
  conflicts_resolved integer DEFAULT 0,
  
  -- Status
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'partial')),
  error_message text,
  
  -- Performance metrics
  duration_ms integer
);

-- ============================================
-- 5) Create progress_backups table for data recovery
-- ============================================
CREATE TABLE IF NOT EXISTS public.progress_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Backup data
  backup_data jsonb NOT NULL,
  backup_type text NOT NULL CHECK (backup_type IN ('automatic', 'manual', 'pre_sync', 'pre_migration')),
  
  -- Metadata
  source_version integer,
  checksum text NOT NULL,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

-- ============================================
-- 6) Indexes for performance
-- ============================================

-- user_progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_challenge ON public.user_progress(challenge_slug);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_challenge ON public.user_progress(user_id, challenge_slug);
CREATE INDEX IF NOT EXISTS idx_user_progress_synced_at ON public.user_progress(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON public.user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON public.user_progress(updated_at DESC);

-- sync_queue indexes
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON public.sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON public.sync_queue(status, next_retry_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON public.sync_queue(priority DESC, created_at ASC);

-- progress_conflicts indexes
CREATE INDEX IF NOT EXISTS idx_progress_conflicts_user_id ON public.progress_conflicts(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_conflicts_status ON public.progress_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_progress_conflicts_unresolved ON public.progress_conflicts(user_id, status) WHERE status = 'unresolved';

-- sync_sessions indexes
CREATE INDEX IF NOT EXISTS idx_sync_sessions_user_id ON public.sync_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_started_at ON public.sync_sessions(started_at DESC);

-- progress_backups indexes
CREATE INDEX IF NOT EXISTS idx_progress_backups_user_id ON public.progress_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_backups_created_at ON public.progress_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_backups_expires ON public.progress_backups(expires_at);

-- ============================================
-- 7) Enable Row Level Security
-- ============================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_backups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8) RLS Policies for user_progress
-- ============================================

-- Users can view their own progress
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
CREATE POLICY "user_progress_select_own"
ON public.user_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
CREATE POLICY "user_progress_insert_own"
ON public.user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
CREATE POLICY "user_progress_update_own"
ON public.user_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress
DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;
CREATE POLICY "user_progress_delete_own"
ON public.user_progress FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 9) RLS Policies for sync_queue
-- ============================================

-- Users can view their own queue items
DROP POLICY IF EXISTS "sync_queue_select_own" ON public.sync_queue;
CREATE POLICY "sync_queue_select_own"
ON public.sync_queue FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own queue items
DROP POLICY IF EXISTS "sync_queue_insert_own" ON public.sync_queue;
CREATE POLICY "sync_queue_insert_own"
ON public.sync_queue FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own queue items
DROP POLICY IF EXISTS "sync_queue_update_own" ON public.sync_queue;
CREATE POLICY "sync_queue_update_own"
ON public.sync_queue FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own queue items
DROP POLICY IF EXISTS "sync_queue_delete_own" ON public.sync_queue;
CREATE POLICY "sync_queue_delete_own"
ON public.sync_queue FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 10) RLS Policies for progress_conflicts
-- ============================================

-- Users can view their own conflicts
DROP POLICY IF EXISTS "progress_conflicts_select_own" ON public.progress_conflicts;
CREATE POLICY "progress_conflicts_select_own"
ON public.progress_conflicts FOR SELECT
USING (auth.uid() = user_id);

-- Users can update (resolve) their own conflicts
DROP POLICY IF EXISTS "progress_conflicts_update_own" ON public.progress_conflicts;
CREATE POLICY "progress_conflicts_update_own"
ON public.progress_conflicts FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert conflicts
DROP POLICY IF EXISTS "progress_conflicts_insert_service" ON public.progress_conflicts;
CREATE POLICY "progress_conflicts_insert_service"
ON public.progress_conflicts FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 11) RLS Policies for sync_sessions
-- ============================================

-- Users can view their own sync sessions
DROP POLICY IF EXISTS "sync_sessions_select_own" ON public.sync_sessions;
CREATE POLICY "sync_sessions_select_own"
ON public.sync_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own sync sessions
DROP POLICY IF EXISTS "sync_sessions_insert_own" ON public.sync_sessions;
CREATE POLICY "sync_sessions_insert_own"
ON public.sync_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sync sessions
DROP POLICY IF EXISTS "sync_sessions_update_own" ON public.sync_sessions;
CREATE POLICY "sync_sessions_update_own"
ON public.sync_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- 12) RLS Policies for progress_backups
-- ============================================

-- Users can view their own backups
DROP POLICY IF EXISTS "progress_backups_select_own" ON public.progress_backups;
CREATE POLICY "progress_backups_select_own"
ON public.progress_backups FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own backups
DROP POLICY IF EXISTS "progress_backups_insert_own" ON public.progress_backups;
CREATE POLICY "progress_backups_insert_own"
ON public.progress_backups FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own backups
DROP POLICY IF EXISTS "progress_backups_delete_own" ON public.progress_backups;
CREATE POLICY "progress_backups_delete_own"
ON public.progress_backups FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 13) Functions for sync operations
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_progress_conflicts_updated_at ON public.progress_conflicts;
CREATE TRIGGER update_progress_conflicts_updated_at
  BEFORE UPDATE ON public.progress_conflicts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment version on update
CREATE OR REPLACE FUNCTION public.increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.synced_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_user_progress_version ON public.user_progress;
CREATE TRIGGER increment_user_progress_version
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.increment_version();

-- Function to get progress for sync (with pagination)
CREATE OR REPLACE FUNCTION public.get_progress_for_sync(
  p_user_id uuid,
  p_last_synced_at timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  challenge_slug text,
  status text,
  attempts integer,
  best_score double precision,
  last_submitted_code text,
  completed_at timestamptz,
  version integer,
  synced_at timestamptz,
  checksum text,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.challenge_slug,
    up.status,
    up.attempts,
    up.best_score,
    up.last_submitted_code,
    up.completed_at,
    up.version,
    up.synced_at,
    up.checksum,
    up.updated_at
  FROM public.user_progress up
  WHERE up.user_id = p_user_id
    AND (p_last_synced_at IS NULL OR up.updated_at > p_last_synced_at)
  ORDER BY up.updated_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to batch upsert progress
CREATE OR REPLACE FUNCTION public.batch_upsert_progress(
  p_user_id uuid,
  p_progress_items jsonb
)
RETURNS TABLE (
  challenge_slug text,
  success boolean,
  version integer,
  conflict_detected boolean
) AS $$
DECLARE
  item jsonb;
  existing_version integer;
  new_version integer;
  has_conflict boolean;
BEGIN
  FOR item IN SELECT jsonb_array_elements(p_progress_items)
  LOOP
    challenge_slug := item->>'challenge_slug';
    has_conflict := false;
    
    -- Check for version conflict
    SELECT version INTO existing_version
    FROM public.user_progress
    WHERE user_id = p_user_id AND challenge_slug = challenge_slug;
    
    IF existing_version IS NOT NULL AND existing_version >= (item->>'version')::integer THEN
      has_conflict := true;
    END IF;
    
    IF NOT has_conflict THEN
      INSERT INTO public.user_progress (
        user_id,
        challenge_slug,
        status,
        attempts,
        best_score,
        last_submitted_code,
        completed_at,
        version,
        checksum,
        client_timestamp,
        device_id
      )
      VALUES (
        p_user_id,
        item->>'challenge_slug',
        item->>'status',
        (item->>'attempts')::integer,
        (item->>'best_score')::double precision,
        item->>'last_submitted_code',
        (item->>'completed_at')::timestamptz,
        (item->>'version')::integer,
        item->>'checksum',
        (item->>'client_timestamp')::timestamptz,
        item->>'device_id'
      )
      ON CONFLICT (user_id, challenge_slug)
      DO UPDATE SET
        status = EXCLUDED.status,
        attempts = EXCLUDED.attempts,
        best_score = EXCLUDED.best_score,
        last_submitted_code = EXCLUDED.last_submitted_code,
        completed_at = EXCLUDED.completed_at,
        checksum = EXCLUDED.checksum,
        client_timestamp = EXCLUDED.client_timestamp,
        device_id = EXCLUDED.device_id
      WHERE public.user_progress.version < EXCLUDED.version;
      
      SELECT version INTO new_version
      FROM public.user_progress
      WHERE user_id = p_user_id AND challenge_slug = challenge_slug;
      
      success := true;
      version := new_version;
    ELSE
      success := false;
      version := existing_version;
    END IF;
    
    conflict_detected := has_conflict;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending sync queue items
CREATE OR REPLACE FUNCTION public.get_pending_sync_items(
  p_user_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  operation_type text,
  entity_type text,
  payload jsonb,
  retry_count integer,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sq.id,
    sq.operation_type,
    sq.entity_type,
    sq.payload,
    sq.retry_count,
    sq.created_at
  FROM public.sync_queue sq
  WHERE sq.user_id = p_user_id
    AND sq.status = 'pending'
    AND (sq.next_retry_at IS NULL OR sq.next_retry_at <= now())
  ORDER BY sq.priority DESC, sq.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create automatic backup
CREATE OR REPLACE FUNCTION public.create_progress_backup(
  p_user_id uuid,
  p_backup_type text DEFAULT 'automatic'
)
RETURNS uuid AS $$
DECLARE
  backup_id uuid;
  backup_data jsonb;
  data_checksum text;
BEGIN
  -- Collect all progress data
  SELECT jsonb_build_object(
    'progress', coalesce(jsonb_agg(
      jsonb_build_object(
        'challenge_slug', up.challenge_slug,
        'status', up.status,
        'attempts', up.attempts,
        'best_score', up.best_score,
        'last_submitted_code', up.last_submitted_code,
        'completed_at', up.completed_at,
        'version', up.version,
        'synced_at', up.synced_at
      )
    ), '[]'::jsonb),
    'backed_up_at', now()
  )
  INTO backup_data
  FROM public.user_progress up
  WHERE up.user_id = p_user_id;
  
  -- Generate checksum (simple hash for now)
  data_checksum := encode(digest(backup_data::text, 'sha256'), 'hex');
  
  -- Insert backup
  INSERT INTO public.progress_backups (
    user_id,
    backup_data,
    backup_type,
    checksum
  )
  VALUES (
    p_user_id,
    backup_data,
    p_backup_type,
    data_checksum
  )
  RETURNING id INTO backup_id;
  
  RETURN backup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old sync queue items
CREATE OR REPLACE FUNCTION public.cleanup_sync_queue(
  p_days_old integer DEFAULT 7
)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.sync_queue
  WHERE status IN ('completed', 'failed')
    AND created_at < now() - (p_days_old || ' days')::interval;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired backups
CREATE OR REPLACE FUNCTION public.cleanup_expired_backups()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.progress_backups
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 14) Create cleanup cron job (optional - requires pg_cron extension)
-- ============================================
-- Uncomment if pg_cron is available:
-- SELECT cron.schedule('cleanup-sync-queue', '0 3 * * *', 'SELECT public.cleanup_sync_queue(7)');
-- SELECT cron.schedule('cleanup-expired-backups', '0 4 * * *', 'SELECT public.cleanup_expired_backups()');
