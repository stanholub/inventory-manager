# AGENTS.md — Rules of Engagement for AI Agents

This file governs how AI agents (Claude, Copilot, etc.) should interact with this codebase.

---

## Architecture Overview

This project is a **TypeScript monorepo** implementing **Clean Architecture** with a strict unidirectional dependency flow:

```
┌─────────────────────────────────────────────┐
│             Presentation Layer              │
│  packages/presentation/cli   (CLI app)      │
│  packages/presentation/web   (React PWA)    │
└────────────────┬────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────┐
│            Infrastructure Layer             │
│  packages/infrastructure                    │
│  (FileSystem, InMemory, IndexedDB repos)    │
└────────────────┬────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────┐
│            Application Layer                │
│  packages/application                       │
│  (Use cases, Controllers, Repo interfaces)  │
└────────────────┬────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────┐
│              Domain Layer                   │
│  packages/domain                            │
│  (Entities: Item, Container, ItemType)      │
│  (Errors: ItemNotFoundError, etc.)          │
└─────────────────────────────────────────────┘
```

**Dependency rule:** Inner layers must never import from outer layers.

---

## Package Descriptions

| Package | Name | Responsibility |
|---|---|---|
| `packages/domain` | `@inventory/domain` | Pure business entities and domain errors. No external dependencies. |
| `packages/application` | `@inventory/core` | Use cases (business logic), repository interfaces, controllers. Depends only on `@inventory/domain`. |
| `packages/infrastructure` | `@inventory/infrastructure` | Repository implementations (InMemory, FileSystem, IndexedDB). |
| `packages/presentation/cli` | `@inventory/cli` | Interactive CLI built with `@inquirer/prompts`. |
| `packages/presentation/web` | `@inventory/web` | React 18 PWA with IndexedDB offline persistence. |

---

## Rules of Engagement

### General

1. **Do not violate the dependency rule.** Domain and application packages must not import from infrastructure or presentation.
2. **Preserve the IUseCase pattern.** All use cases implement `IUseCase<Request, Response>`. Never bypass this interface.
3. **Use `crypto.randomUUID()`** for ID generation — never custom ID schemes.
4. **TypeScript strict mode is on.** All code must type-check with `tsc --noEmit`.
5. **Never use `any`.** Use proper types, generics, or `unknown` with type guards.

### Adding New Features

1. Start from the **domain** layer: define or extend entities and errors.
2. Add a **repository interface** in `packages/application/src/interfaces/` if new persistence is needed.
3. Create a **use case** in `packages/application/src/usecases/` implementing `IUseCase`.
4. Add a corresponding **controller** in `packages/application/src/controllers/` if multiple use cases need orchestration.
5. Implement the **repository** in `packages/infrastructure/src/repositories/` (InMemory first, then FileSystem/IndexedDB).
6. Wire it up in the **presentation** layer (CLI flow or React hook/component).
7. Write **tests** for the use case using the InMemory repository.

### Code Style

- Use `async/await` — no raw Promise chains.
- Keep files small and single-purpose.
- Name use cases as imperative verbs: `AddItem`, `DeleteContainer`, `ListItemTypes`.
- Name repository interfaces as `<Entity>Repository`.
- Name infrastructure implementations as `<Provider><Entity>Repository` (e.g., `FileSystemItemRepository`, `InMemoryContainerRepository`).

### Tests

- Use **Vitest** for all tests.
- Test files live next to the source files they test (`*.test.ts`).
- Always test use cases against the **InMemory** repository implementation.
- Cover: happy path, not-found errors, edge cases (e.g., insufficient stock).

### Linting

- Run `pnpm lint` before committing. The pre-commit hook enforces this.
- Run `pnpm lint:fix` to auto-fix issues.
- Do not suppress ESLint rules with `// eslint-disable` comments without a justification comment.

### Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) format: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`
- Scope examples: `domain`, `application`, `infrastructure`, `cli`, `web`
- Example: `feat(application): add UpdateItemType use case`

### Branches

- Feature branches: `feat/<short-description>`
- Fix branches: `fix/<short-description>`
- Never commit directly to `main` or `master`.
- Agent branches follow the pattern `claude/<task-description>-<session-id>`.

---

## Setup Instructions

### Prerequisites

- **Node.js** v22+
- **pnpm** v10+ (`npm install -g pnpm`)

### Install Dependencies

```bash
pnpm install
```

### Build All Packages

```bash
pnpm build
```

---

## Running Instructions

### CLI (Development)

```bash
pnpm dev:cli
```

Starts the CLI with hot reload using `tsup --watch`.

### Web App (Development)

```bash
pnpm dev:web
```

Starts the Vite dev server. Open the URL shown in the terminal.

### Run Tests

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
```

### Lint

```bash
pnpm lint          # check for issues
pnpm lint:fix      # auto-fix issues
```

### Build for Production

```bash
pnpm build         # build all packages
pnpm build:web     # build only the web app
```

---

## What Agents Should Avoid

- Do not modify `pnpm-lock.yaml` manually.
- Do not add dependencies to inner-layer packages (`@inventory/domain`, `@inventory/core`) unless strictly necessary and domain-safe.
- Do not introduce side effects in use cases (logging, direct I/O). Use the repository abstraction.
- Do not add React or CLI dependencies to `@inventory/domain` or `@inventory/core`.
- Do not delete or rename existing repository interfaces without updating all implementations.
- Do not use `console.log` in library packages (domain, application, infrastructure). CLI and web presentations may use it sparingly.
