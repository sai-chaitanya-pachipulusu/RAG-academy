-- ============================================
-- RAG Academy: Team Management Migration
-- Adds comprehensive team/enterprise features
-- ============================================

-- ============================================
-- 0) Ensure max_seats column exists in subscriptions
-- ============================================
-- Add max_seats column to subscriptions table (required for team features)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS max_seats integer DEFAULT 1;

-- Update existing subscriptions to have reasonable defaults
UPDATE public.subscriptions 
SET max_seats = CASE 
  WHEN tier = 'team' THEN 5 
  ELSE 1 
END 
WHERE max_seats IS NULL;

-- ============================================
-- 1) Create team_members table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Member info
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  
  -- Status
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  
  -- Activity tracking
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz,
  
  -- Constraints
  UNIQUE(subscription_id, user_id),  -- Can't add same user twice
  UNIQUE(user_id)  -- User can only be in one team
);

COMMENT ON TABLE public.team_members IS 'Members of team subscriptions';

-- ============================================
-- 2) Create team_invites table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Invite details
  email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
  
  -- Security
  invite_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  
  -- Constraints
  UNIQUE(subscription_id, email)  -- Can't invite same email twice
);

COMMENT ON TABLE public.team_invites IS 'Pending invitations to join teams';

-- ============================================
-- 3) Create team_activity_log table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Activity details
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,  -- 'member_joined', 'member_removed', 'invite_sent', 'invite_accepted', etc.
  details jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.team_activity_log IS 'Audit log for team activities';

-- ============================================
-- 4) Create team_settings table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL UNIQUE REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Team profile
  team_name text,
  team_logo_url text,
  
  -- Access settings
  allow_member_invites boolean NOT NULL DEFAULT true,
  require_approval_for_joins boolean NOT NULL DEFAULT false,
  
  -- Feature settings
  shared_progress_visible boolean NOT NULL DEFAULT true,
  enable_team_leaderboard boolean NOT NULL DEFAULT true,
  enable_team_challenges boolean NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.team_settings IS 'Team-specific settings and configuration';

-- ============================================
-- 5) Create team_challenges table (for team competitions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Challenge details
  challenge_slug text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  
  -- Status
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  
  -- Scoring
  scoring_type text NOT NULL DEFAULT 'completion_count' CHECK (scoring_type IN ('completion_count', 'total_score', 'average_score', 'fastest_time')),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

COMMENT ON TABLE public.team_challenges IS 'Team-internal challenge competitions';

-- ============================================
-- 6) Create team_challenge_results table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_challenge_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_challenge_id uuid NOT NULL REFERENCES public.team_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Results
  score numeric NOT NULL DEFAULT 0,
  completed_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(team_challenge_id, user_id)
);

COMMENT ON TABLE public.team_challenge_results IS 'Individual results for team challenges';

-- ============================================
-- 7) Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_team_members_subscription ON public.team_members(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);

