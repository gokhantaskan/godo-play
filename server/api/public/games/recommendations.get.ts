import { eq, inArray, not, sql } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameSubmissionGameModes, games, gamesTags, tags, gameModes } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";

// Default weight for tags and game modes not explicitly defined
const DEFAULT_TAG_WEIGHT = 1;
const DEFAULT_GAME_MODE_WEIGHT = 1;

// Type definitions for filtering games by platforms
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

interface GameModeRelation {
  gameModeId: number;
}

interface TagRelation {
  tagId: number;
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
      
      // Fetch tags with their weights
      const tagWeights = tagIds.length > 0 ? await db.select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        weight: tags.weight
      }).from(tags)
        .where(inArray(tags.id, tagIds)) : [];

      // Fetch game modes with their weights
      const gameModeWeights = gameModeIds.length > 0 ? await db.select({
        id: gameModes.id,
        name: gameModes.name,
        slug: gameModes.slug,
        weight: gameModes.weight
      }).from(gameModes)
        .where(inArray(gameModes.id, gameModeIds)) : [];


      // Create maps for faster lookup
      const tagWeightMap = new Map(
        tagWeights.map(tag => [tag.id, tag.weight || DEFAULT_TAG_WEIGHT])
      );
      
      const gameModeWeightMap = new Map(
        gameModeWeights.map(mode => [mode.id, mode.weight || DEFAULT_GAME_MODE_WEIGHT])
      );


      // Find similar games based on game modes and tags, excluding the source game
      let similarGames = [];

      // Helper function to filter games by platforms
      const filterGamesByPlatform = (games: any[]) => {
        if (!platformIds.length) return games;

        return games.filter(game => {
          // Check if game supports all requested platforms
          const supportedPlatformIds: number[] = [];

          // Check platforms in platform groups
          if (game.platformGroups) {
            game.platformGroups.forEach((group: PlatformGroupPlatform) => {
              group.platformGroupPlatforms.forEach((platform: PlatformData) => {
                if (platform.platform?.id) {
                  supportedPlatformIds.push(platform.platform.id);
                }
              });
            });
          }

          // Check platforms in store platforms
          if (game.storePlatforms) {
            game.storePlatforms.forEach((storePlatform: StorePlatform) => {
              storePlatform.crossplayEntries.forEach((entry: CrossplayEntry) => {
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

        // Calculate weighted scores for each game
        const scoredGames = filteredGames.map(game => {
          // Calculate weighted score for matching game modes
          let gameModeScore = 0;
          game.gameSubmissionGameModes.forEach((mode: GameModeRelation) => {
            if (gameModeIds.includes(mode.gameModeId)) {
              // Apply weight based on game mode ID
              const weight = gameModeWeightMap.get(mode.gameModeId) || DEFAULT_GAME_MODE_WEIGHT;
              gameModeScore += weight;
            }
          });

          // Calculate weighted score for matching tags
          let tagScore = 0;
          game.tags?.forEach((tag: TagRelation) => {
            if (tagIds.includes(tag.tagId)) {
              // Apply weight based on tag ID
              const weight = tagWeightMap.get(tag.tagId) || DEFAULT_TAG_WEIGHT;
              tagScore += weight;
            }
          });

          // Total weighted score
          const score = gameModeScore + tagScore;

          return { 
            game, 
            score, 
            tagScore, 
            gameModeScore,
            matchedTags: game.tags?.filter((t: TagRelation) => tagIds.includes(t.tagId)).map((t: any) => ({ 
              id: t.tag.id, 
              name: t.tag.name,
              weight: tagWeightMap.get(t.tagId) || DEFAULT_TAG_WEIGHT
            })),
            matchedGameModes: game.gameSubmissionGameModes.filter((m: GameModeRelation) => 
              gameModeIds.includes(m.gameModeId)
            ).map((m: any) => ({
              id: m.gameMode.id,
              name: m.gameMode.name,
              weight: gameModeWeightMap.get(m.gameModeId) || DEFAULT_GAME_MODE_WEIGHT
            }))
          };
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

        // Calculate weighted scores based on matching game modes
        const scoredGames = filteredGames.map(game => {
          let score = 0;
          const matchedModes: any[] = [];

          game.gameSubmissionGameModes.forEach((mode: GameModeRelation) => {
            if (gameModeIds.includes(mode.gameModeId)) {
              // Apply weight based on game mode ID
              const weight = gameModeWeightMap.get(mode.gameModeId) || DEFAULT_GAME_MODE_WEIGHT;
              score += weight;
              matchedModes.push({
                id: mode.gameModeId,
                weight
              });
            }
          });

          return { game, score, matchedModes };
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

        // Calculate weighted scores based on matching tags
        const scoredGames = filteredGames.map(game => {
          let score = 0;
          const matchedTags: any[] = [];

          game.tags?.forEach((tag: TagRelation) => {
            if (tagIds.includes(tag.tagId)) {
              // Apply weight based on tag ID
              const weight = tagWeightMap.get(tag.tagId) || DEFAULT_TAG_WEIGHT;
              score += weight;
              matchedTags.push({
                id: tag.tagId,
                weight
              });
            }
          });

          return { game, score, matchedTags };
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

      console.error("Recommendation error:", error);
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
