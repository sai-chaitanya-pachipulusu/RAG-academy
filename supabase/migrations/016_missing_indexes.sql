-- ============================================
-- RAG Academy: Missing Indexes Migration
-- Migration 016
--
-- Adds indexes for frequently queried columns
-- that were missing from earlier migrations.
-- Covers 30+ tables with 45+ new indexes.
-- ============================================

-- ============================================
-- 1) challenge_submissions (migration 20240523000000)
--    This table had ZERO indexes despite heavy querying
-- ============================================
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user_id
  ON public.challenge_submissions(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge_slug
  ON public.challenge_submissions(challenge_slug);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_score
  ON public.challenge_submissions(score DESC);

CREATE INDEX IF NOT EXISTS idx_challenge_submissions_latency_ms
  ON public.challenge_submissions(latency_ms ASC);

-- Composite index for leaderboard queries (score + latency for a given challenge)
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge_score_latency
  ON public.challenge_submissions(challenge_slug, score DESC, latency_ms ASC);

-- Composite index for user + challenge lookups
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user_challenge
  ON public.challenge_submissions(user_id, challenge_slug);

-- ============================================
-- 2) submission_history (migration 006)
--    Missing: status, passed
-- ============================================
CREATE INDEX IF NOT EXISTS idx_submission_history_status
  ON public.submission_history(status);

CREATE INDEX IF NOT EXISTS idx_submission_history_passed
  ON public.submission_history(passed);

-- Composite for "accepted submissions per user per challenge"
CREATE INDEX IF NOT EXISTS idx_submission_history_user_challenge_passed
  ON public.submission_history(user_id, challenge_slug, passed);

-- ============================================
-- 3) challenge_progress (migration 004)
--    Missing: completed_at (used in .order())
-- ============================================
CREATE INDEX IF NOT EXISTS idx_challenge_progress_completed_at
  ON public.challenge_progress(completed_at DESC)
  WHERE completed_at IS NOT NULL;

-- Composite: user + status (commonly filtered together)
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_status
  ON public.challenge_progress(user_id, status);

-- ============================================
-- 4) challenge_analytics (migration 010)
--    Missing: last_attempt_at (used in .order())
-- ============================================
CREATE INDEX IF NOT EXISTS idx_challenge_analytics_last_attempt
  ON public.challenge_analytics(last_attempt_at DESC)
  WHERE last_attempt_at IS NOT NULL;

-- ============================================
-- 5) shared_solutions (migration 014)
--    Missing: language, is_approved
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shared_solutions_language
  ON public.shared_solutions(language);

CREATE INDEX IF NOT EXISTS idx_shared_solutions_approved
  ON public.shared_solutions(is_approved)
  WHERE is_approved = true;

-- Partial index for approved + featured (common combo)
CREATE INDEX IF NOT EXISTS idx_shared_solutions_approved_featured
  ON public.shared_solutions(challenge_slug, upvotes DESC)
  WHERE is_approved = true AND is_featured = true;

-- ============================================
-- 6) solution_comments (migration 014)
--    Missing: user_id, is_approved
-- ============================================
CREATE INDEX IF NOT EXISTS idx_solution_comments_user_id
  ON public.solution_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_solution_comments_approved
  ON public.solution_comments(is_approved)
  WHERE is_approved = true;

-- ============================================
-- 7) mentorship_reviews (migration 015)
--    Missing: mentorship_id, reviewee_id
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mentorship_reviews_mentorship
  ON public.mentorship_reviews(mentorship_id);

CREATE INDEX IF NOT EXISTS idx_mentorship_reviews_reviewee
  ON public.mentorship_reviews(reviewee_id);

CREATE INDEX IF NOT EXISTS idx_mentorship_reviews_reviewer
  ON public.mentorship_reviews(reviewer_id);

-- ============================================
-- 8) subscriptions (public schema, migration 005)
--    Missing: tier
-- ============================================
CREATE INDEX IF NOT EXISTS idx_public_subscriptions_tier
  ON public.subscriptions(tier);

-- Composite: tier + status (commonly filtered together)
CREATE INDEX IF NOT EXISTS idx_public_subscriptions_tier_status
  ON public.subscriptions(tier, status);

-- ============================================
-- 9) competitions (migration 013)
--    Missing: is_public (used in RLS policy)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_competitions_is_public
  ON public.competitions(is_public)
  WHERE is_public = true;

-- ============================================
-- 10) team_activity_log (migration 012)
--     Missing: user_id
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_activity_user
  ON public.team_activity_log(user_id);

-- ============================================
-- 11) learning_sessions (migration 010)
--     Missing: challenge_slug
-- ============================================
CREATE INDEX IF NOT EXISTS idx_learning_sessions_challenge
  ON public.learning_sessions(challenge_slug);

