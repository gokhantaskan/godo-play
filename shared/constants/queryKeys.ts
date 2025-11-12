export const QUERY_KEYS = {
  DashboardGames: "/api/public/games",
  IGDBGame: (identifier: string | number) => `/api/public/igdb/${identifier}`,
  DbGame: (slug: string) => `/api/public/games/${slug}`,
} as const;
