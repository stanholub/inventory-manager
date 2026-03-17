# Inventory Manager

A full-stack inventory management system built with TypeScript, featuring a React PWA for the web and an interactive CLI — both sharing the same business logic through a clean architecture.

---

## Features

- **Items** — Create, update, delete, and track quantities (increase/decrease with stock validation)
- **Containers** — Organize items into named locations or storage units
- **Item Types** — Categorize items with custom types
- **Offline-First Web App** — React PWA backed by IndexedDB for fully offline operation
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
| Tests | In-memory (ephemeral) |

---

## Contributing

See [AGENTS.md](./AGENTS.md) for coding standards, architectural rules, commit conventions, and branch strategy.
