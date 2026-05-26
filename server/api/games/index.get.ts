import { and, asc, count, desc, inArray, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import {
  gameGameModes,
  games,
  platformGroupPlatforms,
} from "~~/server/db/schema";
import { parseGameListQuery } from "~~/server/utils/gameListQuery";
import { sanitizeHtml } from "~~/server/utils/sanitizeHtml";
import type { GameWithRelations } from "~~/shared/types";
import type { PaginatedResponse } from "~~/shared/types/globals";

interface CountResult {
  count: number; // Count result from database query
}

export default defineCachedEventHandler(
  async event => {
    try {
      const { platforms, gameModes, limit, offset, search, statuses, sort } =
        parseGameListQuery(getQuery(event));

      let conditions = statuses?.length
        ? inArray(games.status, statuses)
        : undefined;

      // Add search filtering condition
      if (search) {
        conditions = and(conditions, sql`name ILIKE ${`%${search}%`}`);
      }

      // Add platform filtering condition
      if (platforms?.length) {
        const platformGroupsQuery = db
          .select({ id: platformGroupPlatforms.platformGroupId })
          .from(platformGroupPlatforms)
          .where(inArray(platformGroupPlatforms.platformId, platforms))
          .groupBy(platformGroupPlatforms.platformGroupId)
          .having(sql`COUNT(DISTINCT platform_id) >= ${platforms.length}`);

        conditions = and(
          conditions,
          sql`id IN (
            SELECT game_id
            FROM platform_group
            WHERE id IN (${platformGroupsQuery})
          )`
        );
      }

      // Update game mode filtering to include at least one selected mode
      if (gameModes?.length) {
        const gameModeQuery = db
          .select({ gameId: gameGameModes.gameId })
          .from(gameGameModes)
          // .where(inArray(gameGameModes.gameModeId, gameModes))
          // .groupBy(gameGameModes.gameId)
          // .having(
          //   sql`COUNT(DISTINCT game_mode_id) = ${gameModes.length}`
          // )
          .where(inArray(gameGameModes.gameModeId, gameModes));

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
          crossplayInformation: true,
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
          storePlatforms: {
            columns: {
              id: true,
              storeUrl: true,
            },
            with: {
              store: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
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
          sort.field === "popularity"
            ? sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`
            : sort.field === "first_release_date"
              ? sort.isDescending
                ? sql`first_release_date DESC NULLS LAST`
                : sql`first_release_date ASC NULLS LAST`
              : sort.isDescending
                ? desc(
                    games[
                      sort.field === "created_at" ? "createdAt" : "updatedAt"
                    ]
                  )
                : asc(
                    games[
                      sort.field === "created_at" ? "createdAt" : "updatedAt"
                    ]
                  ),
        ],
        limit,
        offset,
      });

      // Sanitize HTML content in crossplay information
      const sanitizedData = data.map(game => {
        const sanitizedCrossplayInfo = game.crossplayInformation
          ? {
              evidenceUrl: game.crossplayInformation.evidenceUrl,
              information: sanitizeHtml(game.crossplayInformation.information),
              isOfficial: game.crossplayInformation.isOfficial,
            }
          : null;

        return {
          ...game,
          crossplayInformation: sanitizedCrossplayInfo,
        };
      }) as GameWithRelations[];

      // Return the response with total, count, and sanitized data
      return {
        total: filteredCountResult.count,
        count: sanitizedData.length,
        data: sanitizedData,
        limit,
        offset,
      } satisfies PaginatedResponse<GameWithRelations>;
    } catch (error) {
      throwApiError(error);
    }
  },
  {
    // Cache settings: 5 minutes in production, 5 seconds in development
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
