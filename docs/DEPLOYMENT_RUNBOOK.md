# RAG Academy — Deployment Runbook

## Critical Fixes Applied

### 1. Progress Sync Table Mismatch (FIXED)
**Issue**: Sync route detected `tableName` but hardcoded `"user_progress"` in all queries.
**Impact**: Users on `challenge_progress` schema (most common) would get 500 errors on sync.
**Fix**: Route now uses detected `tableName` and adapts column names per schema.

### 2. Migration Ordering (FIXED)
**Issue**: `20240523000000_create_submissions.sql` sorted AFTER 016.
**Impact**: New Supabase instances would create tables in wrong order.
**Fix**: Renamed to `001_create_submissions.sql`.

### 3. MetadataBase Warning (FIXED)
**Issue**: Open Graph/Twitter images resolved to `http://localhost:3000`.
**Impact**: Social sharing showed broken images.
**Fix**: Set `metadataBase: new URL("https://ragacademy.space")`.

## Pre-Deployment Checklist

- [x] Build passes (`npm run build`)
- [x] Tests pass (`npm run test:run`)
- [x] All migrations ordered (001 → 016)
- [x] Progress sync works with both table schemas
- [x] SEO metadata configured with correct domain
- [x] Security headers configured
- [x] Rate limiting on public endpoints
- [x] Webhook signature verification enabled

## Database Migration Order

Run these in Supabase SQL Editor in order:
1. `001_create_submissions.sql`
2. `003_add_subscriptions.sql`
3. `004_leaderboard_and_profiles.sql`
4. `004a_add_sent_emails.sql`
5. `005_subscriptions.sql`
6. `006_submission_history.sql`
7. `007_discussions.sql`
8. `008_progress_sync.sql`
9. `009_email_preferences.sql`
10. `010_analytics_dashboard.sql`
11. `011_spaced_repetition.sql`
12. `012_team_management.sql`
13. `013_competitions.sql`
14. `014_community_solutions.sql`
15. `015_mentorship.sql`
16. `016_missing_indexes.sql`

## Environment Variables (Production)

| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project | ✅ |
| `POLAR_ACCESS_TOKEN` | Polar.sh dashboard | ✅ |
| `POLAR_WEBHOOK_SECRET` | Polar.sh dashboard | ✅ |
| `POLAR_PRODUCT_PRO_MONTHLY` | Polar.sh product | ✅ |
| `POLAR_PRODUCT_PRO_ANNUAL` | Polar.sh product | ✅ |
| `POLAR_PRODUCT_TEAM_MONTHLY` | Polar.sh product | ✅ |
| `POLAR_PRODUCT_TEAM_ANNUAL` | Polar.sh product | ✅ |
| `POLAR_PRODUCT_LIFETIME` | Polar.sh product | ✅ |
| `NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG` | Polar.sh org | ✅ |
| `REDIS_URL` | Redis provider | ⚠️ (optional, falls back to in-memory) |
| `CRON_SECRET` | Generate random string | ✅ (for cron routes) |
| `RESEND_API_KEY` | Resend dashboard | ⚠️ (optional, for emails) |
| `RESEND_WEBHOOK_SECRET` | Resend dashboard | ⚠️ (optional, for webhooks) |

## Known Issues

1. **In-memory rate limiting** — Resets on cold starts. Redis URL is configured but rate limiter needs explicit switch to Redis mode.
2. **Quota store** — Now Redis-backed with in-memory fallback. Works correctly either way.
3. **LemonSqueezy webhook** — Stub route returns 501. Safe to ignore since Polar is primary.

## Monitoring

- **Vercel Analytics**: Enabled via `@vercel/analytics/react`
- **Error tracking**: `error.tsx` catches and displays errors to users
- **Health check**: `GET /api/payments/test` returns system status
