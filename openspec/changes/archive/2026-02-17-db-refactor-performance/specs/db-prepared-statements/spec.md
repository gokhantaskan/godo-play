## ADDED Requirements

### Requirement: Prepared statement for game lookup by slug

A prepared statement SHALL be defined for looking up a single game by its `slug` field, including all relational data (platform groups, store platforms, game modes, tags, crossplay information).

The prepared statement SHALL use `sql.placeholder('slug')` for the dynamic parameter and be named `get_game_by_slug`.

#### Scenario: Game found by slug

- **WHEN** the prepared statement is executed with `{ slug: 'some-game-slug' }`
- **THEN** it SHALL return the game with all relations (platform groups with platforms, store platforms with crossplay entries, game modes, tags, crossplay information)

#### Scenario: Game not found

- **WHEN** the prepared statement is executed with a slug that does not exist
- **THEN** it SHALL return `undefined`

#### Scenario: Repeated execution reuses compiled query

- **WHEN** the prepared statement is executed multiple times with different slug values
- **THEN** the SQL SHALL be compiled only once by the database driver, with subsequent calls reusing the prepared plan

### Requirement: Prepared statements module location

All prepared statements SHALL be defined in `server/db/prepared.ts` and exported for use by API routes.

#### Scenario: Import and usage in API route

- **WHEN** an API route needs a prepared query
- **THEN** it SHALL import the prepared statement from `~~/server/db/prepared` and call `.execute()` with the required parameters

#### Scenario: Module exports

- **WHEN** `server/db/prepared.ts` is inspected
- **THEN** it SHALL export named prepared statements (e.g., `getGameBySlugPrepared`) built using the `db` instance and `.prepare()` method

### Requirement: Prepared statements are read-only

Prepared statements SHALL only be created for read queries (`SELECT`). Write operations (`INSERT`, `UPDATE`, `DELETE`) SHALL continue using the standard query builder to maintain transaction compatibility.

#### Scenario: No prepared statements for mutations

- **WHEN** a game is created or updated via the admin API
- **THEN** the mutation query SHALL use the standard `db.insert()` / `db.update()` API, not a prepared statement

#### Scenario: Prepared statements work outside transactions

- **WHEN** a prepared statement is executed in a normal (non-transactional) context
- **THEN** it SHALL execute successfully and return results
