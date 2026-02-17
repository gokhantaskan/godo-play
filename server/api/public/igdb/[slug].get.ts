import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export default defineCachedEventHandler(
  async event => {
    try {
      const identifier = getRouterParam(event, "slug");

      const fields = [
        "name",
        "age_ratings.id",
        "age_ratings.organization",
        "age_ratings.rating_category",
        "age_ratings.rating_content_descriptions",
        "age_ratings.synopsis",
        "age_ratings.checksum",
        "game_type",
        "cover.*",
        "multiplayer_modes.*",
        "screenshots.*",
        "videos.*",
        "storyline",
        "summary",
        "websites.*",
        "involved_companies.*",
        "involved_companies.company.name",
        "first_release_date",
        "release_dates.*",
        "aggregated_rating",
        // With names
        "game_modes.name",
        "genres.name",
        "platforms.name",
        "player_perspectives.name",
        "themes.name",
      ].join(",");

      // Check if identifier is a number (IGDB ID) or a string (slug)
      const isNumericId = !isNaN(Number(identifier));
      const whereClause = isNumericId 
        ? `id = ${identifier}` 
        : `slug = "${identifier}"`;
      
      const parsedBody = `fields ${fields}; where ${whereClause};`;

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

      // Transform IGDB age_ratings to match our TypeScript types
      if (gameDetails.age_ratings) {
        gameDetails.age_ratings = gameDetails.age_ratings.map((rating: any) => {
          const transformed = {
            id: rating.id,
            category: rating.organization,
            rating: rating.rating_category,
            content_descriptions: rating.rating_content_descriptions ?? rating.content_descriptions,
            synopsis: rating.synopsis,
            checksum: rating.checksum,
          };

          return transformed;
        });
      }

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
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
