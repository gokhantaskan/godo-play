export interface GameSubmission {
  id: number;
  gameId: string;
  gameName: string;
  gameSlug: string;
  gameImageId: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  platformGroups: PlatformGroup[];
  pcStorePlatforms: PCStorePlatform[];
}

export interface PlatformGroup {
  id: number;
  submissionId: number;
  platforms: number[];
  createdAt: string;
  updatedAt: string;
}

export interface PCStorePlatform {
  id: number;
  submissionId: number;
  storeSlug: string;
  crossplayPlatforms: number[];
  createdAt: string;
  updatedAt: string;
}
