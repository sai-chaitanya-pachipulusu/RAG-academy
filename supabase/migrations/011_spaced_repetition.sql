-- RAG Academy: Spaced Repetition System Migration
-- Implements SuperMemo-2 algorithm for optimal review scheduling
-- Run this in Supabase SQL Editor

-- ============================================
-- 1) Create srs_items table for spaced repetition items
-- ============================================
CREATE TABLE IF NOT EXISTS public.srs_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  
  -- SuperMemo-2 parameters
  ease_factor double precision NOT NULL DEFAULT 2.5,
  interval integer NOT NULL DEFAULT 0, -- Days until next review
  repetitions integer NOT NULL DEFAULT 0, -- Number of successful reviews
  
  -- Timing
  last_reviewed_at timestamptz,
  next_review_at timestamptz NOT NULL DEFAULT now(),
  
  -- Challenge-specific
  difficulty_rating text CHECK (difficulty_rating IN ('again', 'hard', 'good', 'easy')),
  
  -- Stats
  total_reviews integer NOT NULL DEFAULT 0,
  correct_reviews integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0, -- Consecutive correct reviews
  lapse_count integer NOT NULL DEFAULT 0, -- Number of times "again" was pressed
  
  -- Leech detection
  is_leech boolean NOT NULL DEFAULT false,
  leech_detected_at timestamptz,
  
  -- Status
  status text NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'review', 'suspended')),
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user/challenge
  CONSTRAINT unique_user_challenge_srs UNIQUE (user_id, challenge_slug)
);

COMMENT ON TABLE public.srs_items IS 'Spaced repetition items using SuperMemo-2 algorithm';
COMMENT ON COLUMN public.srs_items.ease_factor IS 'EF factor in SM-2, starts at 2.5, min 1.3';
COMMENT ON COLUMN public.srs_items.interval IS 'Days until next review (0 = learning phase)';
COMMENT ON COLUMN public.srs_items.status IS 'learning: < 1 day interval, review: >= 1 day, suspended: paused';

-- ============================================
-- 2) Create srs_reviews table for review history
-- ============================================
CREATE TABLE IF NOT EXISTS public.srs_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  srs_item_id uuid NOT NULL REFERENCES public.srs_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_slug text NOT NULL,
  
  -- Review data
  rating text NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  previous_ease_factor double precision NOT NULL,
  new_ease_factor double precision NOT NULL,
  previous_interval integer NOT NULL,
  new_interval integer NOT NULL,
  
  -- Timing
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  time_spent_seconds integer,
  
  -- Performance
  code_submitted boolean NOT NULL DEFAULT false,
  tests_passed boolean NOT NULL DEFAULT false,
  
  -- Context
  device_type text,
  
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.srs_reviews IS 'History of all SRS reviews';

-- ============================================
-- 3) Create srs_preferences table for user settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.srs_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Daily limits
  max_new_per_day integer NOT NULL DEFAULT 10,
  max_reviews_per_day integer NOT NULL DEFAULT 50,
  
  -- Learning phase settings
  learning_steps integer[] NOT NULL DEFAULT ARRAY[1, 10], -- Minutes
  graduating_interval integer NOT NULL DEFAULT 1, -- Days
  
  -- Review settings
  easy_bonus double precision NOT NULL DEFAULT 1.3,
  interval_modifier double precision NOT NULL DEFAULT 1.0,
  
  -- Lapse settings
  lapse_steps integer[] NOT NULL DEFAULT ARRAY[1, 10],
  leech_threshold integer NOT NULL DEFAULT 8,
  leech_action text NOT NULL DEFAULT 'tag' CHECK (leech_action IN ('tag', 'suspend', 'reset')),
  
  -- Timing
  new_day_starts_at integer NOT NULL DEFAULT 4, -- Hour of day (0-23)
  timezone text NOT NULL DEFAULT 'America/New_York',
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user
  CONSTRAINT unique_user_srs_prefs UNIQUE (user_id)
);

