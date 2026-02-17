/**
 * This file serves as a central hub for all types in the application,
 * organized into Insert (for creating/updating) and Read (for retrieving) types.
 */

import type {
  GameGameMode as DbGameGameMode,
  GameMode as DbGameMode,
  InsertGameGameMode,
  InsertGameMode,
} from "~~/server/db/schema/tables/gameModes";
import type { DbGame, DbInsertGame } from "~~/server/db/schema/tables/games";
import type {
  InsertPlatformGroup,
  InsertPlatformGroupPlatform,
  PlatformGroup as DbPlatformGroup,
  PlatformGroupPlatform as DbPlatformGroupPlatform,
} from "~~/server/db/schema/tables/platformGroups";
import type {
  InsertPlatform,
  Platform as DbPlatform,
} from "~~/server/db/schema/tables/platforms";
import type {
  InsertStorePlatform,
  StorePlatform as DbStorePlatform,
} from "~~/server/db/schema/tables/storePlatforms";
import type {
  InsertStore,
  Store as DbStore,
} from "~~/server/db/schema/tables/stores";

/**
 * READ TYPES
 * These types are used when retrieving data from the database
 */

// Core Types
export type ReadGame = DbGame;
export type ReadPlatform = DbPlatform;
export type ReadStore = DbStore;
export type ReadGameMode = DbGameMode;

// Relation Types
export type ReadPlatformGroup = DbPlatformGroup;
export type ReadPlatformGroupPlatform = DbPlatformGroupPlatform;
export type ReadStorePlatform = DbStorePlatform;
export type ReadGameGameMode = DbGameGameMode;

// UI Types
export interface GameUIState {
  isEditing: boolean;
  isDeleting: boolean;
  hasError: boolean;
}

/**
 * INSERT TYPES
 * These types are used when creating or updating data in the database
 */

// Core Types
export type InsertGame = DbInsertGame;
export type { InsertGameMode, InsertPlatform, InsertStore };

// Relation Types
export type {
  InsertGameGameMode,
  InsertPlatformGroup,
  InsertPlatformGroupPlatform,
  InsertStorePlatform,
};

// Game Types
export interface NewGame {
  name: string;
  slug: string;
  external: {
    igdbId: number;
    igdbImageId?: string;
    igdbAggregatedRating?: number;
  };
  platformGroups: Array<{
    platforms: Array<{ id: number }>;
  }>;
  storePlatforms: Array<{
    storeSlug: string;
    crossplayPlatforms: Array<{ id: number }>;
  }>;
  gameModes: Array<{ id: number }>;
}

/**
 * Complete Types with Relations
 */
export interface GameWithRelations extends ReadGame {
  crossplayInformation: {
    evidenceUrl: string | null;
    information: string | null;
    isOfficial: boolean | null;
  } | null;
  platformGroups: Array<{
    id: number;
    platformGroupPlatforms: Array<{
      platform: {
        id: number;
        name: string;
        slug: string;
      };
    }>;
  }>;
  storePlatforms: Array<{
    id: number;
    storeUrl: string | null;
    store: {
      id: number;
      name: string;
      slug: string;
    };
    crossplayEntries: Array<{
      platform: {
        id: number;
        name: string;
        slug: string;
      };
    }>;
  }>;
  gameGameModes: Array<{
    gameModeId: number;
    gameMode: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  tags?: Array<{
    tagId: number;
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
}

/**
 * Type Guards
 */
export function hasRelations(
  game: ReadGame | GameWithRelations
): game is GameWithRelations {
  return "platformGroups" in game;
}

export interface ReadTag {
  id: number;
  name: string;
  slug: string;
}
