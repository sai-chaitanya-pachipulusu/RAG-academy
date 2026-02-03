/**
 * Cron job for sending daily streak reminder emails
 * Runs daily at scheduled times based on user preferences
 * 
 * Vercel Cron Config (vercel.json):
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/daily-streak-reminders",
 *       "schedule": "0 * * * *"
 *     }
 *   ]
 * }
 * 
 * This runs every hour to handle different user timezones
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStreakReminder } from '@/lib/email/triggers';
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
    
    // Get current hour in various timezones
    // We run every hour and check which users should receive emails now
    const currentHour = now.getUTCHours();
    
    // Find users who:
    // 1. Have streak reminders enabled
    // 2. Haven't been sent a reminder today
    // 3. Have their preferred time matching current hour (in their timezone)
    const { data: users, error: usersError } = await supabase
      .from('email_preferences')
      .select(`
        user_id,
        preferred_time,
        timezone,
        profiles:user_id (id, email, raw_user_meta_data)
      `)
      .eq('streak_reminders', true)
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
        message: 'No users to send reminders to',
        processed: 0,
      });
    }

    // Filter users based on their preferred time in their timezone
    const usersToEmail = users.filter((user: any) => {
      const userTimezone = user.timezone || 'America/New_York';
      const preferredTime = user.preferred_time || '09:00:00';
      
      // Get current time in user's timezone
      const userTime = new Date(now.toLocaleString('en-US', { timeZone: userTimezone }));
      const userHour = userTime.getHours();
      const userMinute = userTime.getMinutes();
      
      // Parse preferred time
      const [preferredHour, preferredMinute] = preferredTime.split(':').map(Number);
      
      // Check if it's time to send (within the hour window)
      const isCorrectHour = userHour === preferredHour;
      const isWithinFirst15Minutes = userMinute < 15;
      
      return isCorrectHour && isWithinFirst15Minutes;
    });

    if (usersToEmail.length === 0) {
      return NextResponse.json({
        message: 'No users at their preferred time',
        totalUsers: users.length,
        processed: 0,
      });
    }

    // Get streak data for these users
    const userIds = usersToEmail.map((u: any) => u.user_id);
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .in('user_id', userIds);

    if (streakError) {
      console.error('Error fetching streak data:', streakError);
    }

    const streakMap = new Map(streakData?.map((s: any) => [s.user_id, s]) || []);

    // Send emails
    const results = await Promise.allSettled(
      usersToEmail.map(async (userPref: any) => {
        const user = userPref.profiles;
        if (!user?.email) return { skipped: true, reason: 'no_email' };

        // Check if already sent today
        const today = new Date().toISOString().split('T')[0];
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('email_type', 'streak_reminder')
          .gte('created_at', today)
          .limit(1);

        if (existingLog && existingLog.length > 0) {
          return { skipped: true, reason: 'already_sent_today' };
        }

        // Check user preferences
        const shouldSend = await shouldSendEmail(user.id, 'streak_reminder');
        if (!shouldSend) {
          return { skipped: true, reason: 'preferences_disabled' };
        }

        // Get streak data
        const streak = streakMap.get(user.id);
        const streakData = {
          currentStreak: streak?.current_streak || 0,
          longestStreak: streak?.longest_streak || 0,
          daysUntilNextMilestone: streak?.days_until_milestone || 7,
          nextMilestone: streak?.next_milestone || 7,
          lastActiveDate: streak?.last_active_date || new Date().toISOString(),
        };

        // Send email
        const result = await sendStreakReminder(
          { id: user.id, email: user.email, name: user.raw_user_meta_data?.name },
          streakData
        );

        // Log the email
        if (result.success) {
          await logEmail({
            user_id: user.id,
            email_type: 'streak_reminder',
            recipient_email: user.email,
            subject: `Keep your ${streakData.currentStreak}-day streak alive! 🔥`,
            provider: 'resend',
            provider_message_id: result.id || null,
            status: 'sent',
            sent_at: new Date().toISOString(),
            delivered_at: null,
            opened_at: null,
            clicked_at: null,
            error_message: null,
            metadata: { streak: streakData.currentStreak },
          });
        } else {
          await logEmail({
            user_id: user.id,
            email_type: 'streak_reminder',
            recipient_email: user.email,
            subject: 'Streak Reminder',
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
      message: 'Daily streak reminders processed',
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
