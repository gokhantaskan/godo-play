import type {
  DbGame,
  DbGameWithRelations as BaseGameSubmissionWithRelations,
} from "~~/server/db/schema/tables/games";

export type { DbGame as GameSubmission };
export interface GameSubmissionWithRelations
  extends BaseGameSubmissionWithRelations {
  gameSubmissionGameModes: Array<{
    gameModeId: number;
    gameMode: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
}
export type GameSubmissionResponse = GameSubmissionWithRelations[];

// Only define types that are specific to the frontend and not covered by the database schema
export interface GameSubmissionUIState {
  isEditing: boolean;
  isDeleting: boolean;
  hasError: boolean;
}

// These types should match the schema in GameSubmissionWithRelationsSchema
export interface GameSubmissionPlatform {
  id: number;
  name: string;
  slug: string;
}

export interface GameSubmissionPlatformGroupPlatform {
  platform: GameSubmissionPlatform;
}

export interface GameSubmissionPlatformGroup {
  id: number;
  platformGroupPlatforms: GameSubmissionPlatformGroupPlatform[];
}

export interface GameSubmissionCrossplayEntry {
  platform: GameSubmissionPlatform;
}

export interface GameSubmissionPCStorePlatform {
  id: number;
  storeSlug: string;
  crossplayEntries: GameSubmissionCrossplayEntry[];
}

// Type guard to check if a submission has relations
export function hasRelations(
  submission: DbGame | GameSubmissionWithRelations
): submission is GameSubmissionWithRelations {
  return "platformGroups" in submission;
}
