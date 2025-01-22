export interface SubmitGamePayload {
  game: {
    id: number;
    name: string;
    slug: string;
    imageId?: string;
  };
  platformGroups: number[][];
  pcStoresPlatforms: Record<
    string,
    {
      crossplayPlatforms: number[];
    }
  >;
}
