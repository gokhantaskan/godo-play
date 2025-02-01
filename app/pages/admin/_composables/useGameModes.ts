import { createSharedComposable } from "@vueuse/core";

import type { GameMode } from "~~/server/db/schema";

export const useGameModes = createSharedComposable(() => {
  const { data, refresh } = useAsyncData("game-modes", () =>
    $fetch<GameMode[]>("/api/game-modes").then(data =>
      data.sort((a, b) => a.id - b.id)
    )
  );

  return {
    data,
    refresh,
  };
});
