/**
 * The Supabase schema SQL for this app.
 * Kept in sync with supabase/schema.sql.
 * Used in Settings to let users copy and apply it without finding the repo file.
 */
export const SCHEMA_SQL = `-- Inventory Manager – Supabase Schema
-- Run this in Database → SQL Editor in your Supabase dashboard.

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

-- Indexes for incremental sync
create index if not exists items_updated_at_idx      on items      (updated_at);
create index if not exists containers_updated_at_idx on containers (updated_at);
create index if not exists item_types_updated_at_idx on item_types (updated_at);

-- Indexes for user_id filtering
create index if not exists items_user_id_idx      on items      (user_id);
create index if not exists containers_user_id_idx on containers (user_id);
create index if not exists item_types_user_id_idx on item_types (user_id);

-- Row Level Security
alter table items      enable row level security;
alter table containers enable row level security;
alter table item_types enable row level security;

create policy if not exists "user owns items" on items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "user owns containers" on containers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy if not exists "user owns item_types" on item_types
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
`;

export interface SchemaStatus {
  items: boolean | null;
  containers: boolean | null;
  itemTypes: boolean | null;
  containersParentId: boolean | null;
}

export async function checkSchema(
  client: import("@supabase/supabase-js").SupabaseClient,
): Promise<SchemaStatus> {
  const check = async (table: string, column?: string) => {
    const query = column
      ? client.from(table).select(column).limit(1)
      : client.from(table).select("id").limit(1);
    const { error } = await query;
    if (!error) return true;
    // 42P01 = undefined_table, 42703 = undefined_column
    if (error.code === "42P01" || error.code === "42703") return false;
    // PGRST116 = results contain 0 rows — table exists but is empty
    if (error.code === "PGRST116") return true;
    // For RLS errors, table exists but user can't read — still "present"
    if (error.code === "42501") return true;
    return true; // unknown error, assume present
  };

  const [items, containers, itemTypes, containersParentId] = await Promise.all([
    check("items"),
    check("containers"),
    check("item_types"),
    check("containers", "parent_id"),
  ]);

  return { items, containers, itemTypes, containersParentId };
}
