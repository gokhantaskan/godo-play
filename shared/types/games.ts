import type { GameSubmissionWithRelations } from ".";

/**
 * Platform with essential fields for UI
 */
export interface GameSubmissionPlatform {
  id: number;
  name: string;
  slug: string;
}

/**
 * Platform group with its associated platforms
 */
export interface GameSubmissionPlatformGroup {
  id: number;
  platformGroupPlatforms: Array<{
    platform: GameSubmissionPlatform;
  }>;
}

/**
 * Crossplay entry with platform information
 */
export interface GameSubmissionCrossplayEntry {
  platform: GameSubmissionPlatform;
}

/**
 * PC Store platform with crossplay information
 */
export interface GameSubmissionPCStorePlatform {
  id: number;
  storeSlug: string;
  crossplayEntries: GameSubmissionCrossplayEntry[];
}

/**
 * Game mode with essential fields
 */
export interface GameSubmissionGameMode {
  gameModeId: number;
  gameMode: {
    id: number;
    name: string;
    slug: string;
  };
}

export type GameSubmissionResponse = GameSubmissionWithRelations[];
