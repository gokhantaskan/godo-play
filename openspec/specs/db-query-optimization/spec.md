## ADDED Requirements

### Requirement: Recommendations endpoint SQL pre-filtering

The recommendations endpoint (`/api/public/games/recommendations`) SHALL pre-filter candidate games in SQL using subqueries instead of loading all games into memory.

The SQL filter SHALL select games that share at least one tag OR at least one game mode with the source game (excluding the source game itself).

#### Scenario: Pre-filter by shared tags and game modes

- **WHEN** a recommendation request is made for a game with tags `[1, 3]` and game modes `[100, 101]`
- **THEN** the SQL query SHALL only return games that have at least one tag in `[1, 3]` OR at least one game mode in `[100, 101]`
- **AND** the source game SHALL be excluded from results

#### Scenario: SQL LIMIT applied to candidate set

- **WHEN** the recommendation limit is `3`
- **THEN** the SQL query SHALL fetch at most `5 * 3 = 15` candidate games (5x over-fetch buffer)
- **AND** the weighted scoring logic SHALL rank the candidates in memory and return the top 3

#### Scenario: Source game has no tags or game modes

- **WHEN** the source game has no tags and no game modes
- **THEN** the endpoint SHALL return an empty array without executing the candidate query

### Requirement: Platform filtering uses SQL GROUP BY/HAVING in all endpoints

All endpoints that filter games by platform SHALL use a SQL `GROUP BY`/`HAVING` subquery approach. In-memory platform filtering (fetching platform_group_platforms and filtering in JavaScript) SHALL NOT be used.

#### Scenario: Admin game listing with platform filter

- **WHEN** the admin games endpoint (`/api/games/index.get`) receives `platforms=1,2`
- **THEN** it SHALL use a SQL subquery with `GROUP BY platform_group_id HAVING COUNT(DISTINCT platform_id) >= 2` to find matching platform groups
- **AND** it SHALL NOT fetch all platform_group_platforms into memory for filtering

#### Scenario: Public game listing with platform filter

- **WHEN** the public games endpoint (`/api/public/games/index.get`) receives `platforms=1,2`
- **THEN** it SHALL continue using the existing SQL `GROUP BY`/`HAVING` subquery approach (no change)

#### Scenario: Consistent results between admin and public endpoints

- **WHEN** the same platform filter is applied to both admin and public endpoints
- **THEN** the set of matching game IDs SHALL be identical (assuming the same status filter)

### Requirement: Recommendations endpoint preserves response shape

The refactored recommendations endpoint SHALL return the same response structure as the current implementation. No fields SHALL be added or removed from the response.

#### Scenario: Response includes game data with official flag

- **WHEN** a recommendation request returns results
- **THEN** each result SHALL include game fields (id, name, slug, external, status, category, firstReleaseDate, freeToPlay), relation data (platformGroups, storePlatforms, gameSubmissionGameModes, tags), and the `official` boolean flag derived from `crossplayInformation.isOfficial`

#### Scenario: Empty recommendations

- **WHEN** no candidate games score above 0 after filtering and scoring
- **THEN** the endpoint SHALL return an empty array `[]`

### Requirement: Recommendations in-memory platform filtering preserved

The recommendations endpoint's optional platform filtering (via `platforms` query parameter) SHALL continue to filter results in memory after scoring, since platform filtering for recommendations is post-hoc and applies to the final result set, not the candidate query.

#### Scenario: Platform filter applied after scoring

- **WHEN** a recommendation request includes `platforms=1,2`
- **THEN** the SQL pre-filter SHALL fetch candidates by shared tags/game modes
- **AND** platform filtering SHALL be applied in memory to the scored results before returning

#### Scenario: No platform filter

- **WHEN** a recommendation request does not include a `platforms` parameter
- **THEN** no platform filtering SHALL be applied and all scored results above 0 SHALL be returned (up to the limit)
