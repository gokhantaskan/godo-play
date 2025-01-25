import { and, count, eq, inArray, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import {
  games,
  gameSubmissionGameModes,
  platformGroupPlatforms,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";

// Define interfaces for request query and response
interface GamesRequestQuery {
  platforms?: string; // Comma-separated platform IDs
  gameModes?: string; // Comma-separated game mode IDs
  limit?: string; // Limit for pagination
  offset?: string; // Offset for pagination
  sort?: string; // Sorting criteria
  search?: string; // Search term for game names
}

interface GamesResponse {
  total: number; // Total number of games
  count: number; // Number of games after filtering
  data: GameSubmissionWithRelations[]; // Array of game data
  limit: number; // Limit used for pagination
  offset: number; // Offset used for pagination
}

interface CountResult {
  count: number; // Count result from database query
}

// Helper function to parse array parameters from query
function parseArrayParam(param?: string): number[] | undefined {
  // Decode URI component and split by comma, then convert to numbers
  return param ? decodeURIComponent(param).split(",").map(Number) : undefined;
}

export default defineCachedEventHandler(
  async event => {
    try {
      // Extract query parameters from the event
      const query = getQuery(event);
      const {
        platforms,
        gameModes,
        limit = "60", // Default limit
        offset = "0", // Default offset
        search,
      }: GamesRequestQuery = query;

      // Parse query parameters
      const parsedPlatforms = parseArrayParam(platforms);
      const parsedGameModes = parseArrayParam(gameModes);
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);

      // Get total count of all games (unfiltered)
      const totalCountResult = await db
        .select({ count: count() })
        .from(games)
        .then(rows => rows[0] as CountResult);

      // Base conditions for filtered queries
      const baseConditions = {
        where:
          process.env.NODE_ENV === "production"
            ? eq(games.status, "approved") // Only approved games in production
            : undefined,
      };

      let conditions = baseConditions.where;

      // Add search filtering condition
      if (search) {
        conditions = and(conditions, sql`name ILIKE ${`%${search}%`}`);
      }

      // Add platform filtering condition
      if (parsedPlatforms?.length) {
        const platformGroupsQuery = db
          .select({ id: platformGroupPlatforms.platformGroupId })
          .from(platformGroupPlatforms)
          .where(inArray(platformGroupPlatforms.platformId, parsedPlatforms))
          .groupBy(platformGroupPlatforms.platformGroupId)
          .having(
            sql`COUNT(DISTINCT platform_id) >= ${parsedPlatforms.length}`
          );

        conditions = and(
          conditions,
          sql`id IN (
            SELECT submission_id 
            FROM platform_groups 
            WHERE id IN (${platformGroupsQuery})
          )`
        );
      }

      // Update game mode filtering to include at least one selected mode
      if (parsedGameModes?.length) {
        const gameModeQuery = db
          .select({ submissionId: gameSubmissionGameModes.submissionId })
          .from(gameSubmissionGameModes)
          // .where(inArray(gameSubmissionGameModes.gameModeId, parsedGameModes))
          // .groupBy(gameSubmissionGameModes.submissionId)
          // .having(
          //   sql`COUNT(DISTINCT game_mode_id) = ${parsedGameModes.length}`
          // )
          .where(inArray(gameSubmissionGameModes.gameModeId, parsedGameModes));

        conditions = and(conditions, sql`id IN (${gameModeQuery})`);
      }

      // Get filtered count of games
      const filteredCountResult = await db
        .select({ count: count() })
        .from(games)
        .where(conditions)
        .then(rows => rows[0] as CountResult);

      // Retrieve filtered game data with related entities
      const data = await db.query.games.findMany({
        with: {
          platformGroups: {
            columns: {
              id: true,
            },
            with: {
              platformGroupPlatforms: {
                columns: {
                  platformId: true,
                  platformGroupId: true,
                },
                with: {
                  platform: {
                    columns: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          pcStorePlatforms: {
            columns: {
              id: true,
              storeSlug: true,
            },
            with: {
              crossplayEntries: {
                columns: {
                  platformId: true,
                },
                with: {
                  platform: {
                    columns: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          gameSubmissionGameModes: {
            columns: {
              gameModeId: true,
            },
            with: {
              gameMode: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        where: conditions,
        orderBy: [
          sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`, // Sort by aggregated rating
        ],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      // Return the response with total, count, and data
      return {
        total: totalCountResult.count,
        count: filteredCountResult.count,
        data,
        limit: parsedLimit,
        offset: parsedOffset,
      } satisfies GamesResponse;
    } catch (error: unknown) {
      // Handle errors and throw appropriate error messages
      if (isH3ErrorLike(error)) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        message: "Failed to retrieve game submissions",
        data: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },
  {
    // Cache settings: 5 minutes in production, 5 seconds in development
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
