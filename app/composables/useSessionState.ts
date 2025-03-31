import { useSessionStorage } from "@vueuse/core";

import {
  GAME_MODES_STORAGE_KEY,
  STORES_STORAGE_KEY,
  TAGS_STORAGE_KEY,
} from "~/constants";
import type { ReadTag } from "~~/shared/types";

export function useSessionState() {
  const sessionGameModes = useSessionStorage<ReadGameMode[]>(
    GAME_MODES_STORAGE_KEY,
    []
  );

  const sessionStores = useSessionStorage<ReadStore[]>(STORES_STORAGE_KEY, []);

  const sessionTags = useSessionStorage<ReadTag[]>(TAGS_STORAGE_KEY, []);

  return {
    gameModes: sessionGameModes,
    stores: sessionStores,
    tags: sessionTags,
  };
}
