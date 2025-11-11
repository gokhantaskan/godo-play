import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export default defineCachedEventHandler(
  async event => {
    try {
      const slug = getRouterParam(event, "slug");

      const fields = [
        "name",
        "age_ratings.id",
        "age_ratings.organization",
        "age_ratings.rating_category",
        "age_ratings.rating_content_descriptions",
        "age_ratings.synopsis",
        "age_ratings.checksum",
        "category",
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

      if (process.env.NODE_ENV === "development" && gameDetails.age_ratings) {
        console.log("BEFORE transformation:", JSON.stringify(gameDetails.age_ratings, null, 2));
      }

      // Transform IGDB age_ratings to match our TypeScript types
      if (gameDetails.age_ratings) {
        if (process.env.NODE_ENV === "development") {
          console.log("=== RAW IGDB DATA ===");
          console.log("First rating raw data:", JSON.stringify(gameDetails.age_ratings[0], null, 2));
        }

        gameDetails.age_ratings = gameDetails.age_ratings.map((rating: any) => {
          // IGDB deprecated 'category' and 'rating' fields
          // Use 'organization' and 'rating_category' instead (the correct fields)
          // If new fields don't exist, IGDB might not be returning them

          if (process.env.NODE_ENV === "development") {
            console.log(`\nRating ${rating.id}:`);
            console.log(`  organization: ${rating.organization}`);
            console.log(`  rating_category: ${rating.rating_category}`);
            console.log(`  OLD category: ${rating.category}`);
            console.log(`  OLD rating: ${rating.rating}`);
          }

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

        if (process.env.NODE_ENV === "development") {
          console.log("\n=== AFTER TRANSFORMATION ===");
          console.log(JSON.stringify(gameDetails.age_ratings.slice(0, 2), null, 2));
        }
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
