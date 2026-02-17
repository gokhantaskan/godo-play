## Context

The database layer uses Drizzle ORM v0.45.1 with PostgreSQL 17 via `node-postgres`. The schema has 12 tables centered around the `game` entity, with junction tables for many-to-many relationships (platform groups, store platforms, game modes, tags). All complex reads use Drizzle's relational query builder (`db.query.*.findMany`) with eager loading via `with` clauses.

Current pain points:

- Sorting by `(external->>'igdbAggregatedRating')::float` has no supporting index — full table scan on every public listing
- Recommendations endpoint (`/api/public/games/recommendations`) loads ALL games into memory, scores them in JS, then slices — O(n) memory and CPU
- Admin game listing (`/api/games/index.get`) uses in-memory platform filtering (fetch all matching platform_group_platforms, group in JS, filter) while the public listing already uses SQL `GROUP BY`/`HAVING`
- DB connection uses `drizzle({ connection: ... })` shorthand — no pool size, timeout, or idle configuration
- No prepared statements despite several high-frequency queries with identical structure

## Goals / Non-Goals

**Goals:**

- Eliminate full table scans for popularity sorting via expression index
- Reduce recommendations memory footprint from O(all_games) to O(limit) using SQL pre-filtering
- Unify platform filtering to SQL-based approach in all endpoints
- Configure explicit connection pooling with sensible defaults
- Introduce prepared statements for the most common query patterns
- Add composite and partial indexes for frequently filtered columns
- Stay on stable Drizzle ORM (v0.45.x) unless v1 beta is production-ready

**Non-Goals:**

- Changing the public API response shape (no breaking changes to clients)
- Adding full-text search (pg_trgm / tsvector) — future enhancement
- Migrating to a different database driver (e.g., Neon serverless)
- Adding materialized views — unnecessary at current scale
- Upgrading to Drizzle v1 beta in this change (evaluate separately)

## Decisions

### 1. Expression index for JSONB rating sort

**Decision:** Add a functional B-tree index on `((external->>'igdbAggregatedRating')::float)` with `DESC NULLS LAST` ordering.

**Rationale:** Both public and admin game listings sort by this expression as the default. Without an index, PostgreSQL must extract and cast the JSONB value for every row. A functional index pre-computes this and supports ordered scans.

**Alternative considered:** GIN index on the entire `external` JSONB column. Rejected because GIN supports containment queries (`@>`, `?`), not ordered range scans. A targeted B-tree expression index directly matches the `ORDER BY` clause.

**Implementation:** Add to the `games` table `extraConfig` array in `server/db/schema/tables/games.ts`, then generate a migration with `pnpm db:generate`.

### 2. Composite and partial indexes

**Decision:** Add these indexes to the `game` table:

- `game_status_created_at_idx` on `(status, created_at DESC)` — covers filtered + sorted queries
- `game_approved_created_at_idx` partial index on `(created_at DESC)` WHERE `status = 'approved'` — covers the most common public query filter

**Rationale:** Most public queries filter by `status = 'approved'` and sort by `created_at` or `popularity`. A composite index eliminates the need for PostgreSQL to cross-reference separate `game_status_idx` and `game_created_at_idx` indexes. The partial index is even more efficient because it only indexes the ~80% of rows that matter for public queries.

**Alternative considered:** Keeping existing single-column indexes. Rejected because the query planner cannot efficiently combine two separate B-tree indexes for `WHERE status = X ORDER BY created_at DESC`.

**Implementation:** Define via `index()` in the table's `extraConfig`. Use `.where(sql`...`)` for the partial index.

### 3. Explicit connection pool configuration

**Decision:** Replace `drizzle({ connection: ... })` with explicit `pg.Pool` instantiation, configured with:

- `max: 20` (default, adjustable via env var `POSTGRES_POOL_MAX`)
- `idleTimeoutMillis: 30000`
- `connectionTimeoutMillis: 5000`

**Rationale:** The current shorthand uses `node-postgres` defaults internally but provides no visibility or control. Explicit pooling allows tuning for deployment environment (local Docker vs. Supabase) and prevents connection exhaustion under load.

**Alternative considered:** Adding `pg-native` for ~10% speed boost. Deferred — it requires native build tooling and adds deployment complexity. Can be added later as a drop-in.

