
-- Create a table for comprehensive challenge submissions (Arena Mode)
create table if not exists public.challenge_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  challenge_slug text not null,
  
  -- Key metrics
  score double precision not null default 0, -- 0-100
  latency_ms double precision,
  
  -- Full metrics blob (e.g. { "docs": 50, "queries": 1 })
  metrics jsonb default '{}'::jsonb,
  
  -- The code that achieved this score
  code_snapshot text,
  
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.challenge_submissions enable row level security;

-- Policies
create policy "Users can insert their own submissions"
  on public.challenge_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own submissions"
  on public.challenge_submissions for select
  using (auth.uid() = user_id);

create policy "Everyone can view top submissions (Leaderboard)"
  on public.challenge_submissions for select
  using (true);