COMMENT ON TABLE public.srs_preferences IS 'User preferences for spaced repetition';

-- ============================================
-- 4) Create srs_stats table for aggregated statistics
-- ============================================
CREATE TABLE IF NOT EXISTS public.srs_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  
  -- Daily counts
  new_learned integer NOT NULL DEFAULT 0,
  reviews_completed integer NOT NULL DEFAULT 0,
  correct_reviews integer NOT NULL DEFAULT 0,
  
  -- Time tracking
  total_time_seconds integer NOT NULL DEFAULT 0,
  
  -- Current state
  total_items integer NOT NULL DEFAULT 0,
  due_items integer NOT NULL DEFAULT 0,
  learning_items integer NOT NULL DEFAULT 0,
  review_items integer NOT NULL DEFAULT 0,
  
  -- Retention
  retention_rate double precision,
  average_ease_factor double precision,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Unique constraint per user/date
  CONSTRAINT unique_user_date_srs_stats UNIQUE (user_id, date)
);

COMMENT ON TABLE public.srs_stats IS 'Daily aggregated SRS statistics';

-- ============================================
-- 5) Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_srs_items_user ON public.srs_items(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_items_next_review ON public.srs_items(next_review_at);
CREATE INDEX IF NOT EXISTS idx_srs_items_user_next_review ON public.srs_items(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_srs_items_status ON public.srs_items(status);
CREATE INDEX IF NOT EXISTS idx_srs_items_leech ON public.srs_items(is_leech) WHERE is_leech = true;

CREATE INDEX IF NOT EXISTS idx_srs_reviews_item ON public.srs_reviews(srs_item_id);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_user ON public.srs_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_reviewed ON public.srs_reviews(reviewed_at);

CREATE INDEX IF NOT EXISTS idx_srs_stats_user ON public.srs_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_srs_stats_date ON public.srs_stats(date);

-- ============================================
-- 6) Create function to get due items
-- ============================================
CREATE OR REPLACE FUNCTION public.get_srs_due_items(p_user_id uuid)
RETURNS TABLE (
  item_id uuid,
  item_challenge_slug text,
  item_ease_factor double precision,
  item_interval integer,
  item_repetitions integer,
  item_next_review_at timestamptz,
  item_status text,
  item_is_leech boolean,
  item_days_overdue integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id as item_id,
    si.challenge_slug as item_challenge_slug,
    si.ease_factor as item_ease_factor,
    si.interval as item_interval,
    si.repetitions as item_repetitions,
    si.next_review_at as item_next_review_at,
    si.status as item_status,
    si.is_leech as item_is_leech,
    GREATEST(0, EXTRACT(DAY FROM (now() - si.next_review_at))::integer) as item_days_overdue
  FROM public.srs_items si
  WHERE si.user_id = p_user_id
    AND si.status != 'suspended'
    AND si.next_review_at <= now()
  ORDER BY 
    CASE WHEN si.interval < 1 THEN 0 ELSE 1 END, -- Learning items first
    si.next_review_at ASC;
END;
$$;

COMMENT ON FUNCTION public.get_srs_due_items IS 'Get all SRS items due for review for a user';

-- ============================================
-- 7) Create function to update SRS item after review
-- ============================================
CREATE OR REPLACE FUNCTION public.process_srs_review(
  p_srs_item_id uuid,
  p_rating text,
  p_time_spent_seconds integer DEFAULT NULL,
  p_code_submitted boolean DEFAULT false,
  p_tests_passed boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item public.srs_items%ROWTYPE;
  v_prefs public.srs_preferences%ROWTYPE;
  v_new_ease_factor double precision;
  v_new_interval integer;
  v_new_repetitions integer;
  v_is_leech boolean := false;
  v_status text;
BEGIN
  -- Get item and preferences
  SELECT * INTO v_item FROM public.srs_items WHERE id = p_srs_item_id;
  SELECT * INTO v_prefs FROM public.srs_preferences WHERE user_id = v_item.user_id;
  
  -- Use defaults if no preferences
  IF v_prefs IS NULL THEN
    v_prefs.max_new_per_day := 10;
    v_prefs.max_reviews_per_day := 50;
    v_prefs.graduating_interval := 1;
    v_prefs.easy_bonus := 1.3;
    v_prefs.interval_modifier := 1.0;
    v_prefs.leech_threshold := 8;
    v_prefs.learning_steps := ARRAY[1, 10];
  END IF;
  
  -- Calculate new values based on SM-2 algorithm
  v_new_ease_factor := v_item.ease_factor;
  v_new_repetitions := v_item.repetitions;
  
  CASE p_rating
    WHEN 'again' THEN
      v_new_repetitions := 0;
      v_new_interval := 0;
      v_new_ease_factor := GREATEST(1.3, v_item.ease_factor - 0.2);
      v_item.lapse_count := v_item.lapse_count + 1;
      
      -- Check for leech
      IF v_item.lapse_count >= v_prefs.leech_threshold THEN
        v_is_leech := true;
      END IF;
    
    WHEN 'hard' THEN
      v_new_repetitions := v_item.repetitions + 1;
      IF v_item.repetitions = 0 THEN
        v_new_interval := v_prefs.graduating_interval;
      ELSE
        v_new_interval := round(v_item.interval * 1.2);
      END IF;
      v_new_ease_factor := GREATEST(1.3, v_item.ease_factor - 0.15);
    
    WHEN 'good' THEN
      v_new_repetitions := v_item.repetitions + 1;
      IF v_item.repetitions = 0 THEN
        v_new_interval := v_prefs.graduating_interval;
      ELSIF v_item.repetitions = 1 THEN
        v_new_interval := 6;
      ELSE
        v_new_interval := round(v_item.interval * v_item.ease_factor);
      END IF;
    
    WHEN 'easy' THEN
      v_new_repetitions := v_item.repetitions + 1;
      IF v_item.repetitions = 0 THEN
        v_new_interval := round(v_prefs.graduating_interval * v_prefs.easy_bonus);
      ELSIF v_item.repetitions = 1 THEN
        v_new_interval := round(6 * v_prefs.easy_bonus);
      ELSE
        v_new_interval := round(v_item.interval * v_item.ease_factor * v_prefs.easy_bonus);
      END IF;
      v_new_ease_factor := v_item.ease_factor + 0.15;
  END CASE;
  
  -- Apply interval modifier
  v_new_interval := round(v_new_interval * v_prefs.interval_modifier);
  IF v_new_interval < 1 AND v_new_repetitions > 0 THEN
    v_new_interval := 1;
  END IF;
  
  -- Determine status
  IF v_new_interval >= 1 THEN
    v_status := 'review';
  ELSE
    v_status := 'learning';
  END IF;
  
  -- Update item
  UPDATE public.srs_items
  SET
    ease_factor = round(v_new_ease_factor * 100) / 100,
    interval = v_new_interval,
    repetitions = v_new_repetitions,
    last_reviewed_at = now(),
    next_review_at = CASE 
      WHEN v_new_interval = 0 THEN now() + (v_prefs.learning_steps[1] || ' minutes')::interval
      ELSE now() + (v_new_interval || ' days')::interval
    END,
    difficulty_rating = p_rating,
    total_reviews = total_reviews + 1,
    correct_reviews = CASE WHEN p_rating = 'again' THEN correct_reviews ELSE correct_reviews + 1 END,
    streak = CASE WHEN p_rating = 'again' THEN 0 ELSE streak + 1 END,
    lapse_count = v_item.lapse_count,
    is_leech = v_is_leech,
    leech_detected_at = CASE WHEN v_is_leech AND NOT v_item.is_leech THEN now() ELSE leech_detected_at END,
    status = v_status,
    updated_at = now()
  WHERE id = p_srs_item_id;
  
  -- Record review
  INSERT INTO public.srs_reviews (
    srs_item_id, user_id, challenge_slug, rating,
    previous_ease_factor, new_ease_factor,
    previous_interval, new_interval,
    time_spent_seconds, code_submitted, tests_passed
  ) VALUES (
    p_srs_item_id, v_item.user_id, v_item.challenge_slug, p_rating,
    v_item.ease_factor, round(v_new_ease_factor * 100) / 100,
    v_item.interval, v_new_interval,
    p_time_spent_seconds, p_code_submitted, p_tests_passed
  );
  
  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'new_interval', v_new_interval,
    'new_ease_factor', round(v_new_ease_factor * 100) / 100,
    'next_review', CASE 
      WHEN v_new_interval = 0 THEN now() + (v_prefs.learning_steps[1] || ' minutes')::interval
      ELSE now() + (v_new_interval || ' days')::interval
    END,
    'is_leech', v_is_leech,
    'status', v_status
  );
END;
$$;

COMMENT ON FUNCTION public.process_srs_review IS 'Process an SRS review and update the item';

-- ============================================
-- 8) Create function to add challenge to SRS
-- ============================================
CREATE OR REPLACE FUNCTION public.add_to_srs(
  p_user_id uuid,
  p_challenge_slug text,
  p_initial_rating text DEFAULT 'good'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item_id uuid;
  v_prefs public.srs_preferences%ROWTYPE;
  v_initial_interval integer := 0;
  v_initial_ease_factor double precision := 2.5;
  v_next_review timestamptz;
BEGIN
  -- Get preferences
  SELECT * INTO v_prefs FROM public.srs_preferences WHERE user_id = p_user_id;
  
  -- Use defaults if no preferences
  IF v_prefs IS NULL THEN
    v_prefs.graduating_interval := 1;
    v_prefs.easy_bonus := 1.3;
    v_prefs.learning_steps := ARRAY[1, 10];
  END IF;
  
  -- Set initial values based on rating
  CASE p_initial_rating
    WHEN 'again' THEN
      v_initial_ease_factor := 2.3;
    WHEN 'hard' THEN
      v_initial_ease_factor := 2.4;
    WHEN 'good' THEN
      v_initial_ease_factor := 2.5;
    WHEN 'easy' THEN
      v_initial_interval := v_prefs.graduating_interval;
      v_initial_ease_factor := 2.65;
  END CASE;
  
  -- Calculate next review
  IF v_initial_interval = 0 THEN
    v_next_review := now() + (v_prefs.learning_steps[1] || ' minutes')::interval;
  ELSE
    v_next_review := now() + (v_initial_interval || ' days')::interval;
  END IF;
  
  -- Insert or update item
  INSERT INTO public.srs_items (
    user_id, challenge_slug, ease_factor, interval, repetitions,
    next_review_at, difficulty_rating, status
  ) VALUES (
    p_user_id, p_challenge_slug, v_initial_ease_factor, v_initial_interval,
    CASE WHEN p_initial_rating = 'again' THEN 0 ELSE 1 END,
    v_next_review, p_initial_rating,
    CASE WHEN v_initial_interval >= 1 THEN 'review' ELSE 'learning' END
  )
  ON CONFLICT (user_id, challenge_slug) 
  DO UPDATE SET
    ease_factor = EXCLUDED.ease_factor,
    interval = EXCLUDED.interval,
    repetitions = EXCLUDED.repetitions,
    next_review_at = EXCLUDED.next_review_at,
    difficulty_rating = EXCLUDED.difficulty_rating,
    status = EXCLUDED.status,
    updated_at = now()
  RETURNING id INTO v_item_id;
  
  RETURN v_item_id;
END;
$$;

COMMENT ON FUNCTION public.add_to_srs IS 'Add a challenge to the SRS system';

-- ============================================
-- 9) Create function to get SRS stats
-- ============================================
CREATE OR REPLACE FUNCTION public.get_srs_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_items integer;
  v_due_today integer;
  v_learning_items integer;
  v_review_items integer;
  v_leech_items integer;
  v_avg_ease_factor double precision;
  v_retention_rate double precision;
