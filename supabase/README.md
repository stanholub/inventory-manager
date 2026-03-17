# Cloud Sync — Supabase Setup Guide

This guide walks you through connecting the Inventory Manager web app to your own Supabase project so your data syncs across devices. Sync is entirely optional — the app works fully offline without it.

---

## Overview

### How it works

The app is **local-first**: every read and write goes to IndexedDB in your browser first. When you're online, a background sync engine:

1. **Pushes** local changes (creates, updates, deletes) to your Supabase PostgreSQL database
2. **Pulls** remote changes made on other devices and merges them into local storage

This means the app is always fast and works offline. Sync happens in the background and retries automatically when connectivity is restored.

### Conflict resolution

When the same record is edited on two devices while offline, the app uses **last-write-wins** based on the `updated_at` timestamp. Whichever device saved last wins. This is the right trade-off for a personal inventory app — conflicts are rare, and the cost of complexity outweighs the benefit of a merge UI.

### Deletes

Deletes use a **tombstone** pattern: a `deleted_at` timestamp is set on the record rather than removing the row. This ensures that deletes propagate correctly to devices that were offline at the time. Tombstone rows remain in the database indefinitely (they are small and do not affect functionality).

---

## Prerequisites

- A free [Supabase](https://supabase.com) account (no credit card required)
- The Inventory Manager web app open in a browser

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **New project**
3. Choose your organization, give the project a name (e.g., `inventory-manager`), set a database password, and pick the region closest to you
4. Click **Create new project** — provisioning takes about a minute

---

## Step 2 — Run the database schema

The app expects three tables: `items`, `containers`, and `item_types`.

1. In the Supabase dashboard, open **SQL Editor** (left sidebar)
2. Click **New query**
3. Copy the entire contents of [`schema.sql`](./schema.sql) in this folder and paste it into the editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see a success message. You can verify the tables were created by opening **Table Editor** in the sidebar — `items`, `containers`, and `item_types` should all appear.

> **What the schema creates:**
> - Three tables mirroring the app's domain entities, plus `updated_at`, `device_id`, and `deleted_at` columns used by the sync engine
> - Indexes on `updated_at` for each table to keep incremental sync queries fast

---

## Step 3 — Get your credentials

1. In the Supabase dashboard, go to **Settings → API** (or **Project Settings → API**)
2. Copy two values:
   - **Project URL** — looks like `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **Project API keys → `publishable`** — a long JWT string starting with `eyJ…`

> **Important:** Copy the `publishable` key, **not** the `service_role` key.
>
> | Key | When to use |
> |-----|-------------|
> | `publishable` | Safe for browsers and mobile apps. Use this one. |
> | `service_role` | Bypasses Row Level Security. Never expose this in a browser — it gives full database access. |

The publishable key is safe to use in the browser because:
- It is designed for client-side use
- Without Row Level Security it has full table access, which is fine when you own the entire project
- If you ever share the project with others, you can enable RLS (see [Security notes](#security-notes))

---

## Step 4 — Connect the app

1. Open the Inventory Manager web app
2. Tap the **Settings** tab in the bottom navigation
3. Paste your **Project URL** into the _Project URL_ field
4. Paste your **publishable key** into the _Publishable Key_ field
5. Click **Test connection** — you should see "Connection OK"
   - If you see an error, double-check the values and see [Troubleshooting](#troubleshooting)
6. Click **Enable sync**

The status indicator in the top-right of the header will turn blue (syncing) and then green (synced) once the first sync completes.

---

## Using sync

### Status indicator

The colored dot in the app header shows the current sync state:

| Dot color | Meaning |
|-----------|---------|
| Grey | Idle — sync is configured but not currently running |
| Blue (pulsing) | Syncing in progress |
| Green | Last sync completed successfully (hover to see timestamp) |
| Red | Sync error — tap Settings to see the error message |

### Sync triggers

Sync runs automatically:
- When the app loads
- When your device comes back online (offline → online transition)
- When you return to the browser tab after being away
- When you click **Sync now** in Settings

### Pending operations badge

If you made changes while offline, a number badge appears next to the sync dot showing how many operations are queued. They will be pushed on the next sync.

### Last synced

The Settings page shows the exact date and time of the most recent successful sync.

---

## Multi-device setup

To sync a second (or third) device, just repeat Steps 3–4 on that device using the **same Supabase project**. Each device gets its own `device_id` (generated automatically), but they all read and write to the same database.

There is no limit on the number of devices. Each device syncs independently.

---

## Security notes

### Current model (no RLS)

By default, `schema.sql` does **not** enable Row Level Security. The publishable key has full read/write access to all three tables. This is appropriate when:
- You are the sole user of this Supabase project
- You do not share your publishable key with anyone

### Enabling Row Level Security

If you want tighter control — for example, if you plan to add user authentication later — you can enable RLS. Commented-out examples are included in [`schema.sql`](./schema.sql):

```sql
-- Enable RLS on all tables
alter table items      enable row level security;
alter table containers enable row level security;
alter table item_types enable row level security;

-- Open policy (keeps current behaviour, but makes it explicit)
create policy "publishable full access" on items
  for all using (true) with check (true);
```

For a user-scoped policy (after adding Supabase Auth):
```sql
create policy "user owns rows" on items
  for all
  using  (auth.uid()::text = device_id)
  with check (auth.uid()::text = device_id);
```

### Where credentials are stored

Your Project URL and publishable key are stored in your **browser's localStorage** under the key `inventory_sync_config`. They are never sent anywhere except directly to your Supabase project. They are not included in the app bundle or source code.

---

## Supabase free tier limits

The free tier is more than sufficient for a personal inventory app:

| Resource | Free limit |
|----------|-----------|
| Database size | 500 MB |
| Bandwidth | 5 GB / month |
| API requests | Unlimited (subject to rate limiting at very high volumes) |
| Projects | 2 active projects |

A typical inventory database with thousands of items will be well under 10 MB.

---

## Disconnecting

To remove the Supabase connection from this device:

1. Open **Settings → Cloud Sync**
2. Click **Disconnect**

This removes your credentials and the last-synced timestamp from localStorage. **It does not delete any data from your Supabase database.** Data on this device (in IndexedDB) is also preserved.

To re-connect later, simply paste your credentials again and click **Enable sync**.

---

## Troubleshooting

### "Connection OK" but no data appears after enabling sync

The initial sync may take a few seconds. Wait for the status indicator to turn green. If it stays grey or turns red, check the error message in Settings.

### Test connection says "table not found" (PGRST116)

The `schema.sql` has not been run yet (or ran partially). Go back to Step 2 and run the full schema in the SQL Editor.

### Test connection gives a network or CORS error

The **Project URL** is likely wrong. Make sure it is the full URL including `https://` and ending in `.supabase.co`, with no trailing slash. Copy it directly from **Settings → API** in the Supabase dashboard.

### Test connection gives a 401 Unauthorized error

You may have pasted the `service_role` key instead of the `publishable` key, or the key is from a different project than the URL. Double-check both values.

### Sync gets stuck on "Syncing…"

Check that your browser has an internet connection. If the problem persists, open browser DevTools → Console and look for error messages starting with "Supabase". A common cause is an expired or revoked publishable key — regenerate it in the Supabase dashboard under **Settings → API → Reveal** and update it in Settings.

### Changes from another device don't appear

Sync only pulls changes that occurred after the `last_synced_at` stored on this device. Try clicking **Sync now** in Settings. If that does not help, try clearing `inventory_last_synced_at` from localStorage (browser DevTools → Application → Local Storage) and syncing again — this forces a full re-pull.
