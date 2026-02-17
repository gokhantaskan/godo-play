## ADDED Requirements

### Requirement: useApiError composable

`app/composables/useApiError.ts` SHALL export a `useApiError` composable that provides reactive state for API error handling, and a standalone `extractApiError` helper for one-shot extraction.

**`useApiError()` returns:**

- `error` — reactive ref holding the current `ApiErrorResponse | null`
- `message` — computed string of `error.message` or empty string
- `fieldErrors` — computed `Record<string, string>` from `error.data.errors` or empty object
- `hasError` — computed boolean
- `set(err: unknown)` — accepts a caught error, extracts the `ApiErrorResponse`, and sets state
- `clear()` — resets all state to initial values

**`extractApiError(error: unknown): ApiErrorResponse | null`** — pure function that extracts error details from a `FetchError` response body. Returns `null` if the error is not a recognized API error.

#### Scenario: Extract error from $fetch catch block

- **WHEN** `$fetch` throws a `FetchError` with response body `{ statusCode: 400, message: "Validation Error", data: { errors: { name: "Required" } } }`
- **THEN** calling `apiError.set(error)` SHALL set `message` to `"Validation Error"`, `fieldErrors` to `{ name: "Required" }`, and `hasError` to `true`

#### Scenario: Extract error from useFetch error ref

- **WHEN** `useFetch` returns an `error` ref containing an H3Error with status 500 and message "Database operation failed"
- **THEN** `extractApiError(error.value)` SHALL return `{ statusCode: 500, message: "Database operation failed" }`

#### Scenario: Non-API error passed to set

- **WHEN** `apiError.set()` receives a generic `Error` (not a `FetchError`)
- **THEN** `error` SHALL be set to `{ statusCode: 0, message: error.message }` as a fallback, and `fieldErrors` SHALL be an empty object

#### Scenario: Clear error state

- **WHEN** `apiError.clear()` is called
- **THEN** `error` SHALL be `null`, `message` SHALL be `""`, `fieldErrors` SHALL be `{}`, and `hasError` SHALL be `false`

#### Scenario: Handle H3 readValidatedBody error format

- **WHEN** the server returns an error from `readValidatedBody` (H3's native validation format)
- **THEN** `extractApiError` SHALL extract the status code and message, and attempt to parse `data.errors` if present. If the H3 format differs from the canonical `ApiErrorResponse`, the composable SHALL normalize it.

### Requirement: Toast notification system

The application SHALL provide a toast notification system for displaying transient user-facing messages. The system consists of:

- `app/composables/useToast.ts` — composable using provide/inject to access the toast state
- `app/components/The/TheToastContainer.vue` — renders the toast stack, placed in `app.vue`

#### Scenario: Show error toast

- **WHEN** a component calls `useToast().show("Failed to save changes", "error")`
- **THEN** a toast with type `error` and the given message SHALL appear in the toast container

#### Scenario: Show success toast

- **WHEN** a component calls `useToast().show("Game submitted successfully", "success")`
- **THEN** a toast with type `success` and the given message SHALL appear in the toast container

#### Scenario: Auto-dismiss after timeout

- **WHEN** a toast is displayed
- **THEN** it SHALL automatically dismiss after 5 seconds

#### Scenario: Manual dismiss

- **WHEN** the user clicks on a toast
- **THEN** the toast SHALL be dismissed immediately

#### Scenario: Multiple concurrent toasts

- **WHEN** multiple toasts are triggered before the first one dismisses
- **THEN** all toasts SHALL be visible simultaneously in a vertical stack

### Requirement: Toast types and styling

The toast system SHALL support three types: `success`, `error`, and `warning`. Each type SHALL have visually distinct styling using Tailwind utility classes (with `tw:` prefix). The toast SHALL include:

- An icon or visual indicator appropriate to the type
- The message text
- A dismiss affordance (click anywhere on the toast)

#### Scenario: Error toast appearance

- **WHEN** an error toast is displayed
- **THEN** it SHALL use error-associated styling (red tones) to clearly communicate failure

#### Scenario: Success toast appearance

- **WHEN** a success toast is displayed
- **THEN** it SHALL use success-associated styling (green tones) to clearly communicate completion

### Requirement: Mutation components show error feedback

Components that perform mutations (`$fetch` with POST, PATCH, DELETE) SHALL display meaningful error feedback to the user instead of only logging to `console.error`. This applies to:

- Form submissions (game submit, game mode create/edit, tag create/edit, store edit)
- Status updates (submission approve/reject)
- Delete operations (game delete, tag delete, game mode delete)

Each mutation catch block SHALL use `useApiError` to extract error details and `useToast` to display a user-facing message. For form submissions with validation errors, field-level errors from `fieldErrors` SHALL be displayed inline where applicable.

#### Scenario: Form submission fails with validation error

- **WHEN** a game submission fails with status 400 and field errors `{ name: "Required", slug: "Already exists" }`
- **THEN** a toast SHALL display "Validation Error" AND the form SHALL show inline errors for the `name` and `slug` fields (if the form supports inline errors)

#### Scenario: Delete operation fails

- **WHEN** a delete request fails with status 500
- **THEN** a toast SHALL display the error message (e.g., "Failed to delete game") and the item SHALL remain in the list unchanged

#### Scenario: Status update fails silently no more

- **WHEN** a submission status update (approve/reject) fails
- **THEN** a toast SHALL display the error message. The submission status SHALL NOT appear to change in the UI.

#### Scenario: Success feedback for mutations

- **WHEN** a mutation (create, update, delete) succeeds
- **THEN** a success toast SHALL be displayed confirming the action (e.g., "Game submitted successfully", "Tag deleted")
