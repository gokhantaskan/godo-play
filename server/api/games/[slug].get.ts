import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export default defineCachedEventHandler(
  async event => {
    try {
      const slug = getRouterParam(event, "slug");

      const fields = [
        "name",
        "age_ratings.*",
        "category",
        "cover.*",
        "multiplayer_modes.*",
        "screenshots.*",
        "storyline",
        "summary",
        "websites.*",
        // With names
        "game_modes.name",
        "genres.name",
        "platforms.name",
        "player_perspectives.name",
        "themes.name",
      ].join(",");

      const response = await tokenStorage.makeAuthenticatedRequest(
        event,
        `/games`,
        {
          body: `fields ${fields}; where slug="${slug}";`,
        }
      );

      if (!response.ok) {
        throw createError({
          statusCode: response.status,
          statusMessage: response.statusText,
        });
      }

      const [gameDetails] = await response.json();
      return gameDetails as GameDetails;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error);
        throw createError(error);
      }

      console.error("Unknown Error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      });
    }
  },
  {
    // 5 minutes in production, 5 seconds in dev
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
  }
);
