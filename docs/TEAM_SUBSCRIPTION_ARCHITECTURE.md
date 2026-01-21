# Team Subscription Architecture

## Overview

A Team subscription allows **1 owner** to purchase 5 seats and invite **4 team members** to join.

---

## Database Schema Design

### Tables Needed:

1. **subscriptions** - Main subscription payment record
2. **team_members** - Individual seats/users in a team
3. **team_invites** - Pending invitations to join a team
4. **sent_emails** - Email tracking (already created)

---

## Entity Relationship

```
subscriptions (1) ──< team_members (5 max)
       │
       └──< team_invites (pending)
```

### Example Flow:

```
1. Alice buys Team subscription ($39/mo)
   └─ Creates: subscription record (owner_id = Alice)

2. Alice is automatically added as first team member
   └─ Creates: team_member record (user_id = Alice, role = "owner")

3. Alice invites Bob, Carol, Dave, Eve
   └─ Creates: 4 team_invite records

4. Bob accepts invite
   └─ Creates: team_member record (user_id = Bob, role = "member")
   └─ Deletes: team_invite for Bob

5. Subscription now has:
   - 2 active seats (Alice, Bob)
   - 3 pending invites (Carol, Dave, Eve)
   - 0 available seats (5 max - 2 active - 3 pending)
```

---

## Detailed Table Schemas

### 1. subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,

  -- Owner info
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  owner_email TEXT NOT NULL,

  -- Subscription details
  tier TEXT NOT NULL,  -- 'pro' | 'team' | 'lifetime'
  status TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,

  -- Grandfathered pricing
  subscribed_phase TEXT NOT NULL,
  locked_monthly_price INTEGER NOT NULL,
  locked_annual_price INTEGER NOT NULL,

  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  -- Team-specific
  max_seats INTEGER DEFAULT 1,  -- 1 for pro, 5 for team

  -- Dates
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. team_members

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Member info
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'owner' | 'member'

  -- Status
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'suspended'

  -- Dates
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(subscription_id, user_id),  -- Can't add same user twice
  UNIQUE(user_id)  -- User can only be in one team
);
```

### 3. team_invites

```sql
CREATE TABLE team_invites (
  id UUID PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Invite details
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'accepted' | 'declined' | 'expired'

  -- Security
  invite_token TEXT UNIQUE NOT NULL,  -- Random token for invite link
  expires_at TIMESTAMPTZ NOT NULL,

  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(subscription_id, email)  -- Can't invite same email twice
);
```

---

## Key Constraints & Business Logic

### Seat Management:

```sql
-- Function to check available seats
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
  WHERE s.id = sub_id;

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
  RETURN max_seats - used_seats - pending_invites;
