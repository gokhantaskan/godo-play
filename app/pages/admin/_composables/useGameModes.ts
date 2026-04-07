import { createSharedComposable } from "@vueuse/core";

import type { DbGameMode } from "~~/server/db/schema";

export const useGameModes = createSharedComposable(() => {
  return useFetch<DbGameMode[]>("/api/game-modes");
});
