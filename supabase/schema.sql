-- RAGacademy: minimal schema for profiles + challenge progress syncing.
-- Run this in Supabase SQL Editor.

-- 1) Profiles: 1 row per user (auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Challenge progress: per-user per-challenge
create table if not exists public.challenge_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_slug text not null,
  status text not null check (status in ('not_started', 'in_progress', 'completed')),
  attempts integer not null default 0,
  user_code text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, challenge_slug)
);

create index if not exists idx_challenge_progress_user
  on public.challenge_progress(user_id);

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_challenge_progress_updated_at on public.challenge_progress;
create trigger trg_challenge_progress_updated_at
before update on public.challenge_progress
for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.challenge_progress enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Challenge progress policies
drop policy if exists "challenge_progress_select_own" on public.challenge_progress;
create policy "challenge_progress_select_own"
on public.challenge_progress for select
using (auth.uid() = user_id);

drop policy if exists "challenge_progress_upsert_own" on public.challenge_progress;
create policy "challenge_progress_upsert_own"
on public.challenge_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "challenge_progress_update_own" on public.challenge_progress;
create policy "challenge_progress_update_own"
on public.challenge_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


