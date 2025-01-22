import type { GameStore } from "~~/server/db/schema/tables/pcStores";
import type { Platform } from "~~/server/db/schema/tables/platforms";

export type OmitTimestamps<T> = Omit<T, "createdAt" | "updatedAt">;

export interface PlatformHardcoded extends OmitTimestamps<Platform> {
  icon: string;
}

export interface GameStoreHardcoded extends OmitTimestamps<GameStore> {
  icon: string;
}
