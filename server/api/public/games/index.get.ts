import { and, asc, count, desc, inArray, type SQL, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import {
  games as gamesTable,
  gameGameModes,
  platformGroupPlatforms,
  gamesTags,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { FilterParams, GameStatus } from "~~/shared/types/globals";

// Define the sortable fields type
type SortableField =
  | "created_at"
  | "updated_at"
  | "popularity"
  | "first_release_date";

interface CountResult {
  count: number;
}

// Helper function to parse array parameters from query
function parseArrayParam(param?: string): number[] | undefined {
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
        tags,
        limit = "60",
        offset = "0",
        search,
        status,
        sort = "-popularity",
        freeToPlay,
      } = query as Partial<Record<keyof FilterParams, string>>;

      // Parse query parameters
      const parsedPlatforms = parseArrayParam(platforms);
      const parsedGameModes = parseArrayParam(gameModes);
      const parsedTags = parseArrayParam(tags);
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);
      const parsedFreeToPlay = freeToPlay === "true";

      // Parse sort parameter
      const sortField = sort.slice(1) as SortableField;
      const isDescending = sort.startsWith("-");
      const validSortFields = [
        "created_at",
        "updated_at",
        "popularity",
        "first_release_date",
      ] as const satisfies readonly SortableField[];

      const parsedSortField = validSortFields.includes(sortField as any)
        ? sortField
        : "popularity";

      // Parse and validate status parameter
      const validStatuses = status
        ? decodeURIComponent(status)
            .split(",")
            .filter((s): s is GameStatus =>
              ["pending", "approved", "rejected"].includes(s)
            )
        : undefined;

      // Base conditions for filtered queries
      const baseConditions: { where: SQL | undefined } = {
        where: validStatuses?.length
          ? inArray(gamesTable.status, validStatuses)
          : undefined,
      };

      let conditions: SQL | undefined = baseConditions.where;

      // Add search filtering condition
      if (search) {
        const decodedSearch = decodeURIComponent(search);
        conditions = and(conditions, sql`name ILIKE ${`%${decodedSearch}%`}`);
      }

      // Add free-to-play filtering condition
      if (parsedFreeToPlay) {
        conditions = and(conditions, sql`free_to_play = true`);
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
            SELECT game_id
            FROM platform_group
            WHERE id IN (${platformGroupsQuery})
          )`
        );
      }

      // Add game mode filtering condition
      if (parsedGameModes?.length) {
        const gameModeQuery = db
          .select({ gameId: gameGameModes.gameId })
          .from(gameGameModes)
          .where(inArray(gameGameModes.gameModeId, parsedGameModes));

        conditions = and(conditions, sql`id IN (${gameModeQuery})`);
      }

      // Add tag filtering condition
      if (parsedTags?.length) {
        const tagsQuery = db
          .select({ gameId: gamesTags.gameId })
          .from(gamesTags)
          .where(inArray(gamesTags.tagId, parsedTags));

        conditions = and(conditions, sql`id IN (${tagsQuery})`);
      }

      // Get filtered count of games
      const filteredCountResult = await db
        .select({ count: count() })
        .from(gamesTable)
        .where(conditions)
        .then(rows => rows[0] as CountResult);

      // Retrieve filtered game data with related entities
      const gameResults = await db.query.games.findMany({
        with: {
          crossplayInformation: {
            columns: {
              isOfficial: true,
            },
          },
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
          gameGameModes: {
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
          tags: {
            with: {
              tag: {
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
            : parsedSortField === "first_release_date"
              ? isDescending
                ? sql`first_release_date DESC NULLS LAST`
                : sql`first_release_date ASC NULLS LAST`
              : isDescending
                ? desc(
                    gamesTable[
                      parsedSortField === "created_at"
                        ? "createdAt"
                        : "updatedAt"
                    ]
                  )
                : asc(
                    gamesTable[
                      parsedSortField === "created_at"
                        ? "createdAt"
                        : "updatedAt"
                    ]
                  ),
        ],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      // Return the response with total, count, and data
      return {
        total: filteredCountResult.count,
        limit: parsedLimit,
        offset: parsedOffset,
        data: gameResults,
      };
    } catch (error: unknown) {
      if (isH3ErrorLike(error)) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        message: "Failed to retrieve games",
        data: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
