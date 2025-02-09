import type { GameSubmissionWithRelations } from ".";

/**
 * Response type for paginated games list
 */
export interface GamesResponse {
  total: number; // Total number of filtered games
  count: number; // Number of games in current page
  data: GameSubmissionWithRelations[]; // Array of game data
  limit: number; // Limit used for pagination
  offset: number; // Current offset for pagination
}

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
export interface GameSubmissionStorePlatform {
  id: number;
  storeSlug: string;
  storeUrl?: string | null;
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
