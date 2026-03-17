-- Inventory Manager – Supabase Schema
-- ─────────────────────────────────────────────────────────────────────────────
-- Full setup guide: supabase/README.md
--
-- Quick start:
--   1. Open SQL Editor in your Supabase dashboard (Database → SQL Editor)
--   2. Paste this entire file and click Run
--   3. Copy your Project URL + anon key from Settings → API
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
  created_at  timestamptz not null default now()
);

-- Indexes to make incremental sync queries fast
create index if not exists items_updated_at_idx      on items      (updated_at);
create index if not exists containers_updated_at_idx on containers (updated_at);
create index if not exists item_types_updated_at_idx on item_types (updated_at);

-- ── Optional: Row Level Security ────────────────────────────────────────────
-- If you plan to share this Supabase project with others in the future, or
-- want to add user-based auth later, uncomment and adapt the lines below.
-- By default, the anon key has full read/write access (appropriate for a
-- single-user personal inventory).

-- alter table items      enable row level security;
-- alter table containers enable row level security;
-- alter table item_types enable row level security;

-- Example open policy (anon key full access – current default behaviour):
-- create policy "anon full access" on items      for all using (true) with check (true);
-- create policy "anon full access" on containers for all using (true) with check (true);
-- create policy "anon full access" on item_types for all using (true) with check (true);

-- Example user-scoped policy (enable after adding auth):
-- create policy "user owns rows" on items
--   for all using (auth.uid()::text = device_id)
--   with check (auth.uid()::text = device_id);
