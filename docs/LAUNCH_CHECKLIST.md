# RAG Academy — Launch Checklist

## Pre-Launch Verification

### Build & Deployment
- [x] `npm run build` passes with 0 errors
- [x] `npm run test:run` passes (4 tests)
- [x] All 16 migrations ordered correctly (001 → 016)
- [x] Vercel deployment connected to `main` branch
- [x] Custom domain `ragacademy.space` configured and verified
- [x] HTTPS enabled (Vercel auto-provisions)

### Database
- [ ] Run all 16 migrations on production Supabase
- [ ] Verify `profiles` table has RLS policies
- [ ] Verify `challenge_progress` table exists
- [ ] Verify `user_progress` table exists (if migration 008 run)
- [ ] Run `SELECT update_leaderboard_cache();` to populate leaderboard
- [ ] Verify Supabase Auth has GitHub OAuth enabled
- [ ] Add redirect URLs: `http://localhost:3000/auth/callback` + production URL

### Environment Variables (Vercel Dashboard)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `POLAR_ACCESS_TOKEN`
- [ ] `POLAR_WEBHOOK_SECRET`
- [ ] `POLAR_PRODUCT_PRO_MONTHLY`
- [ ] `POLAR_PRODUCT_PRO_ANNUAL`
- [ ] `POLAR_PRODUCT_TEAM_MONTHLY`
- [ ] `POLAR_PRODUCT_TEAM_ANNUAL`
- [ ] `POLAR_PRODUCT_LIFETIME`
- [ ] `NEXT_PUBLIC_POLAR_ORGANIZATION_SLUG`
- [ ] `REDIS_URL` (optional but recommended)
- [ ] `CRON_SECRET` (generate: `openssl rand -hex 32`)
- [ ] `RESEND_API_KEY` (if sending emails)
- [ ] `RESEND_WEBHOOK_SECRET` (if using email webhooks)

### Payment Setup (Polar.sh)
- [ ] Products created: Pro Monthly, Pro Annual, Team Monthly, Team Annual, Lifetime
- [ ] Webhook configured: `https://ragacademy.space/api/webhooks/polar`
- [ ] Webhook secret copied to Vercel env vars
- [ ] Test checkout flow works in sandbox mode

### Email Setup (Resend)
- [ ] Domain verified in Resend dashboard
- [ ] API key added to Vercel env vars
- [ ] Webhook configured: `https://ragacademy.space/api/email/webhook`
- [ ] Test email sends successfully

### Monitoring
- [ ] Vercel Analytics enabled (check dashboard at vercel.com)
- [ ] Vercel Speed Insights enabled
- [ ] Health check endpoint works: `GET https://ragacademy.space/api/health`
- [ ] Set up Vercel cron jobs (weekly-digest, daily-streak, countdown-emails)
- [ ] Configure uptime monitoring (e.g., Better Uptime, Pingdom)

### SEO & Social
- [ ] `metadataBase` set to `https://ragacademy.space`
- [ ] Open Graph image exists at `/og-image.png`
- [ ] Twitter card configured
- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` generated
- [ ] Submit sitemap to Google Search Console

### Security
- [ ] Security headers configured (X-Content-Type-Options, X-Frame-Options, HSTS)
- [ ] Rate limiting on public endpoints (search, email send)
- [ ] Webhook signature verification enabled
- [ ] Supabase RLS enabled on all tables
- [ ] No secrets in client-side code

### Content
- [x] 263 challenges defined
- [x] 92 lessons indexed
- [x] All challenge MDX files have valid frontmatter
- [x] All challenge slugs have stage mappings

### Known Issues (Acceptable for Launch)
1. In-memory rate limiting resets on cold starts (Redis fallback available)
2. LemonSqueezy webhook is a stub (returns 501, Polar is primary)
3. Performance metrics endpoint logs to console only (not persisted)

## Post-Launch

- [ ] Verify all pages load without errors
- [ ] Test user registration flow (GitHub OAuth)
- [ ] Test challenge submission flow
- [ ] Test payment checkout flow
- [ ] Test progress sync (complete a challenge, refresh, verify it persists)
- [ ] Check Vercel Analytics for traffic
- [ ] Check Vercel Speed Insights for Core Web Vitals
- [ ] Monitor error logs for 24 hours
- [ ] Set up automated backups for Supabase database

## Rollback Plan

If critical issues arise:
1. Revert to last known good commit: `git revert <bad-commit>`
2. Vercel will auto-deploy the reverted commit
3. Alternatively, use Vercel dashboard → Deployments → Promote previous deployment
4. For database issues, Supabase has point-in-time recovery (enable in dashboard)
