import type { PlatformId } from "~/types/crossPlay";
import type { PcStoreHardcoded } from "~~/shared/types/globals";

export type PCStore = PcStoreHardcoded;

export type PlatformGroups = PlatformId[][];

export type PCStoreData = Partial<
  Record<
    PCStore["slug"],
    {
      crossplayPlatforms: PlatformId[];
    }
  >
>;

export interface GameSubmissionData {
  id: number;
  name: string;
  slug: string;
  imageId?: string;
}

export interface SubmitGamePayload {
  game: GameSubmissionData;
  platformGroups: PlatformGroups;
  pcStoresPlatforms: PCStoreData;
  gameModeIds: number[];
  token: string;
}

export interface SubmitGameFormData {
  platformGroups: PlatformGroups;
  pcStores: PCStore["slug"][];
  pcStorePlatforms: PCStoreData;
  gameModeIds: number[];
}
