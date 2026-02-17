import { and, eq, inArray, not, or, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import { games, tags, gameModes } from "~~/server/db/schema";
import { calculateScoreForCandidate } from "~~/server/utils/recommendationUtils";

const DEFAULT_TAG_WEIGHT = 1;
const DEFAULT_GAME_MODE_WEIGHT = 1;

interface PlatformData {
  platform?: { id: number };
}

interface PlatformGroupPlatform {
  platformGroupPlatforms: PlatformData[];
}

interface CrossplayEntry {
  platform?: { id: number };
}

interface StorePlatform {
  crossplayEntries: CrossplayEntry[];
}

export default defineCachedEventHandler(
  async event => {
    try {
      const { query, platforms } = getQuery(event);
      const limit = parseInt(getQuery(event).limit as string) || 3;

      if (!query) {
        throw createError({
          statusCode: 400,
          message: "Game slug or id is required",
        });
      }

      const platformIds = platforms
        ? (platforms as string)
            .split(",")
            .map(id => parseInt(id))
            .filter(id => !isNaN(id))
        : [];

      // Find the source game with its tags and game modes
      const sourceGame = await db.query.games.findFirst({
        where: eq(games.slug, query as string),
        columns: {
          id: true,
          slug: true,
        },
        with: {
          gameGameModes: {
            columns: {
              gameModeId: true,
            },
          },
          tags: {
            columns: {
              tagId: true,
            },
          },
        },
      });

      if (!sourceGame) {
        throw createError({
          statusCode: 404,
          message: "Source game not found",
        });
      }

      const gameModeIds = sourceGame.gameGameModes.map(
        mode => mode.gameModeId
      );
      const tagIds = sourceGame.tags?.map(tag => tag.tagId) || [];

      if (gameModeIds.length === 0 && tagIds.length === 0) {
        return [];
      }

      // Fetch tag and game mode weights in parallel
      const [tagWeights, gameModeWeights] = await Promise.all([
        tagIds.length > 0
          ? db
              .select({ id: tags.id, weight: tags.weight })
              .from(tags)
              .where(inArray(tags.id, tagIds))
          : Promise.resolve([]),
        gameModeIds.length > 0
          ? db
              .select({ id: gameModes.id, weight: gameModes.weight })
              .from(gameModes)
              .where(inArray(gameModes.id, gameModeIds))
          : Promise.resolve([]),
      ]);

      const tagWeightMap = new Map(
        tagWeights.map(tag => [tag.id, tag.weight || DEFAULT_TAG_WEIGHT])
      );
      const gameModeWeightMap = new Map(
        gameModeWeights.map(mode => [
          mode.id,
          mode.weight || DEFAULT_GAME_MODE_WEIGHT,
        ])
      );

      // Build SQL pre-filter: games sharing at least one tag OR one game mode
      const preFilterConditions: ReturnType<typeof sql>[] = [];

      if (tagIds.length > 0) {
        preFilterConditions.push(
          sql`${games.id} IN (
            SELECT game_id FROM game_tag
            WHERE tag_id IN (${sql.join(
              tagIds.map(id => sql`${id}`),
              sql`, `
            )})
          )`
        );
      }

      if (gameModeIds.length > 0) {
        preFilterConditions.push(
          sql`${games.id} IN (
            SELECT game_id FROM game_game_mode
            WHERE game_mode_id IN (${sql.join(
              gameModeIds.map(id => sql`${id}`),
              sql`, `
            )})
          )`
        );
      }

      const candidateLimit = 5 * limit;

      const potentialGames = await db.query.games.findMany({
        where: and(
          not(eq(games.id, sourceGame.id)),
          or(...preFilterConditions)
        ),
        limit: candidateLimit,
        columns: {
          id: true,
          name: true,
          slug: true,
          external: true,
          status: true,
          category: true,
          firstReleaseDate: true,
          freeToPlay: true,
        },
        with: {
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
          crossplayInformation: {
            columns: {
              isOfficial: true,
            },
          },
          platformGroups: {
            with: {
              platformGroupPlatforms: {
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
            with: {
              crossplayEntries: {
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
        },
      });

      // Apply in-memory platform filtering after fetching
      const filteredGames = platformIds.length
        ? potentialGames.filter(game => {
            const supportedPlatformIds: number[] = [];

            if (game.platformGroups) {
              game.platformGroups.forEach((group: PlatformGroupPlatform) => {
                group.platformGroupPlatforms.forEach(
                  (platform: PlatformData) => {
                    if (platform.platform?.id) {
                      supportedPlatformIds.push(platform.platform.id);
                    }
                  }
                );
              });
            }

            if (game.storePlatforms) {
              game.storePlatforms.forEach((storePlatform: StorePlatform) => {
                storePlatform.crossplayEntries.forEach(
                  (entry: CrossplayEntry) => {
                    if (entry.platform?.id) {
                      supportedPlatformIds.push(entry.platform.id);
                    }
                  }
                );
              });
            }

            return platformIds.every(id => supportedPlatformIds.includes(id));
          })
        : potentialGames;

      // Score and rank candidates
      const scoredGames = filteredGames.map(game => ({
        game,
        score: calculateScoreForCandidate(
          {
            game,
            tags: game.tags,
            gameGameModes: game.gameGameModes,
          },
          tagIds,
          gameModeIds,
          tagWeightMap,
          gameModeWeightMap
        ),
      }));

      return scoredGames
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          ...item.game,
          official: item.game.crossplayInformation?.isOfficial || false,
        }));
    } catch (error) {
      throwApiError(error);
    }
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
