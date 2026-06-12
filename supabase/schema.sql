-- Sophie's Tarot — Supabase schema
-- Run in the Supabase SQL editor. Requires the pgvector extension
-- for Sophie's retrieval-augmented memory.

create extension if not exists vector;

-- ── Profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Starlight',
  level int not null default 1,
  xp int not null default 0,
  bond int not null default 0,
  stardust int not null default 120,
  gold int not null default 1500,
  is_premium boolean not null default false,
  active_style_id text not null default 'classic',
  unlocked_style_ids text[] not null default array['classic'],
  login_streak int not null default 0,
  last_daily_claim date,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ── Readings ─────────────────────────────────────────────────
create table if not exists readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type_id text not null,
  type_name text not null,
  question text,
  cards jsonb not null,           -- [{cardId, cardName, reversed, position}]
  interpretation text not null,
  mood text,
  created_at timestamptz not null default now()
);

alter table readings enable row level security;
create policy "own readings" on readings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists readings_user_idx on readings(user_id, created_at desc);

-- ── Vector memory (RAG) ──────────────────────────────────────
-- Each memory is embedded (text-embedding-3-small → 1536 dims) and
-- retrieved by cosine similarity when composing Sophie's prompts.
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null check (category in ('long-term','recent','emotional','ritual')),
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

alter table memories enable row level security;
create policy "own memories" on memories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists memories_embedding_idx on memories
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Similarity search used by the reading edge function
create or replace function match_memories(
  p_user_id uuid,
  p_query_embedding vector(1536),
  p_match_count int default 8
) returns table (id uuid, category text, content text, similarity float)
language sql stable as $$
  select m.id, m.category, m.content,
         1 - (m.embedding <=> p_query_embedding) as similarity
  from memories m
  where m.user_id = p_user_id and m.embedding is not null
  order by m.embedding <=> p_query_embedding
  limit p_match_count;
$$;

-- ── Collection, story, purchases ─────────────────────────────
create table if not exists collectibles_owned (
  user_id uuid not null references profiles(id) on delete cascade,
  collectible_id text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, collectible_id)
);
alter table collectibles_owned enable row level security;
create policy "own collectibles" on collectibles_owned
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists story_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  chapter_id text not null,
  choices jsonb not null default '{}',
  completed_at timestamptz,
  primary key (user_id, chapter_id)
);
alter table story_progress enable row level security;
create policy "own story" on story_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_id text not null,
  stripe_session_id text,
  amount_usd numeric(10,2),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table purchases enable row level security;
create policy "own purchases read" on purchases
  for select using (auth.uid() = user_id);
