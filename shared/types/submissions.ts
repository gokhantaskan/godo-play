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

export interface GameSubmission {
  id: number;
  gameId: string;
  gameName: string;
  gameSlug: string;
  gameImageId: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  platformGroups: GameSubmissionPlatformGroup[];
  pcStorePlatforms: GameSubmissionPCStorePlatform[];
}
