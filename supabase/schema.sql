-- ─────────────────────────────────────────────────────────────────────────────
-- SONA — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. PROFILES ──────────────────────────────────────────────────────────────
-- Extends auth.users with display name and avatar.

create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();


-- ── 2. MEETINGS ──────────────────────────────────────────────────────────────

create table if not exists meetings (
  id                uuid primary key default gen_random_uuid(),
  room_id           text not null unique,
  host_id           uuid not null references auth.users(id) on delete cascade,
  title             text,
  started_at        timestamptz default now() not null,
  ended_at          timestamptz,
  participant_count int default 1 not null
);

alter table meetings enable row level security;

create policy "Host can manage own meetings"
  on meetings for all
  using (auth.uid() = host_id);


-- ── 3. TRANSCRIPTS ───────────────────────────────────────────────────────────
-- lines is a JSONB array of { speaker, time, text, highlight? }

create table if not exists transcripts (
  id         uuid primary key default gen_random_uuid(),
  meeting_id uuid not null unique references meetings(id) on delete cascade,
  lines      jsonb not null default '[]'::jsonb,
  created_at timestamptz default now() not null
);

alter table transcripts enable row level security;

create policy "Host can access transcripts"
  on transcripts for all
  using (
    exists (
      select 1 from meetings
      where meetings.id = transcripts.meeting_id
        and meetings.host_id = auth.uid()
    )
  );


-- ── 4. SUMMARIES ─────────────────────────────────────────────────────────────

create table if not exists summaries (
  id           uuid primary key default gen_random_uuid(),
  meeting_id   uuid not null references meetings(id) on delete cascade,
  summary_text text,
  key_topics   text[] default '{}',
  created_at   timestamptz default now() not null
);

alter table summaries enable row level security;

create policy "Host can access summaries"
  on summaries for all
  using (
    exists (
      select 1 from meetings
      where meetings.id = summaries.meeting_id
        and meetings.host_id = auth.uid()
    )
  );


-- ── 5. ACTION ITEMS ──────────────────────────────────────────────────────────

create table if not exists action_items (
  id         uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  text       text not null,
  owner_name text,
  due_date   text,
  done       boolean default false not null,
  created_at timestamptz default now() not null
);

alter table action_items enable row level security;

create policy "Host can access action items"
  on action_items for all
  using (
    exists (
      select 1 from meetings
      where meetings.id = action_items.meeting_id
        and meetings.host_id = auth.uid()
    )
  );
