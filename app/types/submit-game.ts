import type { GameOption } from "~/components/SubmitGame/SubmitGameAutocomplete.vue";
import type { PlatformId } from "~/types/crossPlay";
import type { SUPPORTED_PC_STORES } from "~~/shared/constants";

export type PCStore = (typeof SUPPORTED_PC_STORES)[number];

export type PlatformGroups = PlatformId[][];

export type PCStoreData = Partial<
  Record<
    PCStore["slug"],
    {
      crossplayPlatforms: PlatformId[];
    }
  >
>;

export interface SubmitGamePayload {
  game: GameOption;
  platformGroups: PlatformGroups;
  pcStoresPlatforms: PCStoreData;
}
