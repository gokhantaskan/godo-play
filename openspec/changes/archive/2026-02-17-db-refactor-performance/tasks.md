## 1. Connection Pooling

- [x] 1.1 Refactor `server/db/index.ts` to create an explicit `pg.Pool` instance with `max` (default 20, from `POSTGRES_POOL_MAX`), `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`, and existing SSL logic
- [x] 1.2 Pass the pool to `drizzle()` via `{ client: pool, schema, casing: 'snake_case' }` instead of `{ connection: ... }`
- [x] 1.3 Verify dev server starts and queries work with the new pool config (`pnpm dev`)

## 2. Database Indexes

- [x] 2.1 Add expression index `game_external_igdb_rating_idx` on `((external->>'igdbAggregatedRating')::float DESC NULLS LAST)` to the `games` table extraConfig in `server/db/schema/tables/games.ts`
- [x] 2.2 Add composite index `game_status_created_at_idx` on `(status, created_at DESC)` to the `games` table extraConfig
- [x] 2.3 Add partial index `game_approved_created_at_idx` on `(created_at DESC)` with `.where(sql\`status = 'approved'\`)`to the`games` table extraConfig
- [x] 2.4 Run `pnpm db:generate` to create the migration file and verify the generated SQL contains the expected `CREATE INDEX` statements
- [x] 2.5 Run `pnpm db:push` or `pnpm db:migrate` to apply the indexes to the local database

## 3. Prepared Statements

- [x] 3.1 Create `server/db/prepared.ts` with a prepared statement `getGameBySlugPrepared` that queries a game by `sql.placeholder('slug')` with full relational data (platformGroups, storePlatforms, gameModes, tags, crossplayInformation)
- [x] 3.2 Update `server/api/public/games/[slug].get.ts` to use `getGameBySlugPrepared.execute({ slug })` instead of building the query inline

## 4. Query Optimization — Platform Filtering

- [x] 4.1 Replace the in-memory platform filtering in `server/api/games/index.get.ts` (lines ~124-169) with the SQL `GROUP BY`/`HAVING` subquery approach from `server/api/public/games/index.get.ts` (lines ~99-116)
- [x] 4.2 Remove the `Map<number, Set<number>>` grouping logic and associated type definitions that are no longer needed

## 5. Query Optimization — Recommendations

- [x] 5.1 Rewrite the candidate query in `server/api/public/games/recommendations.get.ts` to use SQL subqueries that filter to games sharing at least one tag OR one game mode with the source game
- [x] 5.2 Add a SQL `LIMIT` of `5 * limit` to the candidate query to cap the number of rows fetched
- [x] 5.3 Keep the existing weighted scoring logic (`calculateScoreForCandidate`) operating on the reduced candidate set
- [x] 5.4 Keep the in-memory platform filtering (`filterGamesByPlatform`) applied after scoring, as specified

## 6. Verification

- [x] 6.1 Run `pnpm lint` and fix any lint issues
- [x] 6.2 Run `pnpm typecheck` and fix any type errors
- [x] 6.3 Start dev server and verify public game listing loads (popularity sort)
- [x] 6.4 Verify game detail page loads by slug
- [x] 6.5 Verify recommendations endpoint returns results
- [x] 6.6 Verify admin game listing with platform filter works
