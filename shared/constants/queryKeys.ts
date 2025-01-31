export const QUERY_KEYS = {
  DashboardGames: "dashboard-games",
  IGDBGame: (slug: string) => `/api/games/igdb/${slug}`,
  DbGame: (slug: string) => `/api/game-details/${slug}`,
} as const;
