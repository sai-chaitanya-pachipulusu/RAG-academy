-- Migration: Add sent_emails tracking table
-- Prevents duplicate email sends to users

CREATE TABLE IF NOT EXISTS sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- e.g., "phase1_7day", "phase1_3day", "phase1_1day"
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one email of each type per user
  UNIQUE(user_id, email_type)
);

-- Add RLS policies
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;

-- Users can't read their own sent emails (admin only)
CREATE POLICY "Only admins can read sent_emails"
  ON sent_emails
  FOR SELECT
  USING (false);

-- Only service role can insert
CREATE POLICY "Service role can insert sent_emails"
  ON sent_emails
  FOR INSERT
  WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_sent_emails_user_id ON sent_emails(user_id);
CREATE INDEX idx_sent_emails_type ON sent_emails(email_type);
CREATE INDEX idx_sent_emails_sent_at ON sent_emails(sent_at);

COMMENT ON TABLE sent_emails IS 'Tracks which emails have been sent to prevent duplicates';
COMMENT ON COLUMN sent_emails.email_type IS 'Email identifier like "phase1_7day" to track countdown emails';
