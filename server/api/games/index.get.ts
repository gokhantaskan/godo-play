import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import { games, platformGroupPlatforms } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";

interface GamesRequestQuery {
  platforms?: string;
  limit?: string;
  offset?: string;
  sort?: string;
}

interface GamesResponse {
  total: number;
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
        limit = "60",
        offset = "0",
        sort = "aggregated_rating",
      }: GamesRequestQuery = query;

      const parsedPlatforms = parseArrayParam(platforms);
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);

      // Get total count of all games (unfiltered)
      const totalCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(games)
        .then(rows => rows[0] as CountResult);

      // Base conditions for filtered queries
      const baseConditions = {
        where:
          process.env.NODE_ENV === "production"
            ? eq(games.status, "approved")
            : undefined,
      };

      // If platforms are specified, add platform filtering
      if (parsedPlatforms?.length) {
        // Find platform groups that contain ALL selected platforms
        const platformGroupsQuery = db
          .select({ id: platformGroupPlatforms.platformGroupId })
          .from(platformGroupPlatforms)
          .where(inArray(platformGroupPlatforms.platformId, parsedPlatforms))
          .groupBy(platformGroupPlatforms.platformGroupId)
          .having(
            sql`COUNT(DISTINCT platform_id) >= ${parsedPlatforms.length}`
          );

        const conditions = and(
          baseConditions.where,
          sql`id IN (
            SELECT submission_id 
            FROM platform_groups 
            WHERE id IN (${platformGroupsQuery})
          )`
        );

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

        if (process.env.NODE_ENV === "development") {
          console.log("Query params:", {
            platforms: parsedPlatforms,
            limit: parsedLimit,
            offset: parsedOffset,
            sort,
            total: totalCountResult.count,
            filtered: data.length,
            sql: conditions,
          });
        }

        return {
          total: totalCountResult.count,
          data,
          limit: parsedLimit,
          offset: parsedOffset,
        } satisfies GamesResponse;
      }

      // If no platforms specified, return all games with pagination
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
        where: baseConditions.where,
        orderBy: [
          sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`,
        ],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      if (process.env.NODE_ENV === "development") {
        console.log("Query params:", {
          platforms: parsedPlatforms,
          limit: parsedLimit,
          offset: parsedOffset,
          sort,
          total: totalCountResult.count,
          filtered: data.length,
        });
      }

      return {
        total: totalCountResult.count,
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
