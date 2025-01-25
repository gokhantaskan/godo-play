import { and, count, eq, inArray, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import {
  games,
  gameSubmissionGameModes,
  platformGroupPlatforms,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";

interface GamesRequestQuery {
  platforms?: string;
  gameModes?: string;
  limit?: string;
  offset?: string;
  sort?: string;
  search?: string;
}

interface GamesResponse {
  total: number;
  count: number;
  data: GameSubmissionWithRelations[];
  limit: number;
  offset: number;
}

interface CountResult {
  count: number;
}

export default defineCachedEventHandler(
  async event => {
    try {
      const query = getQuery(event);
      const parseArrayParam = (param?: string) =>
        param ? decodeURIComponent(param).split(",").map(Number) : undefined;

      const {
        platforms,
        gameModes,
        limit = "60",
        offset = "0",
        search,
      }: GamesRequestQuery = query;

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
            ? eq(games.status, "approved")
            : undefined,
      };

      let conditions = baseConditions.where;

      // Search filtering
      if (search) {
        conditions = and(conditions, sql`name ILIKE ${`%${search}%`}`);
      }

      // Platform filtering
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

      // Game mode filtering
      if (parsedGameModes?.length) {
        const gameModeQuery = db
          .select({ submissionId: gameSubmissionGameModes.submissionId })
          .from(gameSubmissionGameModes)
          .where(inArray(gameSubmissionGameModes.gameModeId, parsedGameModes))
          .groupBy(gameSubmissionGameModes.submissionId)
          .having(
            sql`COUNT(DISTINCT game_mode_id) = ${parsedGameModes.length}`
          );

        conditions = and(conditions, sql`id IN (${gameModeQuery})`);
      }

      // Get filtered count
      const filteredCountResult = await db
        .select({ count: count() })
        .from(games)
        .where(conditions)
        .then(rows => rows[0] as CountResult);

      // Get filtered data
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
          sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`,
        ],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      return {
        total: totalCountResult.count,
        count: filteredCountResult.count,
        data,
        limit: parsedLimit,
        offset: parsedOffset,
      } satisfies GamesResponse;
    } catch (error: unknown) {
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
    // 5 minutes in production, 5 seconds in dev
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
