import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export default defineCachedEventHandler(
  async event => {
    try {
      const slug = getRouterParam(event, "slug");

      const fields = [
        "name",
        "age_ratings.*",
        "age_ratings.content_descriptions.*",
        "language_supports.language.*",
        "language_supports.language_support_type",
        "category",
        "cover.*",
        "multiplayer_modes.*",
        "screenshots.*",
        "storyline",
        "summary",
        "websites.*",
        "involved_companies.*",
        "involved_companies.company.name",
        "first_release_date",
        "release_dates.*",
        // With names
        "game_modes.name",
        "genres.name",
        "platforms.name",
        "player_perspectives.name",
        "themes.name",
      ].join(",");

      const parsedBody = `fields ${fields}; where slug="${slug}";`;

      if (process.env.NODE_ENV === "development") {
        console.log("IGDB Query:", parsedBody);
      }

      const response = await tokenStorage.makeAuthenticatedRequest(
        event,
        `/games`,
        {
          body: parsedBody,
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
    } catch (error: unknown) {
      if (isH3ErrorLike(error)) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        message: "Failed to fetch game details",
        data: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },
  {
    // 5 minutes in production, 5 seconds in dev
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
