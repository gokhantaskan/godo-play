import { and, asc, count, desc, eq, inArray, type SQL, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import {
  games as gamesTable,
  gameGameModes,
  gamesTags,
  platformGroupPlatforms,
} from "~~/server/db/schema";
import { parseGameListQuery } from "~~/server/utils/gameListQuery";

interface CountResult {
  count: number;
}

export default defineCachedEventHandler(
  async event => {
    try {
      const {
        platforms,
        gameModes,
        tags,
        limit,
        offset,
        search,
        sort,
        freeToPlay,
      } = parseGameListQuery(getQuery(event), { maxLimit: 1000 });

      let conditions: SQL | undefined = eq(gamesTable.status, "approved");

      // Add search filtering condition
      if (search) {
        conditions = and(conditions, sql`name ILIKE ${`%${search}%`}`);
      }

      // Add free-to-play filtering condition
      if (freeToPlay) {
        conditions = and(conditions, sql`free_to_play = true`);
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

      // Add game mode filtering condition
      if (gameModes?.length) {
        const gameModeQuery = db
          .select({ gameId: gameGameModes.gameId })
          .from(gameGameModes)
          .where(inArray(gameGameModes.gameModeId, gameModes));

        conditions = and(conditions, sql`id IN (${gameModeQuery})`);
      }

      // Add tag filtering condition
      if (tags?.length) {
        const tagsQuery = db
          .select({ gameId: gamesTags.gameId })
          .from(gamesTags)
          .where(inArray(gamesTags.tagId, tags));

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
          sort.field === "popularity"
            ? sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`
            : sort.field === "first_release_date"
              ? sort.isDescending
                ? sql`first_release_date DESC NULLS LAST`
                : sql`first_release_date ASC NULLS LAST`
              : sort.isDescending
                ? desc(
                    gamesTable[
                      sort.field === "created_at" ? "createdAt" : "updatedAt"
                    ]
                  )
                : asc(
                    gamesTable[
                      sort.field === "created_at" ? "createdAt" : "updatedAt"
                    ]
                  ),
        ],
        limit,
        offset,
      });

      // Return the response with total, count, and data
      return {
        total: filteredCountResult.count,
        limit,
        offset,
        data: gameResults,
      };
    } catch (error) {
      throwApiError(error);
    }
  },
  {
    name: GAME_CACHE_HANDLERS.list,
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
