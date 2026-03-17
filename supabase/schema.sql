-- Inventory Manager – Supabase Schema
-- Run this in your Supabase project SQL Editor (Database → SQL Editor → New query).
-- This creates the three tables required for cloud sync.

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
  updated_at  timestamptz not null default now(),
  device_id   text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);

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
