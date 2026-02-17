## 1. Shared Types

- [x] 1.1 Add `ApiErrorResponse` interface to `shared/types/` and export from `shared/types/index.ts`

## 2. Server Error Utilities

- [x] 2.1 Add throw-based handlers to `server/utils/errorHandler.ts`: `throwApiError`, `throwValidationError`, `throwDatabaseError`, `throwExternalApiError`
- [x] 2.2 Remove old return-based functions (`handleError`, `customZodErrorWithData`, `handleDatabaseError`, `handleAuthError`, `handleExternalApiError`, `handleUnknownError`) after all callers are migrated
- [x] 2.3 Remove duplicate `isH3ErrorLike` from `server/api/igdb/[...].ts`

## 3. Refactor API Route Catch Blocks — Games

- [x] 3.1 Refactor `server/api/games/index.post.ts` — use `throwApiError` / `readValidatedBody`
- [x] 3.2 Refactor `server/api/games/[id].patch.ts` — use throw helpers
- [x] 3.3 Refactor `server/api/games/[id].delete.ts` — use throw helpers
- [x] 3.4 Refactor `server/api/games/[id].get.ts` — no catch block to refactor
- [x] 3.5 Refactor `server/api/games/index.get.ts` — use throw helpers

## 4. Refactor API Route Catch Blocks — Game Modes

- [x] 4.1 Refactor `server/api/game-modes/index.post.ts` — replace raw `error.issues` with `throwApiError`
- [x] 4.2 Refactor `server/api/game-modes/[id].patch.ts` — replace `z.treeifyError` with `throwApiError`
- [x] 4.3 Refactor `server/api/game-modes/[id].delete.ts` — no catch block to refactor

## 5. Refactor API Route Catch Blocks — Tags

- [x] 5.1 Refactor `server/api/tags/index.ts` — use throw helpers
- [x] 5.2 Refactor `server/api/tags/[id].ts` — use throw helpers
- [x] 5.3 Refactor `server/api/tags/[id].patch.ts` — use throw helpers

## 6. Refactor API Route Catch Blocks — Stores, Public, IGDB, Other

- [x] 6.1 Refactor `server/api/stores/[id].patch.ts` — use throw helpers
- [x] 6.2 Refactor `server/api/stores/index.get.ts` — use throw helpers
- [x] 6.3 Refactor `server/api/public/games/index.get.ts` — use throw helpers
- [x] 6.4 Refactor `server/api/public/games/[slug].get.ts` — use throw helpers
- [x] 6.5 Refactor `server/api/public/games/recommendations.get.ts` — use throw helpers
- [x] 6.6 Refactor `server/api/public/igdb/[slug].get.ts` — use throw helpers
- [x] 6.7 Refactor `server/api/public/igdb/index.get.ts` — use throw helpers
- [x] 6.8 Refactor `server/api/igdb/[...].ts` — use throw helpers (after duplicate removal in 2.3)
- [x] 6.9 Refactor `server/api/dashboard-games.get.ts` — use throw helpers
- [x] 6.10 Refactor `server/api/auth/check.ts` and `server/api/auth/twitch.ts` — use throw helpers where applicable

## 7. Client Error Composable

- [x] 7.1 Create `app/composables/useApiError.ts` with `useApiError()` composable and `extractApiError()` helper

## 8. Toast Notification System

- [x] 8.1 Create `app/composables/useToast.ts` with provide/inject-based toast state and `show(message, type)` API
- [x] 8.2 Create `app/components/The/TheToastContainer.vue` with toast stack rendering, auto-dismiss (5s), click-to-dismiss, and type-based styling
- [x] 8.3 Add `TheToastContainer` to `app.vue` (or `app/app.vue`)

## 9. Update Mutation Components — Submissions

- [x] 9.1 Update `app/components/Submission/SubmissionListItem.vue` — replace `console.error` with toast feedback for status updates and deletes
- [x] 9.2 Update `app/components/Submission/SubmissionListItemDetails.vue` — add toast feedback for save and IGDB fetch errors

## 10. Update Mutation Components — Submit Game Form

- [x] 10.1 Update `app/components/SubmitGame/SubmitGameForm.vue` — use `useApiError` for validation errors and toast for general errors, replace generic "Failed to submit" message

## 11. Update Mutation Components — Admin Pages

- [x] 11.1 Update `app/pages/admin/_components/Admin/TagListItem.vue` — add toast on delete failure/success
- [x] 11.2 Update `app/pages/admin/_components/Admin/TagCreateForm.vue` — add error and success feedback
- [x] 11.3 Update `app/pages/admin/_components/Admin/TagUpdateForm.vue` — add error and success feedback
- [x] 11.4 Update `app/pages/admin/_components/Admin/GameModeListItem.vue` — add toast on delete failure/success
- [x] 11.5 Update `app/pages/admin/_components/Admin/GameModeCreateForm.vue` — add error and success feedback
- [x] 11.6 Update `app/pages/admin/_components/Admin/GameModeUpdateForm.vue` — add error and success feedback
- [x] 11.7 Update `app/pages/admin/tags/index.vue` — add toast on delete failure/success
- [x] 11.8 Update `app/pages/admin/stores/index.vue` — add toast on save failure/success