-- ============================================
-- 12) srs_reviews (migration 011)
--     Missing: challenge_slug
-- ============================================
CREATE INDEX IF NOT EXISTS idx_srs_reviews_challenge
  ON public.srs_reviews(challenge_slug);

-- ============================================
-- 13) mentorship_sessions (migration 015)
--     Missing: status
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_status
  ON public.mentorship_sessions(status);

-- ============================================
-- 14) peer_matches (migration 015)
--     Missing: is_active, matched_user_id
-- ============================================
CREATE INDEX IF NOT EXISTS idx_peer_matches_is_active
  ON public.peer_matches(is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_peer_matches_matched_user
  ON public.peer_matches(matched_user_id);

-- ============================================
-- 15) email_queue (migration 009)
--     Missing: email_type
-- ============================================
CREATE INDEX IF NOT EXISTS idx_email_queue_email_type
  ON public.email_queue(email_type);

-- ============================================
-- 16) leaderboard_cache (migration 004)
--     Missing: xp (used in .order())
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_xp
  ON public.leaderboard_cache(xp DESC);

-- ============================================
-- 17) team_settings (migration 012)
--     subscription_id has UNIQUE but add named index for RLS subquery optimization
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_settings_subscription
  ON public.team_settings(subscription_id);

-- ============================================
-- 18) team_challenges (migration 012)
--     Missing: challenge_slug
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_challenges_slug
  ON public.team_challenges(challenge_slug);

-- Composite: status + dates (for active challenge lookups)
CREATE INDEX IF NOT EXISTS idx_team_challenges_active_dates
  ON public.team_challenges(status, start_date, end_date)
  WHERE status IN ('upcoming', 'active');

-- ============================================
-- 19) event_notifications (migration 013)
--     Composite for unread notifications (very common query)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_event_notifications_unread
  ON public.event_notifications(user_id, created_at DESC)
  WHERE read = false;

-- ============================================
-- 20) srs_preferences (migration 011)
--     user_id has UNIQUE constraint, but add named index for clarity
-- ============================================
CREATE INDEX IF NOT EXISTS idx_srs_preferences_user
  ON public.srs_preferences(user_id);

-- ============================================
-- 21) srs_stats (migration 011)
--     Composite: user + date
-- ============================================
CREATE INDEX IF NOT EXISTS idx_srs_stats_user_date
  ON public.srs_stats(user_id, date);

-- ============================================
-- 22) daily_learning_stats (migration 010)
--     Composite: user + date
-- ============================================
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date
  ON public.daily_learning_stats(user_id, date);

-- ============================================
-- 23) peer_comparison (migration 010)
--     Composite: user + period
-- ============================================
CREATE INDEX IF NOT EXISTS idx_peer_comparison_user_period
  ON public.peer_comparison(user_id, period_start, period_end);

-- ============================================
-- 24) sync_sessions (migration 008)
--     Missing: status
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sync_sessions_status
  ON public.sync_sessions(status);

-- ============================================
-- 25) progress_backups (migration 008)
--     Composite: user + expires (for cleanup queries)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_progress_backups_user_expires
  ON public.progress_backups(user_id, expires_at);

-- ============================================
-- 26) email_logs (migration 009)
--     Composite: user + email_type + status
-- ============================================
CREATE INDEX IF NOT EXISTS idx_email_logs_user_type_status
  ON public.email_logs(user_id, email_type, status);

-- ============================================
-- 27) discussion_threads (migration 007)
--     Missing: is_resolved
-- ============================================
CREATE INDEX IF NOT EXISTS idx_threads_resolved
  ON public.discussion_threads(is_resolved)
  WHERE is_resolved = true;

-- ============================================
-- 28) mentorship_requests (migration 015)
--     Composite: mentor + status, mentee + status
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_status
  ON public.mentorship_requests(mentor_id, status);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee_status
  ON public.mentorship_requests(mentee_id, status);

-- ============================================
-- 29) competition_participants (migration 013)
--     Composite: user + competition
-- ============================================
CREATE INDEX IF NOT EXISTS idx_competition_participants_user_competition
  ON public.competition_participants(user_id, competition_id);

-- ============================================
-- 30) team_challenge_results (migration 012)
--     Composite: user + challenge
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_challenge_results_user_challenge
  ON public.team_challenge_results(user_id, team_challenge_id);

-- ============================================
-- Summary
-- ============================================
COMMENT ON TABLE public.challenge_submissions IS 'Arena mode submissions - now fully indexed (6 new indexes)';

-- Total: 45+ new indexes across 30+ tables
-- Includes 12 composite indexes and 8 partial indexes (WHERE clauses)
