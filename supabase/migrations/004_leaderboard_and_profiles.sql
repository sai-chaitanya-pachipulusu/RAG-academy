-- ===========================================
-- Leaderboard and User Profiles Enhancement
-- ===========================================
-- This migration ensures proper tables for dynamic leaderboard

-- 1. Ensure profiles table has all required columns
DO $$
BEGIN
    -- Add username if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username TEXT;
    END IF;

    -- Add avatar_url if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- Add xp if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'xp') THEN
        ALTER TABLE profiles ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;

    -- Add streak_days if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'streak_days') THEN
        ALTER TABLE profiles ADD COLUMN streak_days INTEGER DEFAULT 0;
    END IF;

    -- Add last_activity_date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'last_activity_date') THEN
        ALTER TABLE profiles ADD COLUMN last_activity_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add created_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Create index for leaderboard queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(streak_days DESC);

-- 3. Ensure challenge_progress table exists
CREATE TABLE IF NOT EXISTS challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_slug TEXT NOT NULL,
    status TEXT DEFAULT 'started' CHECK (status IN ('started', 'attempted', 'completed')),
    attempts INTEGER DEFAULT 0,
    best_score REAL,
    code TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_slug)
);

-- 4. Create indexes for challenge_progress
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_status ON challenge_progress(status);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_slug ON challenge_progress(challenge_slug);

-- 5. Create leaderboard_cache table for faster queries
CREATE TABLE IF NOT EXISTS leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT,
    xp INTEGER DEFAULT 0,
    challenges_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    rank_all_time INTEGER,
    rank_weekly INTEGER,
    rank_monthly INTEGER,
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_rank ON leaderboard_cache(rank_all_time);

-- 6. Create function to update leaderboard cache
CREATE OR REPLACE FUNCTION update_leaderboard_cache()
RETURNS VOID AS $$
BEGIN
    -- Truncate and rebuild cache
    TRUNCATE leaderboard_cache;
    
    INSERT INTO leaderboard_cache (user_id, username, xp, challenges_completed, streak_days)
    SELECT 
        p.id,
        p.username,
        COALESCE(p.xp, 0),
        COALESCE((SELECT COUNT(*) FROM challenge_progress cp 
                  WHERE cp.user_id = p.id AND cp.status = 'completed'), 0),
        COALESCE(p.streak_days, 0)
    FROM profiles p;
    
    -- Update all-time ranks
    UPDATE leaderboard_cache lc
    SET rank_all_time = ranked.rank
    FROM (
        SELECT user_id, ROW_NUMBER() OVER (ORDER BY xp DESC, challenges_completed DESC) as rank
        FROM leaderboard_cache
    ) ranked
    WHERE lc.user_id = ranked.user_id;
    
    -- Update weekly ranks (only users active in last 7 days)
    UPDATE leaderboard_cache lc
    SET rank_weekly = ranked.rank
    FROM (
        SELECT lc2.user_id, ROW_NUMBER() OVER (ORDER BY lc2.xp DESC) as rank
        FROM leaderboard_cache lc2
        JOIN profiles p ON p.id = lc2.user_id
        WHERE p.last_activity_date > NOW() - INTERVAL '7 days'
    ) ranked
    WHERE lc.user_id = ranked.user_id;
    
    -- Update monthly ranks
    UPDATE leaderboard_cache lc
    SET rank_monthly = ranked.rank
    FROM (
        SELECT lc2.user_id, ROW_NUMBER() OVER (ORDER BY lc2.xp DESC) as rank
        FROM leaderboard_cache lc2
        JOIN profiles p ON p.id = lc2.user_id
        WHERE p.last_activity_date > NOW() - INTERVAL '30 days'
    ) ranked
    WHERE lc.user_id = ranked.user_id;
    
    -- Update timestamp
    UPDATE leaderboard_cache SET last_computed_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to update profile on challenge completion
CREATE OR REPLACE FUNCTION on_challenge_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD IS NULL OR OLD.status != 'completed') THEN
        -- Update last activity
        UPDATE profiles 
        SET last_activity_date = NOW()
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_challenge_completed ON challenge_progress;
CREATE TRIGGER trigger_challenge_completed
    AFTER INSERT OR UPDATE ON challenge_progress
    FOR EACH ROW
    EXECUTE FUNCTION on_challenge_completed();

-- 8. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. RLS Policies for challenge_progress
DROP POLICY IF EXISTS "Challenge progress viewable by owner" ON challenge_progress;
CREATE POLICY "Challenge progress viewable by owner" ON challenge_progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenge progress" ON challenge_progress;
CREATE POLICY "Users can insert own challenge progress" ON challenge_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge progress" ON challenge_progress;
CREATE POLICY "Users can update own challenge progress" ON challenge_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- 11. RLS Policies for leaderboard_cache (public read)
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON leaderboard_cache;
CREATE POLICY "Leaderboard is viewable by everyone" ON leaderboard_cache
    FOR SELECT USING (true);

-- 12. Enable realtime for profiles (for live leaderboard)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- 13. Initial cache population (run manually or via cron)
-- SELECT update_leaderboard_cache();

COMMENT ON TABLE leaderboard_cache IS 'Cached leaderboard data for fast queries. Rebuild with update_leaderboard_cache()';
