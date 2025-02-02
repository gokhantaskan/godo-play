import { createSharedComposable } from "@vueuse/core";

import type { GameMode } from "~~/server/db/schema";

export const useGameModes = createSharedComposable(() => {
  return useFetch<GameMode[]>("/api/game-modes");
});
