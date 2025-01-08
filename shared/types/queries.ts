export type DashboardGamesRequestBody = {
  gameModes?: number[];
  genres?: number[];
  limit?: number;
  platforms?: number[];
  playerPerspectives?: number[];
  search?: string;
  sort?: string;
  themes?: number[];
};
