## ADDED Requirements

### Requirement: Throw-based error handlers

`server/utils/errorHandler.ts` SHALL export throw-based handler functions that call `createError()` internally and throw the result. The following functions SHALL be provided:

- `throwApiError(error: unknown)` — classifies the error (ZodError, H3Error, generic) and throws the appropriate `createError()`. This is the primary catch-all handler.
- `throwValidationError(error: ZodError)` — throws a 400 error with `{ data: { errors: Record<string, string> } }` using the flattened path→message format.
- `throwDatabaseError(error: unknown, message?: string)` — throws a 500 error with the provided message, including stack trace in development only.
- `throwExternalApiError(error: unknown, service: string)` — throws a 502 error identifying the failing service.

Existing return-based functions (`handleError`, `customZodErrorWithData`, etc.) SHALL be removed after all callers are migrated.

#### Scenario: ZodError caught in API route

- **WHEN** a `ZodError` is thrown during request handling and caught by the route's `catch` block
- **THEN** calling `throwApiError(error)` SHALL throw an H3 error with `statusCode: 400`, `message: "Validation Error"`, and `data.errors` as `Record<string, string>` mapping field paths to messages

#### Scenario: Database error caught in API route

- **WHEN** a database operation throws and the route calls `throwDatabaseError(error, "Failed to create game")`
- **THEN** the thrown H3 error SHALL have `statusCode: 500`, `message: "Failed to create game"`, and `data.stack` present only when `NODE_ENV === "development"`

#### Scenario: H3Error re-thrown

- **WHEN** an already-formed H3 error (e.g., from auth middleware) reaches `throwApiError`
- **THEN** it SHALL be re-thrown as-is without wrapping or modifying its status code or message

#### Scenario: Unknown non-Error value caught

- **WHEN** a non-Error value (string, number, undefined) reaches `throwApiError`
- **THEN** it SHALL throw an H3 error with `statusCode: 500` and `message: "An unexpected error occurred"`

### Requirement: Standardized Zod validation error format

All API routes SHALL produce Zod validation errors in a single canonical format:

```json
{
  "statusCode": 400,
  "message": "Validation Error",
  "data": {
    "errors": {
      "fieldPath": "Error message",
      "nested.field": "Error message"
    }
  }
}
```

The `errors` object SHALL use dot-notation paths (from `ZodIssue.path.join(".")`) as keys and the issue message as values. No route SHALL use `z.treeifyError()`, raw `error.issues`, or any other Zod error format.

#### Scenario: Multi-field validation failure

- **WHEN** a request body fails Zod validation on fields `name` (required) and `platformGroups.0.platforms` (too few)
- **THEN** the response SHALL contain `data.errors` with keys `"name"` and `"platformGroups.0.platforms"`, each mapping to the respective Zod issue message

#### Scenario: Single-field validation failure

- **WHEN** a request body has exactly one invalid field
- **THEN** the response format SHALL be identical to the multi-field case (always `data.errors` object, never a flat string message)

### Requirement: Consistent catch blocks across API routes

Every API route handler that performs fallible operations SHALL use a `catch` block that delegates to the shared error handlers. The pattern SHALL be:

```typescript
catch (error) {
  throwApiError(error);
}
```

Routes that need a custom error message for database operations SHALL use the specific handler:

```typescript
catch (error) {
  if (error instanceof ZodError) throwValidationError(error);
  throwDatabaseError(error, "Failed to update game");
}
```

No route SHALL manually construct error objects with inline `createError()` calls in catch blocks.

#### Scenario: Existing route with ad-hoc error handling

- **WHEN** an API route currently has a catch block that manually checks `instanceof ZodError`, reduces issues, and calls `createError` inline
- **THEN** after refactoring, the catch block SHALL delegate to `throwApiError(error)` or specific throw helpers, with no inline `createError` calls

#### Scenario: Route using readValidatedBody

- **WHEN** a mutation route uses `readValidatedBody(event, schema.parse)` for body validation
- **THEN** the route SHALL NOT have a separate Zod catch — H3 handles the validation error automatically. The catch block only needs to handle post-validation errors (database, external API).

### Requirement: No duplicate utility definitions

Type guards and error utilities SHALL exist in exactly one location (`server/utils/errorHandler.ts`). Duplicate definitions in individual route files (e.g., `isH3ErrorLike` in `server/api/igdb/[...].ts`) SHALL be removed. Nitro auto-imports from `server/utils/` make explicit imports unnecessary.

#### Scenario: IGDB route duplicate removal

- **WHEN** `server/api/igdb/[...].ts` contains a local `isH3ErrorLike` function
- **THEN** the local definition SHALL be deleted and all usages in that file SHALL resolve to the auto-imported version from `server/utils/errorHandler.ts`

### Requirement: ApiErrorResponse shared type

`shared/types/` SHALL export an `ApiErrorResponse` interface representing the canonical server error shape:

```typescript
interface ApiErrorResponse {
  statusCode: number;
  message: string;
  data?: {
    errors?: Record<string, string>;
    error?: string;
  };
}
```

This type SHALL be the single source of truth referenced by both server error handlers and client error extraction logic.

#### Scenario: Type used by server error handlers

- **WHEN** a throw-based error handler constructs the error payload
- **THEN** the payload shape SHALL conform to `ApiErrorResponse`

#### Scenario: Type used by client composable

- **WHEN** the client extracts error details from a `FetchError`
- **THEN** the extracted object SHALL be typed as `ApiErrorResponse`
