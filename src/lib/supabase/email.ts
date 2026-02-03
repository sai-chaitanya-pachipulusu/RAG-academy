/**
 * Email preferences and logging service
 * Handles user email preferences and email tracking
 */

import { requireSupabase, getSupabase } from './client';

// Type definitions for email tables
export interface EmailPreferences {
  id: string;
  user_id: string;
  welcome_email: boolean;
  streak_reminders: boolean;
  weekly_digest: boolean;
  challenge_notifications: boolean;
  achievement_notifications: boolean;
  subscription_notifications: boolean;
  marketing_emails: boolean;
  preferred_time: string;
  timezone: string;
  unsubscribed_all: boolean;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  user_id: string | null;
  email_type: string;
  recipient_email: string;
  subject: string;
  provider: string;
  provider_message_id: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked' | 'failed';
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EmailQueue {
  id: string;
  user_id: string | null;
  recipient_email: string;
  email_type: string;
  subject: string;
  html_content: string;
  text_content: string;
  scheduled_for: string;
  priority: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  processed_at: string | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type EmailType = 
  | 'welcome'
  | 'streak_reminder'
  | 'weekly_digest'
  | 'challenge_completed'
  | 'achievement_unlocked'
  | 'subscription_confirmation'
  | 'marketing';

/**
 * Get email preferences for a user
 */
export async function getEmailPreferences(userId: string): Promise<EmailPreferences | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No preferences found, create default
      return createDefaultEmailPreferences(userId);
    }
    console.error('Error fetching email preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Create default email preferences for a user
 */
export async function createDefaultEmailPreferences(userId: string): Promise<EmailPreferences | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('email_preferences')
    .insert({
      user_id: userId,
      welcome_email: true,
      streak_reminders: true,
      weekly_digest: true,
      challenge_notifications: true,
      achievement_notifications: true,
      subscription_notifications: true,
      marketing_emails: false,
      preferred_time: '09:00:00',
      timezone: 'America/New_York',
      unsubscribed_all: false,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating email preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Update email preferences
 */
export async function updateEmailPreferences(
  userId: string,
  preferences: Partial<Omit<EmailPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<EmailPreferences | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('email_preferences')
    .update(preferences)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating email preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Check if user should receive a specific email type
 */
export async function shouldSendEmail(userId: string, emailType: EmailType): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return true;
  
  const { data, error } = await supabase
    .rpc('should_send_email', {
      p_user_id: userId,
      p_email_type: emailType,
    });
  
  if (error) {
    console.error('Error checking email permission:', error);
    return true; // Default to allowing if check fails
  }
  
  return data ?? true;
}

/**
 * Log an email send attempt
 */
export async function logEmail(
  emailData: Omit<EmailLog, 'id' | 'created_at' | 'updated_at'>
): Promise<EmailLog | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('email_logs')
    .insert(emailData)
    .select()
    .single();
  
  if (error) {
    console.error('Error logging email:', error);
    return null;
  }
  
  return data;
}

/**
 * Update email log status
 */
export async function updateEmailStatus(
  logId: string,
  status: EmailLog['status'],
  additionalData?: Partial<EmailLog>
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  const updates: Partial<EmailLog> = { status, ...additionalData };
  
  // Set timestamp based on status
  const now = new Date().toISOString();
  switch (status) {
    case 'sent':
      updates.sent_at = now;
      break;
    case 'delivered':
      updates.delivered_at = now;
      break;
    case 'opened':
      updates.opened_at = now;
      break;
    case 'clicked':
      updates.clicked_at = now;
      break;
  }
  
  const { error } = await supabase
    .from('email_logs')
    .update(updates)
    .eq('id', logId);
  
  if (error) {
    console.error('Error updating email status:', error);
    return false;
  }
  
  return true;
}

/**
 * Add email to queue for batch processing
 */
export async function queueEmail(
  emailData: Omit<EmailQueue, 'id' | 'created_at' | 'updated_at' | 'status' | 'retry_count'>
): Promise<EmailQueue | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('email_queue')
    .insert({
      ...emailData,
      status: 'pending',
      retry_count: 0,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error queueing email:', error);
    return null;
  }
  
  return data;
}

/**
 * Get pending emails from queue
 */
export async function getPendingEmails(limit: number = 100): Promise<EmailQueue[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('email_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('scheduled_for', { ascending: true })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching pending emails:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Unsubscribe user from all emails
 */
export async function unsubscribeAll(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('email_preferences')
    .update({
      unsubscribed_all: true,
      unsubscribed_at: new Date().toISOString(),
      welcome_email: false,
      streak_reminders: false,
      weekly_digest: false,
      challenge_notifications: false,
      achievement_notifications: false,
      marketing_emails: false,
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error unsubscribing user:', error);
    return false;
  }
  
  return true;
}

/**
 * Get email analytics for a date range
 */
export async function getEmailAnalytics(
  startDate: string,
  endDate: string
): Promise<{
  email_type: string;
  date: string;
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  open_rate: number;
  click_rate: number;
}[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('email_analytics')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching email analytics:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get user's recent email history
 */
export async function getUserEmailHistory(
  userId: string,
  limit: number = 50
): Promise<EmailLog[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('email_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching email history:', error);
    return [];
  }
  
  return data || [];
}
