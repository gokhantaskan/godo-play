## Why

Server-side error utilities (`server/utils/errorHandler.ts`) exist but are **never used** — every API route manually duplicates Zod error reduction, database error wrapping, and status code assignment. Zod validation errors are formatted three different ways across routes. On the client side, API errors are silently swallowed with `console.error` and users see only generic "something went wrong" messages, even when the server returns structured validation details.

## What Changes

- **Adopt existing error utilities** across all API routes — replace ad-hoc `try/catch` blocks with `handleError()`, `customZodErrorWithData()`, and specialized handlers from `errorHandler.ts`
- **Standardize Zod error format** — eliminate `z.treeifyError()` and raw `error.issues` variants; use `Record<string, string>` consistently
- **Add client-side error composable** — `useApiError()` to extract structured errors from `$fetch` / `useFetch` failures and expose them reactively
- **Add user-facing error feedback** — integrate a notification/toast system so mutations (submit, update, delete) show meaningful error messages instead of failing silently
- **Remove duplicate type guard** — consolidate `isH3ErrorLike()` (defined in both `errorHandler.ts` and `api/igdb/[...].ts`)

## Non-goals

- External error tracking / monitoring (e.g., Sentry) — out of scope for now
- Retry logic or automatic error recovery
- Changes to the global `error.vue` page (route-level errors)
- Changing auth error handling (already consistent)

## Capabilities

### New Capabilities

- `api-error-handling`: Server-side error handling — consistent use of error utilities, standardized Zod format, unified `try/catch` patterns across all API routes
- `client-error-feedback`: Client-side error composable and user-facing notification system for API mutation failures

### Modified Capabilities

_(none — no existing specs are affected)_

## Impact

- **`server/api/`** — All 22+ route handlers refactored to use shared error utilities
- **`server/utils/errorHandler.ts`** — Minor updates (remove dead code, ensure exports cover all use cases)
- **`server/api/igdb/[...].ts`** — Remove duplicate `isH3ErrorLike` definition
- **`app/composables/`** — New `useApiError` composable
- **`app/components/`** — Form and mutation components updated to display error feedback
- **`shared/types/`** — New `ApiError` interface for typed error responses on the client
