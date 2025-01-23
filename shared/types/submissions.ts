import type { Submission } from "../schemas/submission";

export type GameSubmission = Submission;

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
