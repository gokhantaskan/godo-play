import type { PlatformId } from "~/types/crossPlay";
import type { StoreHardcoded } from "~~/shared/types/globals";

export type Store = StoreHardcoded;
export type PlatformGroups = PlatformId[][];

export type StoreData = Partial<
  Record<
    StoreHardcoded["slug"],
    {
      crossplayPlatforms: PlatformId[];
    }
  >
>;

export interface GameSubmissionData {
  name: string;
  slug: string;
  external: {
    igdbId: number;
    igdbImageId?: string;
    igdbAggregatedRating?: number;
  };
}

export interface SubmitGamePayload {
  game: GameSubmissionData;
  platformGroups: PlatformGroups;
  storesPlatforms: StoreData;
  gameModeIds: number[];
  token: string;
}

export interface SubmitGameFormData {
  platformGroups: PlatformGroups;
  stores: StoreHardcoded["slug"][];
  storePlatforms: StoreData;
  gameModeIds: number[];
}