**Implementation:** Modify `server/db/index.ts` to create a `Pool` instance and pass it as `client` to `drizzle()`.

### 4. Prepared statements for high-frequency queries

**Decision:** Create prepared statements for:

- Public game listing (the default "all approved, sorted by popularity" query)
- Game lookup by slug (`/api/public/games/[slug]`)

**Rationale:** These are the two most frequently executed queries. Prepared statements avoid repeated SQL compilation and Drizzle query-builder overhead. The `.prepare()` API is stable in Drizzle v0.45.x.

**Alternative considered:** Preparing all queries. Rejected — the dynamic filter combinations in game listings (platforms, game modes, tags, search, sort) produce too many query variations to benefit from preparation. Only static or near-static queries warrant this.

**Limitation:** Prepared statements cannot be used inside `db.transaction()` ([drizzle-orm#2826](https://github.com/drizzle-team/drizzle-orm/issues/2826)). This doesn't affect our use cases since the prepared queries are read-only.

**Implementation:** Define prepared statements in a dedicated file `server/db/prepared.ts` and import into API routes. Use `sql.placeholder()` for dynamic parameters.

### 5. SQL-based recommendations pre-filtering

**Decision:** Rewrite the recommendations endpoint to:

1. Use SQL `WHERE` clauses to pre-filter candidates (same game modes OR same tags)
2. Apply `LIMIT` at the SQL level (fetch 5x the requested limit to account for scoring variance)
3. Score and rank the smaller candidate set in memory

**Rationale:** Currently loads every game except the source into memory. With 1000+ games this becomes problematic. Pre-filtering with `WHERE game_mode_id IN (...)` or `tag_id IN (...)` via subqueries reduces the candidate set by 80-90%.

**Alternative considered:** Pre-computed recommendation table (materialized view). Rejected — adds complexity and staleness concerns. The current cached endpoint (5h TTL in production) already mitigates repeated computation. SQL pre-filtering is sufficient.

**Implementation:** Replace the `findMany({ where: not(eq(games.id, sourceGame.id)) })` with a subquery-based approach that filters to games sharing at least one tag or game mode with the source game. Keep the existing weighted scoring logic for the reduced set.

### 6. Standardize platform filtering to SQL

**Decision:** Replace the in-memory platform filtering in `server/api/games/index.get.ts` (admin route) with the same SQL `GROUP BY`/`HAVING` subquery approach used in `server/api/public/games/index.get.ts`.

**Rationale:** The admin route fetches all `platformGroupPlatforms` matching any requested platform, groups them by `submissionId` in JS using `Map<number, Set<number>>`, then filters. The public route already does this correctly in SQL. Aligning the admin route eliminates unnecessary data transfer and simplifies maintenance.

**Implementation:** Copy the SQL subquery pattern from the public route (lines 99-116 of `server/api/public/games/index.get.ts`) into the admin route, replacing lines 124-169 of `server/api/games/index.get.ts`.

## Risks / Trade-offs

**[Risk] Expression index increases write overhead** → Minimal impact. The index only applies to `INSERT` and `UPDATE` on the `external` column, which happens infrequently (game submissions and IGDB syncs). Read performance gain far outweighs the marginal write cost.

**[Risk] Connection pool exhaustion during traffic spikes** → Mitigated by configurable `max` via environment variable and `connectionTimeoutMillis` that fails fast rather than queuing indefinitely. Monitor with PostgreSQL's `pg_stat_activity`.

**[Risk] Prepared statement cache invalidation** → `node-postgres` manages prepared statement lifecycle automatically. No manual cache management needed. If schema changes invalidate a prepared statement, the driver re-prepares transparently.

**[Risk] Recommendations pre-filtering may exclude valid candidates** → Mitigated by using `OR` logic (shares at least one tag OR one game mode) rather than `AND`. The 5x over-fetch buffer further reduces the chance of missing good recommendations. The existing 5h cache means any imprecision is temporary.

**[Trade-off] Partial indexes reduce write performance slightly** → Accepted. The `approved` partial index only indexes rows where `status = 'approved'`, which is actually cheaper to maintain than a full index since pending/rejected rows are excluded.

**[Trade-off] No Drizzle v1 upgrade in this change** → The v1 beta consolidates `drizzle-zod` into the main package and offers 10x faster introspection, but it's still beta. We stay on stable v0.45.x and evaluate v1 separately when it reaches stable release.
