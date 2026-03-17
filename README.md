# Inventory Manager

A full-stack inventory management system built with TypeScript, featuring a React PWA for the web and an interactive CLI — both sharing the same business logic through a clean architecture.

---

## Features

- **Items** — Create, update, delete, and track quantities (increase/decrease with stock validation)
- **Containers** — Organize items into named locations or storage units
- **Item Types** — Categorize items with custom types
- **Offline-First Web App** — React PWA backed by IndexedDB for fully offline operation
- **Cloud Sync (optional)** — Multi-device sync via your own Supabase project; data lives in your database, not a shared server
- **Interactive CLI** — Terminal interface for managing inventory without a browser
- **Clean Architecture** — Shared domain and application logic across all frontends

---

## Architecture

```
┌──────────────────────────────────────────┐
│           Presentation Layer             │
│   @inventory/cli   @inventory/web        │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│          Infrastructure Layer            │
│         @inventory/infrastructure        │
│  (InMemory / FileSystem / IndexedDB)     │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│           Application Layer              │
│            @inventory/core               │
│     (Use cases, Controllers,             │
│      Repository interfaces)             │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│             Domain Layer                 │
│           @inventory/domain              │
│   (Item, Container, ItemType entities)   │
│   (Domain errors)                        │
└──────────────────────────────────────────┘
```

---

## Project Structure

```
inventory-manager/
├── packages/
│   ├── domain/              # @inventory/domain — entities and errors
│   ├── application/         # @inventory/core — use cases and interfaces
│   ├── infrastructure/      # @inventory/infrastructure — repository impls
│   └── presentation/
│       ├── cli/             # @inventory/cli — interactive terminal UI
│       └── web/             # @inventory/web — React PWA
├── AGENTS.md                # Rules of engagement for AI agents
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # pnpm workspace definition
└── vitest.config.ts         # Test configuration
```

---

## Prerequisites

- **Node.js** v22+
- **pnpm** v10+

```bash
npm install -g pnpm
```

---

## Installation

```bash
pnpm install
```

---

## Development

### Web App

```bash
pnpm dev:web
```

Opens a Vite dev server. The app works offline once loaded, persisting data in the browser's IndexedDB.

### CLI

```bash
pnpm dev:cli
```

Runs the interactive CLI with hot reload. Data is persisted to the local filesystem.

### All Packages (watch mode)

```bash
pnpm dev
```

---

## Testing

```bash
pnpm test          # run all tests once
pnpm test:watch    # re-run tests on file changes
```

Tests are colocated with source files (`*.test.ts`) and use Vitest with InMemory repository implementations for fast, isolated execution.

---

## Linting

```bash
pnpm lint          # check for issues
pnpm lint:fix      # auto-fix issues
```

A pre-commit hook runs `lint-staged` automatically on staged TypeScript files before each commit.

---

## Building

```bash
pnpm build         # build all packages
pnpm build:web     # production build of the web app only
```

---

## Data Persistence

| Frontend | Storage |
|---|---|
| CLI | JSON files on the local filesystem |
| Web PWA | Browser IndexedDB (offline-capable) |
| Web PWA + cloud sync | IndexedDB (primary) + your Supabase PostgreSQL (cloud) |
| Tests | In-memory (ephemeral) |

---

## Cloud Sync (optional)

The web app is fully offline-first — sync is an optional layer that you bring yourself. Each user connects their own free [Supabase](https://supabase.com) project. Your data lives in your PostgreSQL instance; there is no shared server.

### Quick start

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** in the Supabase dashboard and run [`supabase/schema.sql`](./supabase/schema.sql)
3. Copy your **Project URL** and **publishable key** from **Settings → API**
4. Open the app, navigate to the **Settings** tab, paste the credentials, and click **Enable sync**

For the full guide — including multi-device setup, security notes, troubleshooting, and free-tier limits — see [`supabase/README.md`](./supabase/README.md).

---

## Contributing

See [AGENTS.md](./AGENTS.md) for coding standards, architectural rules, commit conventions, and branch strategy.