CREATE INDEX IF NOT EXISTS idx_team_invites_subscription ON public.team_invites(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON public.team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON public.team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires ON public.team_invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_team_activity_subscription ON public.team_activity_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_created ON public.team_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_team_challenges_subscription ON public.team_challenges(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_challenges_status ON public.team_challenges(status);

CREATE INDEX IF NOT EXISTS idx_team_challenge_results_challenge ON public.team_challenge_results(team_challenge_id);
CREATE INDEX IF NOT EXISTS idx_team_challenge_results_user ON public.team_challenge_results(user_id);

-- ============================================
-- 8) Create helper functions
-- ============================================

-- Function to get available seats in a team
CREATE OR REPLACE FUNCTION get_available_seats(sub_id uuid)
RETURNS integer AS $$
DECLARE
  max_seats integer;
  used_seats integer;
  pending_invites integer;
BEGIN
  -- Get max seats for subscription
  SELECT COALESCE(s.max_seats, 1) INTO max_seats
  FROM public.subscriptions s
  WHERE s.id = sub_id;

  -- Count active members
  SELECT COUNT(*) INTO used_seats
  FROM public.team_members
  WHERE subscription_id = sub_id
    AND status = 'active';

  -- Count pending invites
  SELECT COUNT(*) INTO pending_invites
  FROM public.team_invites
  WHERE subscription_id = sub_id
    AND status = 'pending'
    AND expires_at > now();

  -- Available = max - used - pending
  RETURN GREATEST(0, max_seats - used_seats - pending_invites);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in a team
CREATE OR REPLACE FUNCTION user_team_id(check_user_id uuid)
RETURNS uuid AS $$
DECLARE
  team_sub_id uuid;
BEGIN
  SELECT subscription_id INTO team_sub_id
  FROM public.team_members
  WHERE user_id = check_user_id
    AND status = 'active'
  LIMIT 1;
  
  RETURN team_sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has team admin access
CREATE OR REPLACE FUNCTION user_is_team_admin(check_user_id uuid, sub_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.team_members
    WHERE user_id = check_user_id
      AND subscription_id = sub_id
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log team activity
CREATE OR REPLACE FUNCTION log_team_activity(
  sub_id uuid,
  user_id uuid,
  action_type text,
  action_details jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.team_activity_log (subscription_id, user_id, action, details)
  VALUES (sub_id, user_id, action_type, action_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9) Create triggers
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_team_settings_updated_at ON public.team_settings;
CREATE TRIGGER trg_team_settings_updated_at
  BEFORE UPDATE ON public.team_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_team_challenge_results_updated_at ON public.team_challenge_results;
CREATE TRIGGER trg_team_challenge_results_updated_at
  BEFORE UPDATE ON public.team_challenge_results
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-log team member joins
CREATE OR REPLACE FUNCTION log_team_member_join()
RETURNS trigger AS $$
BEGIN
  PERFORM log_team_activity(
    new.subscription_id,
    new.user_id,
    'member_joined',
    jsonb_build_object('role', new.role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_team_member_join_log ON public.team_members;
CREATE TRIGGER trg_team_member_join_log
  AFTER INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION log_team_member_join();

-- ============================================
-- 10) Set up Row Level Security
-- ============================================

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_challenge_results ENABLE ROW LEVEL SECURITY;

-- Team members: Team members can view their team
DROP POLICY IF EXISTS "team_members_select_team" ON public.team_members;
CREATE POLICY "team_members_select_team"
  ON public.team_members FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team members: Admins can manage members
DROP POLICY IF EXISTS "team_members_manage_admin" ON public.team_members;
CREATE POLICY "team_members_manage_admin"
  ON public.team_members FOR ALL
  USING (
    user_is_team_admin(auth.uid(), subscription_id)
  );

-- Team invites: Team members can view invites for their team
DROP POLICY IF EXISTS "team_invites_select_team" ON public.team_invites;
CREATE POLICY "team_invites_select_team"
  ON public.team_invites FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team invites: Admins can manage invites
DROP POLICY IF EXISTS "team_invites_manage_admin" ON public.team_invites;
CREATE POLICY "team_invites_manage_admin"
  ON public.team_invites FOR ALL
  USING (
    user_is_team_admin(auth.uid(), subscription_id)
  );

-- Team activity: Team members can view their team's activity
DROP POLICY IF EXISTS "team_activity_select_team" ON public.team_activity_log;
CREATE POLICY "team_activity_select_team"
  ON public.team_activity_log FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team settings: Team members can view settings
DROP POLICY IF EXISTS "team_settings_select_team" ON public.team_settings;
CREATE POLICY "team_settings_select_team"
  ON public.team_settings FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team settings: Admins can update settings
DROP POLICY IF EXISTS "team_settings_update_admin" ON public.team_settings;
CREATE POLICY "team_settings_update_admin"
  ON public.team_settings FOR UPDATE
  USING (
    user_is_team_admin(auth.uid(), subscription_id)
  );

-- Team challenges: Team members can view challenges
DROP POLICY IF EXISTS "team_challenges_select_team" ON public.team_challenges;
CREATE POLICY "team_challenges_select_team"
  ON public.team_challenges FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Team challenges: Admins can manage challenges
DROP POLICY IF EXISTS "team_challenges_manage_admin" ON public.team_challenges;
CREATE POLICY "team_challenges_manage_admin"
  ON public.team_challenges FOR ALL
  USING (
    user_is_team_admin(auth.uid(), subscription_id)
  );

-- Team challenge results: Team members can view results
DROP POLICY IF EXISTS "team_challenge_results_select_team" ON public.team_challenge_results;
CREATE POLICY "team_challenge_results_select_team"
  ON public.team_challenge_results FOR SELECT
  USING (
    team_challenge_id IN (
      SELECT tc.id FROM public.team_challenges tc
      JOIN public.team_members tm ON tc.subscription_id = tm.subscription_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Team challenge results: Users can manage their own results
DROP POLICY IF EXISTS "team_challenge_results_manage_own" ON public.team_challenge_results;
CREATE POLICY "team_challenge_results_manage_own"
  ON public.team_challenge_results FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- 11) Create views for easier querying
-- ============================================

-- View: Team overview with member counts
CREATE OR REPLACE VIEW public.team_overview AS
SELECT 
  s.id as subscription_id,
  s.tier,
  s.status as subscription_status,
  s.max_seats,
  get_available_seats(s.id) as available_seats,
  COUNT(DISTINCT tm.user_id) FILTER (WHERE tm.status = 'active') as active_members,
  COUNT(DISTINCT ti.id) FILTER (WHERE ti.status = 'pending' AND ti.expires_at > now()) as pending_invites,
  ts.team_name,
  ts.enable_team_leaderboard,
  ts.enable_team_challenges
FROM public.subscriptions s
LEFT JOIN public.team_members tm ON s.id = tm.subscription_id
LEFT JOIN public.team_invites ti ON s.id = ti.subscription_id
LEFT JOIN public.team_settings ts ON s.id = ts.subscription_id
WHERE s.tier = 'team'
GROUP BY s.id, ts.team_name, ts.enable_team_leaderboard, ts.enable_team_challenges;

-- View: Team member details
CREATE OR REPLACE VIEW public.team_member_details AS
SELECT 
  tm.*,
  p.username,
  p.avatar_url,
  p.xp,
  s.team_name
FROM public.team_members tm
JOIN public.profiles p ON tm.user_id = p.id
LEFT JOIN public.team_settings s ON tm.subscription_id = s.subscription_id;

COMMENT ON VIEW public.team_overview IS 'Overview of team subscriptions with member counts';
COMMENT ON VIEW public.team_member_details IS 'Detailed information about team members';
