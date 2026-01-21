-- Migration: Complete subscription system with team support
-- Supports individual Pro ($12/mo) and Team subscriptions (5 seats @ $39/mo)

-- ====================
-- 1. SUBSCRIPTIONS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Owner (person who pays)
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_email TEXT NOT NULL,
  
  -- Subscription details  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'team', 'lifetime')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual', 'lifetime')) DEFAULT 'monthly',
  
  -- Grandfathered pricing (locked-in forever)
  subscribed_phase TEXT NOT NULL CHECK (subscribed_phase IN ('phase1', 'phase2', 'phase3')),
  locked_monthly_price INTEGER NOT NULL, -- Price in cents (e.g., 1200 = $12.00)
  locked_annual_price INTEGER NOT NULL,  -- Price in cents (e.g., 9900 = $99.00)
  
  -- Team-specific
  max_seats INTEGER NOT NULL DEFAULT 1,  -- 1 for pro, 5 for team
  
  -- Lemon Squeezy integration
  lemon_customer_id TEXT UNIQUE,
  lemon_subscription_id TEXT UNIQUE,
  lemon_order_id TEXT,  -- For one-time purchases
  lemon_variant_id TEXT,
  
  -- Subscription period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(owner_id)  -- One subscription per user as owner
);

-- ====================
-- 2. TEAM MEMBERS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Member info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
  
  -- Activity tracking
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(subscription_id, user_id),  -- Can't add same user twice to same team
  UNIQUE(user_id)  -- User can only be in one team (either as owner or member)
);

-- ====================
-- 3. TEAM INVITES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Invite details
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  
  -- Security
  invite_token TEXT UNIQUE NOT NULL,  -- Random token for invite link
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(subscription_id, email),  -- Can't invite same email twice to same team
  CHECK (expires_at > created_at)
);