BEGIN
  -- Total items
  SELECT COUNT(*) INTO v_total_items
  FROM public.srs_items
  WHERE user_id = p_user_id;
  
  -- Due today
  SELECT COUNT(*) INTO v_due_today
  FROM public.srs_items
  WHERE user_id = p_user_id
    AND status != 'suspended'
    AND next_review_at <= now();
  
  -- Learning items
  SELECT COUNT(*) INTO v_learning_items
  FROM public.srs_items
  WHERE user_id = p_user_id
    AND status = 'learning';
  
  -- Review items
  SELECT COUNT(*) INTO v_review_items
  FROM public.srs_items
  WHERE user_id = p_user_id
    AND status = 'review';
  
  -- Leech items
  SELECT COUNT(*) INTO v_leech_items
  FROM public.srs_items
  WHERE user_id = p_user_id
    AND is_leech = true;
  
  -- Average ease factor
  SELECT COALESCE(AVG(ease_factor), 2.5) INTO v_avg_ease_factor
  FROM public.srs_items
  WHERE user_id = p_user_id;
  
  -- Retention rate
  SELECT COALESCE(
    ROUND((SUM(correct_reviews)::double precision / NULLIF(SUM(total_reviews), 0)) * 100, 1),
    0
  ) INTO v_retention_rate
  FROM public.srs_items
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'total_items', v_total_items,
    'due_today', v_due_today,
    'learning_items', v_learning_items,
    'review_items', v_review_items,
    'leech_items', v_leech_items,
    'average_ease_factor', round(v_avg_ease_factor * 100) / 100,
    'retention_rate', v_retention_rate
  );