END;
$$ LANGUAGE plpgsql;
```

### User Access Check:

```sql
-- Function to check if user has pro access
CREATE OR REPLACE FUNCTION user_has_pro_access(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Check if user has individual subscription OR is team member
  SELECT EXISTS(
    -- Individual subscription
    SELECT 1 FROM subscriptions
    WHERE owner_id = check_user_id
      AND tier IN ('pro', 'lifetime')
      AND status = 'active'

    UNION

    -- Team membership
    SELECT 1 FROM team_members tm
    JOIN subscriptions s ON s.id = tm.subscription_id
    WHERE tm.user_id = check_user_id
      AND tm.status = 'active'
      AND s.status = 'active'
  ) INTO has_access;

  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Typical Workflows

### 1. User Buys Team Subscription

```typescript
// Stripe webhook: checkout.session.completed
async function handleTeamCheckout(session) {
  // 1. Create subscription record
  const subscription = await supabase.from('subscriptions').insert({
    owner_id: userId,
    owner_email: userEmail,
    tier: 'team',
    max_seats: 5,
    ...
  });

  // 2. Add owner as first team member
  await supabase.from('team_members').insert({
    subscription_id: subscription.id,
    user_id: userId,
    email: userEmail,
    role: 'owner',
  });
}
```

### 2. Owner Invites Team Member

```typescript
async function inviteTeamMember(subscriptionId, email) {
  // 1. Check available seats
  const available = await getAvailableSeats(subscriptionId);
  if (available < 1) throw new Error("No seats available");

  // 2. Create invite
  const token = generateSecureToken();
  await supabase.from("team_invites").insert({
    subscription_id: subscriptionId,
    email,
    invited_by: ownerId,
    invite_token: token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // 3. Send email
  await sendTeamInviteEmail(email, token);
}
```

### 3. User Accepts Invite

```typescript
async function acceptInvite(token, userId) {
  // 1. Verify invite
  const invite = await supabase
    .from("team_invites")
    .select("*, subscriptions(*)")
    .eq("invite_token", token)
    .eq("status", "pending")
    .single();

  if (!invite || invite.expires_at < new Date()) {
    throw new Error("Invalid or expired invite");
  }

  // 2. Add as team member
  await supabase.from("team_members").insert({
    subscription_id: invite.subscription_id,
    user_id: userId,
    email: invite.email,
    role: "member",
  });

  // 3. Mark invite as accepted
  await supabase
    .from("team_invites")
    .update({ status: "accepted", accepted_at: new Date() })
    .eq("id", invite.id);
}
```

### 4. Owner Removes Team Member

```typescript
async function removeTeamMember(subscriptionId, memberId) {
  // Only owner can remove
  await supabase
    .from("team_members")
    .delete()
    .eq("subscription_id", subscriptionId)
    .eq("id", memberId)
    .neq("role", "owner"); // Can't remove owner
}
```

---

## Row-Level Security (RLS)

### team_members Policies:

```sql
-- Members can see their own team
CREATE POLICY "team_members_select_own_team"
  ON team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    subscription_id IN (
      SELECT subscription_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Only owner can insert/update/delete
CREATE POLICY "team_members_owner_manage"
  ON team_members FOR ALL
  USING (
    subscription_id IN (
      SELECT subscription_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
```

### team_invites Policies:

```sql
-- Owner can manage invites
CREATE POLICY "team_invites_owner_manage"
  ON team_invites FOR ALL
  USING (
    subscription_id IN (
      SELECT subscription_id FROM team_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Anyone can view their own invite
CREATE POLICY "team_invites_select_own"
  ON team_invites FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

---

## UI Components Needed

### 1. Team Dashboard (for owner)

```
┌─────────────────────────────────────┐
│ Team Management                     │
├─────────────────────────────────────┤
│ 5 Seats • 2 Active • 2 Pending      │
│                                     │
│ Active Members:                     │
│ ✓ alice@company.com (Owner)        │
│ ✓ bob@company.com                  │  [Remove]
│                                     │
│ Pending Invites:                    │
│ ⏳ carol@company.com (Expires in 5d)│  [Resend] [Cancel]
│ ⏳ dave@company.com (Expires in 6d) │  [Resend] [Cancel]
│                                     │
│ Available Seats: 1                  │
│ [+ Invite Team Member]              │
└─────────────────────────────────────┘
```

### 2. Invite Acceptance Page

```
┌─────────────────────────────────────┐
│ You're Invited!                     │
├─────────────────────────────────────┤
│ alice@company.com has invited you   │
│ to join their RAG Academy Team      │
│                                     │
│ Benefits:                           │
│ • Access to all 185+ challenges     │
│ • Progress tracking                 │
│ • Priority support                  │
│                                     │
│ [Accept Invitation]  [Decline]      │
└─────────────────────────────────────┘
```

---

## Cost Breakdown

### Team vs Individual:

```
Individual Pro: $12/mo per person
Team (5 seats): $39/mo total

Cost per seat:
- Team: $39/5 = $7.80 per person
- Savings: $12 - $7.80 = $4.20 per person (35% discount)

Incentive for companies:
- 5 engineers × $12 = $60/mo
- Team plan = $39/mo
- Savings = $21/mo (35% off)
```

---

## Stripe Integration

### Team Subscription Metadata:

```json
{
  "tier": "team",
  "max_seats": 5,
  "phase": "phase1",
  "quantity": 1 // Note: 1 subscription = 5 seats
}
```

### Important:

- Don't use Stripe's quantity field for seats!
- Stripe quantity = number of subscriptions (always 1)
- Manage seats in your database
- Stripe sees it as 1 subscription at $39/mo

---

This architecture supports:
✅ 5 seats per team subscription
✅ Invite management
✅ Seat availability tracking
✅ Graceful subscription cancellation
✅ Team member removal
✅ Proper access control
