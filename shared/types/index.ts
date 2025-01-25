/**
 * This file serves as a central hub for all types in the application,
 * organized into Insert (for creating/updating) and Read (for retrieving) types.
 */

import type {
  GameMode as DbGameMode,
  GameSubmissionGameMode as DbGameSubmissionGameMode,
  InsertGameMode,
  InsertGameSubmissionGameMode,
} from "~~/server/db/schema/tables/gameModes";
import type { DbGame, DbInsertGame } from "~~/server/db/schema/tables/games";
import type {
  InsertPcStorePlatform,
  PcStorePlatform as DbPcStorePlatform,
} from "~~/server/db/schema/tables/pcStorePlatforms";
import type {
  InsertPcStore,
  PcStore as DbPcStore,
} from "~~/server/db/schema/tables/pcStores";
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

/**
 * READ TYPES
 * These types are used when retrieving data from the database
 */

// Core Types
export type ReadGame = DbGame;
export type ReadPlatform = DbPlatform;
export type ReadPcStore = DbPcStore;
export type ReadGameMode = DbGameMode;

// Relation Types
export type ReadPlatformGroup = DbPlatformGroup;
export type ReadPlatformGroupPlatform = DbPlatformGroupPlatform;
export type ReadPcStorePlatform = DbPcStorePlatform;
export type ReadGameSubmissionGameMode = DbGameSubmissionGameMode;

// UI Types
export interface GameSubmissionUIState {
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
export type { InsertGameMode, InsertPcStore, InsertPlatform };

// Relation Types
export type {
  InsertGameSubmissionGameMode,
  InsertPcStorePlatform,
  InsertPlatformGroup,
  InsertPlatformGroupPlatform,
};

// Submission Types
export interface NewGameSubmission {
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
  pcStorePlatforms: Array<{
    storeSlug: string;
    crossplayPlatforms: Array<{ id: number }>;
  }>;
  gameModes: Array<{ id: number }>;
}

/**
 * Complete Types with Relations
 */
export interface GameSubmissionWithRelations extends ReadGame {
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
  pcStorePlatforms: Array<{
    id: number;
    storeSlug: string;
    crossplayEntries: Array<{
      platform: {
        id: number;
        name: string;
        slug: string;
      };
    }>;
  }>;
  gameSubmissionGameModes: Array<{
    gameModeId: number;
    gameMode: {
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
  submission: ReadGame | GameSubmissionWithRelations
): submission is GameSubmissionWithRelations {
  return "platformGroups" in submission;
}
