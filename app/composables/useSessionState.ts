import { useSessionStorage } from "@vueuse/core";

import { GAME_MODES_STORAGE_KEY, STORES_STORAGE_KEY } from "~/constants";

export function useSessionState() {
  const sessionGameModes = useSessionStorage<ReadGameMode[]>(
    GAME_MODES_STORAGE_KEY,
    []
  );

  const sessionStores = useSessionStorage<ReadStore[]>(STORES_STORAGE_KEY, []);

  return {
    gameModes: sessionGameModes,
    stores: sessionStores,
  };
}
