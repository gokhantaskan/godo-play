export const QUERY_KEYS = {
  DashboardGames: "/api/public/games",
  IGDBGame: (slug: string) => `/api/public/igdb/${slug}`,
  DbGame: (slug: string) => `/api/public/games/${slug}`,
} as const;
