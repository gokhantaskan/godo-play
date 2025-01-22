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
  token: string;
}
