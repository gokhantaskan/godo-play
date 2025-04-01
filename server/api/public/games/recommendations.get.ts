import { eq, inArray, not, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameSubmissionGameModes, games, gamesTags } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";

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

      // Parse platform IDs if provided
      const platformIds = platforms
        ? (platforms as string)
            .split(",")
            .map(id => parseInt(id))
            .filter(id => !isNaN(id))
        : [];

      // First, find the source game
      const sourceGame = await db.query.games.findFirst({
        where: eq(games.slug, query as string),
        with: {
          gameSubmissionGameModes: {
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

      // Extract game modes and tags for matching
      const gameModeIds = sourceGame.gameSubmissionGameModes.map(
        mode => mode.gameModeId
      );

      const tagIds = sourceGame.tags?.map(tag => tag.tagId) || [];

      // If no game modes or tags, we can't make good recommendations
      if (gameModeIds.length === 0 && tagIds.length === 0) {
        return [];
      }

      // Find similar games based on game modes and tags, excluding the source game
      let similarGames = [];

      // Helper function to filter games by platforms
      const filterGamesByPlatform = (games: GameSubmissionWithRelations[]) => {
        if (!platformIds.length) return games;

        return games.filter(game => {
          // Check if game supports all requested platforms
          const supportedPlatformIds: number[] = [];

          // Check platforms in platform groups
          if (game.platformGroups) {
            game.platformGroups.forEach(group => {
              group.platformGroupPlatforms.forEach(platform => {
                if (platform.platform?.id) {
                  supportedPlatformIds.push(platform.platform.id);
                }
              });
            });
          }

          // Check platforms in store platforms
          if (game.storePlatforms) {
            game.storePlatforms.forEach(storePlatform => {
              storePlatform.crossplayEntries.forEach(entry => {
                if (entry.platform?.id) {
                  supportedPlatformIds.push(entry.platform.id);
                }
              });
            });
          }

          // Check if all requested platforms are supported
          return platformIds.every(id => supportedPlatformIds.includes(id));
        });
      };

      // If we have both game modes and tags
      if (gameModeIds.length > 0 && tagIds.length > 0) {
        // Get games with matching game modes
        const gamesWithGameModes = await db.query.games.findMany({
          where: not(eq(games.id, sourceGame.id)),
          with: {
            crossplayInformation: true,
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

        // Apply platform filtering if needed
        const filteredGames = filterGamesByPlatform(gamesWithGameModes);

        // Calculate scores for each game (number of matching game modes + number of matching tags)
        const scoredGames = filteredGames.map(game => {
          // Count matching game modes
          const matchingGameModes = game.gameSubmissionGameModes.filter(mode =>
            gameModeIds.includes(mode.gameModeId)
          ).length;

          // Count matching tags
          const matchingTags =
            game.tags?.filter(tag => tagIds.includes(tag.tagId)).length || 0;

          // Total score
          const score = matchingGameModes + matchingTags;

          return { game, score };
        });

        // Sort by score and get top matches
        similarGames = scoredGames
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.game);
      }
      // If we only have game modes
      else if (gameModeIds.length > 0) {
        const gamesWithGameModes = await db.query.games.findMany({
          where: not(eq(games.id, sourceGame.id)),
          with: {
            crossplayInformation: true,
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

        // Apply platform filtering if needed
        const filteredGames = filterGamesByPlatform(gamesWithGameModes);

        // Calculate scores based on matching game modes
        const scoredGames = filteredGames.map(game => {
          const matchingGameModes = game.gameSubmissionGameModes.filter(mode =>
            gameModeIds.includes(mode.gameModeId)
          ).length;

          return { game, score: matchingGameModes };
        });

        // Filter, sort and limit
        similarGames = scoredGames
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.game);
      }
      // If we only have tags
      else {
        const gamesWithTags = await db.query.games.findMany({
          where: not(eq(games.id, sourceGame.id)),
          with: {
            crossplayInformation: true,
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

        // Apply platform filtering if needed
        const filteredGames = filterGamesByPlatform(gamesWithTags);

        // Calculate scores based on matching tags
        const scoredGames = filteredGames.map(game => {
          const matchingTags =
            game.tags?.filter(tag => tagIds.includes(tag.tagId)).length || 0;

          return { game, score: matchingTags };
        });

        // Filter, sort and limit
        similarGames = scoredGames
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => item.game);
      }

      return similarGames;
    } catch (error: unknown) {
      if (isH3ErrorLike(error)) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        message: "Failed to retrieve game recommendations",
        data: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
