## ADDED Requirements

### Requirement: Explicit connection pool configuration

The database connection in `server/db/index.ts` SHALL use an explicit `pg.Pool` instance instead of the `drizzle({ connection: ... })` shorthand. The pool SHALL be passed to `drizzle()` via the `client` option.

#### Scenario: Pool is created with explicit settings

- **WHEN** the database module is initialized
- **THEN** a `pg.Pool` instance SHALL be created with `max`, `idleTimeoutMillis`, and `connectionTimeoutMillis` parameters explicitly set

#### Scenario: Drizzle receives the pool as client

- **WHEN** `drizzle()` is called
- **THEN** it SHALL receive `{ client: pool, schema, casing: 'snake_case' }` instead of `{ connection: { connectionString } }`

### Requirement: Configurable pool size via environment variable

The maximum pool size SHALL default to `20` and be overridable via the `POSTGRES_POOL_MAX` environment variable.

#### Scenario: Default pool size

- **WHEN** `POSTGRES_POOL_MAX` is not set
- **THEN** the pool SHALL use `max: 20`

#### Scenario: Custom pool size from environment

- **WHEN** `POSTGRES_POOL_MAX` is set to `"10"`
- **THEN** the pool SHALL use `max: 10`

### Requirement: Connection timeout and idle settings

The pool SHALL be configured with:

- `idleTimeoutMillis: 30000` (30 seconds) — close idle connections after 30s
- `connectionTimeoutMillis: 5000` (5 seconds) — fail fast if no connection available within 5s

#### Scenario: Idle connection cleanup

- **WHEN** a connection has been idle for more than 30 seconds
- **THEN** the pool SHALL release that connection

#### Scenario: Connection timeout under load

- **WHEN** all pool connections are in use and a new query is requested
- **THEN** the pool SHALL wait up to 5 seconds for a connection, then throw an error if none becomes available

### Requirement: SSL configuration preserved

The existing SSL configuration logic SHALL be preserved: SSL is enabled with `{ rejectUnauthorized: false }` when `POSTGRES_SSL=true`, and disabled otherwise.

#### Scenario: SSL enabled

- **WHEN** `POSTGRES_SSL` is `"true"`
- **THEN** the pool SHALL connect with `ssl: { rejectUnauthorized: false }`

#### Scenario: SSL disabled

- **WHEN** `POSTGRES_SSL` is not `"true"`
- **THEN** the pool SHALL connect with `ssl: false`
