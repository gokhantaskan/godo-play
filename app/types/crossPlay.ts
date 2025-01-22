import type { SUPPORTED_PLATFORMS } from "~~/shared/constants";

// Available gaming platforms
export type PlatformId = (typeof SUPPORTED_PLATFORMS)[number]["id"];

// Platforms that can connect to PC stores
export type ConsolePlatformId = Exclude<PlatformId, 6>;

// Available PC stores
export type PCStore =
  | "steam"
  | "epic_game_store"
  | "microsoft"
  | "gog"
  | "battlenet"
  | "origin";

// Cross-progression data structure
export interface CrossProgression {
  enabled: boolean;
  platforms: PlatformId[];
}

// PC store cross-play information
export interface PCStoreInfo {
  available: boolean;
  crossplay_platforms: ConsolePlatformId[];
}

// Individual game cross-play data
export interface GameCrossplay {
  platform_groups: PlatformId[][];
  cross_progression: CrossProgression;
  pc_stores: {
    [Store in PCStore]: PCStoreInfo;
  };
}

// Complete cross-play database
export type CrossplayDatabase = {
  [GameName: string]: GameCrossplay;
};
