-- Inventory Manager – Supabase Schema
-- ─────────────────────────────────────────────────────────────────────────────
-- Full setup guide: supabase/README.md
--
-- Quick start:
--   1. Open SQL Editor in your Supabase dashboard (Database → SQL Editor)
--   2. Paste this entire file and click Run
--   3. Copy your Project URL + publishable key from Settings → API
--   4. Open the app → Settings tab → paste credentials → Enable sync
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Tables created:
--   items        – inventory items with quantity tracking
--   containers   – storage locations / bins that items can belong to
--   item_types   – categories with custom field definitions
--
-- Sync columns (present on all three tables):
--   updated_at   – ISO timestamp of last write; used for last-write-wins merge
--   device_id    – UUID of the device that wrote this row (for attribution)
--   deleted_at   – tombstone timestamp; NULL means the record is active
--   user_id      – Supabase auth UID; NULL means unauthenticated / legacy row
--
-- JSON columns:
--   items.field_values   – arbitrary key/value pairs matching the item's type
--                          fields schema, e.g. {"color": "red", "weight": 1.5}
--   item_types.fields    – array of ItemTypeField objects that define the
--                          custom fields for this type, e.g.
--                          [{"id":"f1","name":"Color","type":"text","required":true}]

create table if not exists items (
  id          text        primary key,
  name        text        not null,
  quantity    integer     not null default 0,
  container_id text,
  type_id     text,
  barcode     text,
  field_values jsonb       not null default '{}',
  updated_at  timestamptz not null default now(),
  device_id   text,
  deleted_at  timestamptz,
  user_id     uuid        references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists containers (
  id          text        primary key,
  name        text        not null,
  description text,
  type        text,
  parent_id   text        references containers(id) on delete set null,
  updated_at  timestamptz not null default now(),
  device_id   text,
  deleted_at  timestamptz,
  user_id     uuid        references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Migration: add parent_id to an existing containers table
-- Run this if you already applied the original schema:
-- alter table containers add column if not exists parent_id text references containers(id) on delete set null;

create table if not exists item_types (
  id          text        primary key,
  name        text        not null,
  description text,
  fields      jsonb       not null default '[]',
  updated_at  timestamptz not null default now(),
  device_id   text,
  deleted_at  timestamptz,
  user_id     uuid        references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Indexes to make incremental sync queries fast
create index if not exists items_updated_at_idx      on items      (updated_at);
create index if not exists containers_updated_at_idx on containers (updated_at);
create index if not exists item_types_updated_at_idx on item_types (updated_at);

-- Indexes for user_id filtering
create index if not exists items_user_id_idx      on items      (user_id);
create index if not exists containers_user_id_idx on containers (user_id);
create index if not exists item_types_user_id_idx on item_types (user_id);

-- ── Migration: add user_id to existing tables ─────────────────────────────
-- Run this if you already applied the original schema without user_id:
-- alter table items      add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table containers add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table item_types add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- ── Row Level Security (multi-user) ──────────────────────────────────────────
-- Enable RLS on all tables to isolate data per user.
-- Unauthenticated access (user_id IS NULL) falls back to device-based access
-- using the publishable key with the open policy below.
--
-- OPTION A – Single user / personal use (default):
--   Uncomment the "open policy" lines for full read/write with the publishable key.
--
-- OPTION B – Multi-user (recommended when sharing a Supabase project):
--   Enable RLS and the user-scoped policies so each authenticated user sees only
--   their own data. Rows with user_id IS NULL are only accessible unauthenticated.

alter table items      enable row level security;
alter table containers enable row level security;
alter table item_types enable row level security;

-- ── Authenticated users see and manage only their own rows ────────────────────
create policy "user owns items" on items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user owns containers" on containers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user owns item_types" on item_types
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Unauthenticated / legacy access (single-user without auth) ────────────────
-- Uncomment and use INSTEAD OF the user-scoped policies above if you want
-- single-user personal use without authentication:
--
-- create policy "publishable full access" on items
--   for all using (true) with check (true);
-- create policy "publishable full access" on containers
--   for all using (true) with check (true);
-- create policy "publishable full access" on item_types
--   for all using (true) with check (true);
