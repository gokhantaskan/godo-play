# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GodoPlay — a Nuxt 3 full-stack app for discovering cross-platform multiplayer games. Uses IGDB API for game metadata, PostgreSQL + Drizzle ORM for data, Supabase Auth, Prismic CMS for content pages, and Redis for caching.

## Commands

```bash
pnpm dev              # Start Docker PostgreSQL + Nuxt dev server (HTTPS on port 3000)
pnpm dev:client       # Nuxt dev server only (skip database setup)
pnpm build            # Production build
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier for HTML, JSON, MD, CSS, SCSS
pnpm typecheck        # TypeScript type checking (strict, runs vue-tsc)

# Database (Drizzle ORM + PostgreSQL)
pnpm db:generate      # Generate migration from schema changes
pnpm db:push          # Push schema directly to database
pnpm db:migrate       # Run pending migrations
pnpm db:studio        # Open Drizzle Studio GUI
```

No automated test suite exists. Dev server requires local SSL certificates via mkcert.

## Architecture

### Directory Layout (Nuxt 4 structure)

- **`app/`** — Frontend: pages, components, composables, plugins, slices (Prismic)
- **`server/`** — Backend: API routes (`server/api/`), database (`server/db/`), middleware, plugins, utils
- **`shared/`** — Single source of truth for types (`shared/types/index.ts`), Zod schemas (`shared/schemas/`), and constants shared between client and server

### Data Flow

- **State**: No Pinia — uses Nuxt `useState` for global state and `useSessionState` for reference data (game modes, stores, tags) loaded once in `app.vue`
- **API**: REST endpoints under `server/api/`. Public routes at `/api/public/*`. All other `/api/*` routes require Supabase auth (enforced by `server/middleware/auth.ts`)
- **Caching**: Server-side Redis via unstorage (`defineCachedEventHandler`). Client-side `useCachedFetch` composable for NuxtData caching
- **IGDB**: Proxy client in `server/utils/igdb.ts` with Redis-backed token management (`server/utils/tokenStorage.ts`). Automatic Twitch OAuth token refresh

### Database

- PostgreSQL 17 via Docker (`docker-compose.yml`, container: `godoplay-postgres`)
- Drizzle ORM with `casing: "snake_case"` — write camelCase in schema, auto-maps to snake_case in PostgreSQL
- Schema in `server/db/schema/tables/`, relations in `server/db/schema/relations/`
- Zod schemas auto-generated from Drizzle schemas via `drizzle-zod`, extended in `shared/schemas/`
- Seeding via Nitro plugin (`server/plugins/00-seed.ts`) when `DO_SEED=true`
- Backup/restore scripts in `scripts/`

### Auth

- Supabase Auth with cookie-based SSR sessions
- Client plugin (`app/plugins/auth.client.ts`) listens for auth state changes
- Admin routes: client middleware `app/middleware/auth.ts` + server middleware `server/middleware/auth.ts`
- Authenticated user available as `event.context.user` in server handlers

## Coding Conventions

### Vue & Nuxt

- Composition API with `<script setup lang="ts">` exclusively
- `defineModel` for v-model bindings (no `modelValue` prop pattern)
- No `withDefaults()` when destructuring `defineProps()`
- Use `status === "pending"` not the `pending` ref from fetch composables
- Root imports: `~~/` (e.g., `~~/shared/types`). App imports: `@/` or `~/`
- Single-name components prefixed with `The` (e.g., `TheButton`, `TheModal`) in `app/components/The/`

### Styling

- Tailwind CSS v4 beta — prefix utility classes with `tw:` in Vue templates (e.g., `tw:flex tw:container`)
- CSS custom properties use `--tw-` prefix (e.g., `--tw-color-primary`)
- SCSS organized by ITCSS in `app/assets/styles/` with BEM naming
- No `@apply` directive. If >5 Tailwind utilities on an element, extract to a custom class
- Prefer CSS logical properties (`padding-inline`, `margin-block-start`)
- Sass imports: `@use "sass:math"`, `@use "sass:map"`

### TypeScript

- Prefer `interface` over `type`. Avoid enums — use maps or literal types
- Functional & declarative — no classes
- Descriptive names with auxiliary verbs: `isLoading`, `hasError`

### Database

- camelCase for fields and relations in Drizzle schema definitions
- Read vs. Insert type separation: `ReadGame` / `InsertGame`

### Git

- Conventional commits enforced by commitlint + Husky
- Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`
- Imperative mood, present tense, lowercase subject
- Pre-commit hook runs lint-staged (ESLint + Prettier)

### API Response Patterns

- Paginated: `{ total, limit, offset, data }`
- Errors: `{ statusCode, message, data? }`
- Validation errors: `{ statusCode: 400, message, data: { errors: Record<string, string> } }`

### Pure Functions

- Write as standard function declarations (not arrow functions)
- Place at end of `<script>` section or parent closure