END;
$$;

COMMENT ON FUNCTION public.get_srs_stats IS 'Get SRS statistics for a user';

-- ============================================
-- 10) Enable RLS
-- ============================================
ALTER TABLE public.srs_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11) Create RLS policies
-- ============================================
CREATE POLICY "Users can view own SRS items"
  ON public.srs_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SRS items"
  ON public.srs_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SRS items"
  ON public.srs_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own SRS items"
  ON public.srs_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own SRS reviews"
  ON public.srs_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own SRS preferences"
  ON public.srs_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SRS preferences"
  ON public.srs_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SRS preferences"
  ON public.srs_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own SRS stats"
  ON public.srs_stats FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 12) Create trigger to update daily stats
-- ============================================
CREATE OR REPLACE FUNCTION public.update_srs_daily_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_existing public.srs_stats%ROWTYPE;
BEGIN
  -- Check if stats exist for today
  SELECT * INTO v_existing
  FROM public.srs_stats
  WHERE user_id = NEW.user_id AND date = v_today;
  
  IF v_existing IS NULL THEN
    -- Create new stats entry
    INSERT INTO public.srs_stats (
      user_id, date, reviews_completed, correct_reviews,
      total_time_seconds
    ) VALUES (
      NEW.user_id, v_today, 1,
      CASE WHEN NEW.rating != 'again' THEN 1 ELSE 0 END,
      COALESCE(NEW.time_spent_seconds, 0)
    );
  ELSE
    -- Update existing stats
    UPDATE public.srs_stats
    SET
      reviews_completed = reviews_completed + 1,
      correct_reviews = correct_reviews + CASE WHEN NEW.rating != 'again' THEN 1 ELSE 0 END,
      total_time_seconds = total_time_seconds + COALESCE(NEW.time_spent_seconds, 0),
      updated_at = now()
    WHERE user_id = NEW.user_id AND date = v_today;
  END IF;
  
  RETURN NEW;
END;
$$;