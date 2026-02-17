## Why

The database layer has grown organically and now has measurable performance gaps: missing indexes on JSONB sort columns cause full table scans, the recommendations endpoint loads all games into memory, platform filtering uses inconsistent strategies (SQL vs in-memory), and there's no connection pooling or prepared statement usage. Drizzle ORM v0.45.1 supports features (partial indexes, expression indexes, prepared statements, explicit pooling) that the project doesn't leverage yet. Addressing these now prevents scaling problems as the game catalog grows.

## What Changes

- Add functional index on `game.external->>'igdbAggregatedRating'` to eliminate full table scans when sorting by popularity
- Add composite indexes for common query patterns: `game(status, created_at)`, `platform_group(submission_id, id)`
- Add partial indexes for status-filtered queries (e.g., only `approved` games)
- Introduce prepared statements for high-frequency queries (game by ID, game by slug, public game listings)
- Configure explicit connection pooling (`pg.Pool` with `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`)
- Refactor recommendations endpoint to use SQL-based pre-filtering with `LIMIT` instead of loading all games
- Standardize platform filtering to use SQL `GROUP BY`/`HAVING` approach across all endpoints (remove in-memory filtering in admin route)
- Evaluate and adopt Drizzle ORM v1 beta if stable enough (consolidated `drizzle-zod`, 10x faster schema introspection)

## Capabilities

### New Capabilities

- `db-indexing`: Expression indexes, partial indexes, composite indexes, and GIN indexes for JSONB columns. Covers index strategy and migration generation.
- `db-connection-pooling`: Explicit `pg.Pool` configuration with connection limits, timeouts, and optional `pg-native` for performance. Covers pool sizing and Supabase PgBouncer compatibility.
- `db-prepared-statements`: Prepared statement definitions for frequently executed queries. Covers query identification, placeholder usage, and integration with API routes.
- `db-query-optimization`: Refactored query patterns for recommendations, platform filtering, and game listings. Covers SQL-based filtering, `LIMIT` usage, and elimination of in-memory data processing.

### Modified Capabilities

_(none — no existing specs)_

## Impact

- **Schema/Migrations**: New migration(s) for indexes (no table structure changes, no data loss)
- **Server DB layer**: `server/db/index.ts` (pooling config), new prepared statement utilities
- **API routes**: `server/api/public/games/recommendations.get.ts` (query rewrite), `server/api/games/index.get.ts` (platform filtering fix), `server/api/public/games/index.get.ts` (prepared statements)
- **Dependencies**: Possible upgrade of `drizzle-orm`, `drizzle-kit`, `drizzle-zod`; optional addition of `pg-native`
- **Risk**: Low — all changes are additive (indexes) or internal refactors (query patterns). No API contract changes. No breaking changes for clients.
