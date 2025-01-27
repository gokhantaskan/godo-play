import { and, asc, count, desc, inArray, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import {
  games,
  gameSubmissionGameModes,
  platformGroupPlatforms,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type {
  FilterParams,
  PaginatedResponse,
  SortableField,
  SubmissionStatus,
} from "~~/shared/types/globals";

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
        status,
        sort = "-popularity", // Default sort
      } = query as Partial<Record<keyof FilterParams, string>>;

      // Parse query parameters
      const parsedPlatforms = parseArrayParam(platforms);
      const parsedGameModes = parseArrayParam(gameModes);
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);

      // Parse sort parameter
      const sortField = sort.slice(1) as SortableField; // Remove +/- prefix
      const isDescending = sort.startsWith("-");
      const validSortFields = [
        "created_at",
        "updated_at",
        "popularity",
      ] as const;

      const parsedSortField = validSortFields.includes(sortField as any)
        ? sortField
        : "popularity";

      // Parse and validate status parameter
      const validStatuses = status
        ? decodeURIComponent(status)
            .split(",")
            .filter((s): s is SubmissionStatus =>
              ["pending", "approved", "rejected"].includes(s)
            )
        : undefined;

      // Base conditions for filtered queries
      const baseConditions = {
        where: validStatuses?.length
          ? inArray(games.status, validStatuses)
          : undefined,
      };

      let conditions = baseConditions.where;

      // Add search filtering condition
      if (search) {
        const decodedSearch = decodeURIComponent(search);
        conditions = and(conditions, sql`name ILIKE ${`%${decodedSearch}%`}`);
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
          parsedSortField === "popularity"
            ? sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`
            : isDescending
              ? desc(
                  games[
                    parsedSortField === "created_at" ? "createdAt" : "updatedAt"
                  ]
                )
              : asc(
                  games[
                    parsedSortField === "created_at" ? "createdAt" : "updatedAt"
                  ]
                ),
        ],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      // Return the response with total, count, and data
      return {
        total: filteredCountResult.count,
        count: data.length,
        data,
        limit: parsedLimit,
        offset: parsedOffset,
      } satisfies PaginatedResponse<GameSubmissionWithRelations>;
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
