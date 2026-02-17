import type { GameWithRelations } from ".";

/**
 * Response type for paginated games list
 */
export interface GamesResponse {
  total: number; // Total number of filtered games
  count: number; // Number of games in current page
  data: GameWithRelations[]; // Array of game data
  limit: number; // Limit used for pagination
  offset: number; // Current offset for pagination
}

/**
 * Platform with essential fields for UI
 */
export interface GamePlatform {
  id: number;
  name: string;
  slug: string;
}

/**
 * Platform group with its associated platforms
 */
export interface GamePlatformGroup {
  id: number;
  platformGroupPlatforms: Array<{
    platform: GamePlatform;
  }>;
}

/**
 * Crossplay entry with platform information
 */
export interface GameCrossplayEntry {
  platform: GamePlatform;
}

/**
 * PC Store platform with crossplay information
 */
export interface GameStorePlatform {
  id: number;
  storeUrl?: string | null;
  store: {
    id: number;
    name: string;
    slug: string;
  };
  crossplayEntries: GameCrossplayEntry[];
}

/**
 * Game mode with essential fields
 */
export interface GameGameModeEntry {
  gameModeId: number;
  gameMode: {
    id: number;
    name: string;
    slug: string;
  };
}

export type GameListResponse = GameWithRelations[];
