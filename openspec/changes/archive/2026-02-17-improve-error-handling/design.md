## Context

The codebase has a server-side error utility module (`server/utils/errorHandler.ts`) with specialized handlers for Zod validation, database, auth, external API, and unknown errors. Despite being well-designed, **none of these utilities are imported or called** in any of the 21 API route files that contain `catch` blocks. Each route manually duplicates Zod error reduction, status code assignment, and dev-only stack trace logic. On the client side, `console.error` is the only error handling in 16+ locations — no structured error extraction or user-facing feedback exists.

## Goals / Non-Goals

**Goals:**

- Every API route uses `handleError()` or a specific handler from `errorHandler.ts` instead of ad-hoc error construction
- Zod validation errors always produce `{ statusCode: 400, message: "Validation Error", data: { errors: Record<string, string> } }`
- Client code can extract typed error details from `$fetch` / `useFetch` failures via a shared composable
- Users see meaningful feedback when mutations fail (form submissions, status updates, deletions)

**Non-Goals:**

- External error tracking (Sentry, LogRocket, etc.)
- Retry/recovery logic or optimistic updates
- Changes to `error.vue` (route-level error page)
- Changes to auth middleware error handling
- Adding a full notification/toast UI library
- Database schema changes or migrations
- Caching strategy changes

## Decisions

### 1. Refactor `handleError()` to throw instead of return

**Current:** `handleError()` and friends return plain objects — callers must remember to `throw createError(handleError(e))`. This is error-prone and why nobody uses them.

**Decision:** Refactor handlers to `throw createError(...)` directly. The catch block becomes `catch (error) { throwApiError(error) }`.

**Rationale:** A single `throw` call is harder to misuse than a return-then-throw pattern. The existing `handleError` function already classifies errors correctly — it just needs to throw instead of return. Routes that need custom messages can still use the specialized handlers directly (e.g., `throwDatabaseError(error, "Failed to update game")`).

**Alternatives considered:**

- _Nuxt/H3 error middleware_: H3 has no global `onError` hook that can catch inside `defineEventHandler`. Each route must handle its own errors.
- _Wrapper function around defineEventHandler_: e.g., `defineApiHandler(async (event) => { ... })` that auto-catches. Adds indirection and a non-standard pattern. The throw-based approach is simpler and keeps standard Nuxt conventions.

### 2. Standardize on `readValidatedBody` where possible

**Current:** Only 2 of ~10 mutation routes use `readValidatedBody`. The rest do `schema.parse(await readBody(event))` inside a try/catch.

**Decision:** Prefer `readValidatedBody(event, schema.parse)` for body validation. H3 automatically catches the ZodError and produces a 400 response with validation details. For routes that need custom error messages or multi-step validation, keep the manual parse + `throwApiError` pattern.

**Rationale:** Reduces boilerplate and leverages H3's built-in validation support. The auto-thrown error from `readValidatedBody` uses H3's format, which is close enough to the project's `{ statusCode, message, data }` convention.

### 3. Typed `ApiErrorResponse` interface in `shared/types/`

**Decision:** Define an `ApiErrorResponse` interface that matches the server error shape:

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

**Rationale:** Both server utilities and the client composable reference the same shape. Placing it in `shared/types/` follows the project's single source of truth pattern. Uses `interface` per project convention (no enums, prefer interfaces).

### 4. `useApiError` composable for client-side error extraction

**Decision:** Create `app/composables/useApiError.ts` that:

- Accepts a caught error (from `$fetch` catch or `useFetch` error ref)
- Extracts `statusCode`, `message`, and `data.errors` from the `FetchError` response
- Exposes reactive `error`, `message`, `fieldErrors`, and a `clear()` method
- Provides a helper `extractApiError(error: unknown): ApiErrorResponse | null` for one-shot extraction

**Rationale:** `$fetch` throws `FetchError` with a `response` property containing the server error. `useFetch` returns an `error` ref containing the same. A composable keeps extraction logic centralized. Components call `useApiError()` to get reactive state, or `extractApiError(e)` in a catch block for one-off checks.

**Alternatives considered:**

- _Global fetch interceptor plugin_: Could auto-show toasts for all errors. But many fetch calls (data loading) should NOT show toasts — only mutations should. A composable gives per-call control.

### 5. Lightweight toast notification via provide/inject

**Decision:** Build a minimal toast system using Vue's provide/inject:

- `app/composables/useToast.ts` — `useToast()` returns `{ show(message, type) }`
- `app/components/The/TheToastContainer.vue` — renders toast stack, placed in `app.vue`
- Types: `success`, `error`, `warning`
- Auto-dismiss after 5s, manual dismiss on click
- Styled with existing Tailwind utilities (`tw:` prefix)

**Rationale:** The project has no UI component library (uses Headless UI for behavior, not pre-styled components). Adding a full toast library (e.g., vue-toastification) introduces a dependency for a simple need. A ~50-line composable + component is sufficient and stays consistent with the project's lightweight approach. Headless UI's `Transition` can handle enter/leave animations.

**Alternatives considered:**

- _vue-toastification or vue-sonner_: External dependency for something achievable in <100 lines. The project already avoids heavy UI libraries.
- _Vuetify snackbar_: Project doesn't use Vuetify.

### 6. Remove duplicate `isH3ErrorLike` from IGDB route

**Decision:** Delete the local `isH3ErrorLike` in `server/api/igdb/[...].ts` and import from `server/utils/errorHandler.ts`. Nitro auto-imports from `server/utils/` so no explicit import needed.

## Risks / Trade-offs

**[Custom toast vs. library]** → The custom toast is intentionally minimal. If requirements grow (progress toasts, action buttons, queuing), we'd need to either extend it or adopt a library. For now, error/success/warning covers the use cases.

**[21 route files to refactor]** → Large surface area but each change is mechanical (replace catch block internals). No behavioral changes — just routing to the shared handler. Can be done incrementally per route group.

**[`readValidatedBody` error format]** → H3's auto-thrown validation error has a slightly different shape than `customZodErrorWithData`. Routes using `readValidatedBody` will produce H3's native format. The client composable should handle both shapes.

**[No automated tests]** → The project has no test suite. Regressions from refactoring catch blocks would only surface at runtime. Mitigation: manual testing of each route group after refactoring, and keeping the refactoring purely mechanical.

## Open Questions

- Should the toast position be top-right or bottom-right? (Minor UI decision, can default to bottom-right and adjust.)
- Should `readValidatedBody` be adopted universally, or only for simple single-schema routes? (Recommend: only where it's a clean fit — routes with multi-step validation keep manual parse.)
