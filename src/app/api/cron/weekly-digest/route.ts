/**
 * Cron job for sending weekly digest emails
 * Runs every Monday at 9 AM in each user's timezone
 * 
 * Vercel Cron Config (vercel.json):
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/weekly-digest",
 *       "schedule": "0 9 * * 1"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWeeklyDigest } from '@/lib/email/triggers';
import { logEmail, shouldSendEmail } from '@/lib/supabase/email';

// Initialize Supabase with service role
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();

    // Find users who have weekly digest enabled
    const { data: users, error: usersError } = await supabase
      .from('email_preferences')
      .select(`
        user_id,
        timezone,
        profiles:user_id (id, email, raw_user_meta_data)
      `)
      .eq('weekly_digest', true)
      .eq('unsubscribed_all', false);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        message: 'No users to send digests to',
        processed: 0,
      });
    }

    // Filter users based on their timezone (send at 9 AM their time on Monday)
    const usersToEmail = users.filter((user: any) => {
      const userTimezone = user.timezone || 'America/New_York';
      
      // Get current time in user's timezone
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      const userDay = userTime.getDay();
      const userHour = userTime.getHours();
      
      // Send on Monday between 9 AM and 10 AM
      return userDay === 1 && userHour === 9;
    });

    if (usersToEmail.length === 0) {
      return NextResponse.json({
        message: 'No users at their preferred time (Monday 9 AM)',
        totalUsers: users.length,
        processed: 0,
      });
    }

    // Calculate date range for the digest (previous week)
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - weekEnd.getDay()); // Last Sunday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // Previous Monday

    const weekStartStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekEndStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Get stats for each user
    const userIds = usersToEmail.map((u: any) => u.user_id);
    
    // Fetch user stats in parallel
    const [submissionsData, completionsData, leaderboardData] = await Promise.all([
      // Get submissions from last week
      supabase
        .from('submissions')
        .select('user_id, created_at')
        .in('user_id', userIds)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString()),
      
      // Get completed challenges
      supabase
        .from('user_challenges')
        .select('user_id, challenge_slug, completed_at, challenges:challenge_slug (title)')
        .in('user_id', userIds)
        .eq('status', 'completed')
        .gte('completed_at', weekStart.toISOString())
        .lte('completed_at', weekEnd.toISOString()),
      
      // Get leaderboard positions
      supabase
        .from('leaderboard')
        .select('user_id, rank')
        .in('user_id', userIds),
    ]);

    // Group data by user
    const submissionsByUser = new Map();
    submissionsData.data?.forEach((s: any) => {
      if (!submissionsByUser.has(s.user_id)) {
        submissionsByUser.set(s.user_id, []);
      }
      submissionsByUser.get(s.user_id).push(s);
    });

    const completionsByUser = new Map();
    completionsData.data?.forEach((c: any) => {
      if (!completionsByUser.has(c.user_id)) {
        completionsByUser.set(c.user_id, []);
      }
      completionsByUser.get(c.user_id).push(c);
    });

    const rankByUser = new Map(leaderboardData.data?.map((l: any) => [l.user_id, l.rank]) || []);

    // Get total learners count
    const { count: totalLearners } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Send emails
    const results = await Promise.allSettled(
      usersToEmail.map(async (userPref: any) => {
        const user = userPref.profiles;
        if (!user?.email) return { skipped: true, reason: 'no_email' };

        // Check if already sent this week
        const thisWeekStart = weekStart.toISOString().split('T')[0];
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('email_type', 'weekly_digest')
          .gte('created_at', thisWeekStart)
          .limit(1);

        if (existingLog && existingLog.length > 0) {
          return { skipped: true, reason: 'already_sent_this_week' };
        }

        // Check user preferences
        const shouldSend = await shouldSendEmail(user.id, 'weekly_digest');
        if (!shouldSend) {
          return { skipped: true, reason: 'preferences_disabled' };
        }

        // Build stats
        const userSubmissions = submissionsByUser.get(user.id) || [];
        const userCompletions = completionsByUser.get(user.id) || [];
        
        const stats = {
          challengesCompleted: userCompletions.length,
          totalSubmissions: userSubmissions.length,
          streakDays: 0, // Would need to fetch from user_streaks
          rankChange: 0,
          newAchievements: 0,
          timeSpentMinutes: userSubmissions.length * 30, // Estimate
        };

        const completedChallenges = userCompletions.map((c: any) => ({
          slug: c.challenge_slug,
          title: c.challenges?.title || c.challenge_slug,
          completedAt: c.completed_at,
        }));

        // Get recommended challenges (simplified - would use actual recommendation logic)
        const { data: recommendedChallenges } = await supabase
          .from('challenges')
          .select('slug, title, difficulty, category')
          .limit(3);

        // Send email
        const result = await sendWeeklyDigest(
          { id: user.id, email: user.email, name: user.raw_user_meta_data?.name },
          weekStartStr,
          weekEndStr,
          stats,
          completedChallenges,
          recommendedChallenges || [],
          rankByUser.get(user.id),
          totalLearners || 0
        );

        // Log the email
        if (result.success) {
          await logEmail({
            user_id: user.id,
            email_type: 'weekly_digest',
            recipient_email: user.email,
            subject: `Your Weekly Progress: ${stats.challengesCompleted} challenges completed! 📊`,
            provider: 'resend',
            provider_message_id: result.id || null,
            status: 'sent',
            sent_at: new Date().toISOString(),
            delivered_at: null,
            opened_at: null,
            clicked_at: null,
            error_message: null,
            metadata: { week_start: weekStartStr, week_end: weekEndStr },
          });
        } else {
          await logEmail({
            user_id: user.id,
            email_type: 'weekly_digest',
            recipient_email: user.email,
            subject: 'Weekly Digest',
            provider: 'resend',
            provider_message_id: null,
            status: 'failed',
            sent_at: null,
            delivered_at: null,
            opened_at: null,
            clicked_at: null,
            error_message: result.error || 'Unknown error',
            metadata: {},
          });
        }

        return result;
      })
    );

    const successful = results.filter((r: any) => r.status === 'fulfilled' && r.value?.success).length;
    const skipped = results.filter((r: any) => r.status === 'fulfilled' && r.value?.skipped).length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Weekly digests processed',
      weekRange: `${weekStartStr} - ${weekEndStr}`,
      totalUsers: usersToEmail.length,
      successful,
      skipped,
      failed,
      timestamp: now.toISOString(),
    });

  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