-- ====================
-- 4. INDEXES
-- ====================
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner_id ON subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_customer_id ON subscriptions(lemon_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_team_members_subscription_id ON team_members(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

CREATE INDEX IF NOT EXISTS idx_team_invites_subscription_id ON team_invites(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_email ON team_invites(email);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);

-- ====================
-- 5. ROW LEVEL SECURITY
-- ====================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can read their own or their team's subscription
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (
    owner_id = auth.uid()
    OR
    id IN (SELECT subscription_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "subscriptions_insert_own"
  ON subscriptions FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  USING (owner_id = auth.uid());

-- Team Members: Members can see their team, owner can manage
CREATE POLICY "team_members_select_own_team"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR 
    subscription_id IN (
      SELECT subscription_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "team_members_owner_insert"
  ON team_members FOR INSERT
  WITH CHECK (
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "team_members_owner_update"
  ON team_members FOR UPDATE
  USING (
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "team_members_owner_delete"
  ON team_members FOR DELETE
  USING (
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    AND role != 'owner'  -- Can't delete the owner
  );

-- Team Invites: Owner can manage, anyone can view their own invite
CREATE POLICY "team_invites_select_own_or_team"
  ON team_invites FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "team_invites_owner_insert"
  ON team_invites FOR INSERT
  WITH CHECK (
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "team_invites_owner_update"
  ON team_invites FOR UPDATE
  USING (
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "team_invites_owner_delete"
  ON team_invites FOR DELETE
  USING (
    subscription_id IN (
      SELECT subscription_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ====================
-- 6. HELPER FUNCTIONS
-- ====================

-- Get user's subscription tier
CREATE OR REPLACE FUNCTION get_user_tier(check_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_tier TEXT;
BEGIN
  -- Check if user owns a subscription
  SELECT tier INTO user_tier
  FROM subscriptions
  WHERE owner_id = check_user_id
    AND status = 'active'
  LIMIT 1;
  
  IF user_tier IS NOT NULL THEN
    RETURN user_tier;
  END IF;
  
  -- Check if user is a team member
  SELECT s.tier INTO user_tier
  FROM team_members tm
  JOIN subscriptions s ON s.id = tm.subscription_id
  WHERE tm.user_id = check_user_id
    AND tm.status = 'active'
    AND s.status = 'active'
  LIMIT 1;
  
  -- Default to free if no subscription found
  RETURN COALESCE(user_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has pro access (either individual or team member)
CREATE OR REPLACE FUNCTION user_has_pro_access(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    -- Individual subscription
    SELECT 1 FROM subscriptions
    WHERE owner_id = check_user_id
      AND tier IN ('pro', 'team', 'lifetime')
      AND status = 'active'
    
    UNION
    
    -- Team membership
    SELECT 1 FROM team_members tm
    JOIN subscriptions s ON s.id = tm.subscription_id
    WHERE tm.user_id = check_user_id
      AND tm.status = 'active'
      AND s.status = 'active'
      AND s.tier IN ('pro', 'team', 'lifetime')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to a challenge
CREATE OR REPLACE FUNCTION has_challenge_access(
  check_user_id UUID,
  challenge_index INTEGER,
  free_challenge_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  has_pro BOOLEAN;
BEGIN
  -- Get pro access status
  has_pro := user_has_pro_access(check_user_id);
  
  -- Pro users have access to all challenges
  IF has_pro THEN
    RETURN TRUE;
  END IF;
  
  -- Free tier users limited by challenge index
  RETURN challenge_index < free_challenge_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get available seats for a team subscription
CREATE OR REPLACE FUNCTION get_available_seats(sub_id UUID)
RETURNS INTEGER AS $$
DECLARE
  max_seats INTEGER;
  used_seats INTEGER;
  pending_invites INTEGER;
BEGIN
  -- Get max seats for subscription
  SELECT s.max_seats INTO max_seats
  FROM subscriptions s
  WHERE s.id = sub_id
    AND s.tier = 'team';
  
  IF max_seats IS NULL THEN
    RETURN 0;  -- Not a team subscription
  END IF;
  
  -- Count active members
  SELECT COUNT(*) INTO used_seats
  FROM team_members
  WHERE subscription_id = sub_id
    AND status = 'active';
  
  -- Count pending invites
  SELECT COUNT(*) INTO pending_invites
  FROM team_invites
  WHERE subscription_id = sub_id
    AND status = 'pending'
    AND expires_at > NOW();
  
  -- Available = max - used - pending
  RETURN max_seats - COALESCE(used_seats, 0) - COALESCE(pending_invites, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team subscription details for a user
CREATE OR REPLACE FUNCTION get_user_team_info(check_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  is_owner BOOLEAN,
  team_size INTEGER,
  max_seats INTEGER,
  available_seats INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tm.subscription_id,
    (tm.role = 'owner') as is_owner,
    (SELECT COUNT(*)::INTEGER FROM team_members WHERE subscription_id = tm.subscription_id AND status = 'active') as team_size,
    s.max_seats,
    get_available_seats(tm.subscription_id) as available_seats
  FROM team_members tm
  JOIN subscriptions s ON s.id = tm.subscription_id
  WHERE tm.user_id = check_user_id
    AND tm.status = 'active'
    AND s.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- 7. TRIGGERS
-- ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatically add owner as first team member when team subscription created
CREATE OR REPLACE FUNCTION auto_add_owner_to_team()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tier = 'team' THEN
    INSERT INTO team_members (subscription_id, user_id, email, role)
    VALUES (NEW.id, NEW.owner_id, NEW.owner_email, 'owner')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_team_owner
  AFTER INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_owner_to_team();

-- ====================
-- COMMENTS
-- ====================
COMMENT ON TABLE subscriptions IS 'Main subscription records with grandfathered pricing';
COMMENT ON TABLE team_members IS 'Individual seats within team subscriptions (max 5 per team)';
COMMENT ON TABLE team_invites IS 'Pending invitations to join team subscriptions';

COMMENT ON COLUMN subscriptions.max_seats IS '1 for pro/lifetime, 5 for team';
COMMENT ON COLUMN subscriptions.locked_monthly_price IS 'Grandfathered price in cents that never changes';
COMMENT ON COLUMN team_members.role IS 'owner = person who pays, member = invited user';
COMMENT ON COLUMN team_invites.invite_token IS 'Secure random token for invite link (e.g., /invite/abc123)';

