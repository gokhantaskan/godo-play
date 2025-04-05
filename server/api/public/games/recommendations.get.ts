import { eq, inArray, not } from "drizzle-orm";

import { db } from "~~/server/db";
import { games, tags, gameModes } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

// Default weight for tags and game modes not explicitly defined
const DEFAULT_TAG_WEIGHT = 1;
const DEFAULT_GAME_MODE_WEIGHT = 1;
// High weight threshold to prioritize important tags
const HIGH_WEIGHT_THRESHOLD = 3;
// Multiplier for high-weighted tags to ensure their priority
const HIGH_WEIGHT_MULTIPLIER = 5;

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

      // First, find the source game - only select data we actually need
      const sourceGame = await db.query.games.findFirst({
        where: eq(games.slug, query as string),
        columns: {
          id: true,
          slug: true,
        },
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
      
      // Combine tag and game mode queries to reduce database operations
      const [tagWeights, gameModeWeights] = await Promise.all([
        tagIds.length > 0 
          ? db.select({
              id: tags.id,
              weight: tags.weight
            })
            .from(tags)
            .where(inArray(tags.id, tagIds)) 
          : Promise.resolve([]),
          
        gameModeIds.length > 0 
          ? db.select({
              id: gameModes.id,
              weight: gameModes.weight
            })
            .from(gameModes)
            .where(inArray(gameModes.id, gameModeIds)) 
          : Promise.resolve([])
      ]);

      // Create maps for faster lookup
      const tagWeightMap = new Map(
        tagWeights.map(tag => [tag.id, tag.weight || DEFAULT_TAG_WEIGHT])
      );
      
      const gameModeWeightMap = new Map(
        gameModeWeights.map(mode => [mode.id, mode.weight || DEFAULT_GAME_MODE_WEIGHT])
      );

      // Optimization: Select only fields we need to actually use
      const findGamesOptions = {
        where: not(eq(games.id, sourceGame.id)),
        columns: {
          id: true,
          name: true,
          slug: true,
          external: true, // This contains igdbImageId
          status: true,
          category: true,
          firstReleaseDate: true,
          freeToPlay: true,
        },
        with: {
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
          // Include crossplay information to get isOfficial flag
          crossplayInformation: {
            columns: {
              isOfficial: true,
            },
          },
          // Always include platform data for display
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
          }
        },
      };

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

      // Calculate scores and get recommendations - unified function to reduce code duplication
      const calculateRecommendations = async () => {
        const potentialGames = await db.query.games.findMany(findGamesOptions);
        const filteredGames = filterGamesByPlatform(potentialGames);
        
        const scoredGames = filteredGames.map(game => {
          // Get game modes score
          let gameModeScore = 0;
          let hasHighWeightModes = false;
          let highestModeWeight = 0;
          
          if (gameModeIds.length > 0) {
            game.gameSubmissionGameModes.forEach((mode: GameModeRelation) => {
              if (gameModeIds.includes(mode.gameModeId)) {
                const weight = gameModeWeightMap.get(mode.gameModeId) || DEFAULT_GAME_MODE_WEIGHT;
                if (weight >= HIGH_WEIGHT_THRESHOLD) {
                  gameModeScore += weight * HIGH_WEIGHT_MULTIPLIER;
                  hasHighWeightModes = true;
                  highestModeWeight = Math.max(highestModeWeight, weight);
                } else {
                  gameModeScore += weight;
                }
              }
            });
          }
          
          // Get tags score
          let tagScore = 0;
          let hasHighWeightTags = false;
          let highestTagWeight = 0;
          
          if (tagIds.length > 0 && game.tags) {
            game.tags.forEach((tag: TagRelation) => {
              if (tagIds.includes(tag.tagId)) {
                const weight = tagWeightMap.get(tag.tagId) || DEFAULT_TAG_WEIGHT;
                if (weight >= HIGH_WEIGHT_THRESHOLD) {
                  tagScore += weight * HIGH_WEIGHT_MULTIPLIER;
                  hasHighWeightTags = true;
                  highestTagWeight = Math.max(highestTagWeight, weight);
                } else {
                  tagScore += weight;
                }
              }
            });
          }
          
          // Prioritize high weight tags, then high weight modes
          let score = 0;
          if (hasHighWeightTags) {
            score = (highestTagWeight * 1000) + tagScore + gameModeScore;
          } else if (hasHighWeightModes) {
            score = (highestModeWeight * 1000) + tagScore + gameModeScore;
          } else {
            score = tagScore + gameModeScore;
          }
          
          // Reference to original game to preserve structure
          return { 
            game, 
            score,
            // Only add these if needed in the response
            _match: { 
              hasHighWeightTags, 
              highestTagWeight,
              hasHighWeightModes,
              highestModeWeight,
              tagScore,
              gameModeScore
            }
          };
        });
        
        // Filter out games with no matches and sort by score
        return scoredGames
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map(item => {
            // Clean up internal fields before returning
            const { _match, ...rest } = item;
            
            // Add official flag using crossplayInformation.isOfficial
            return {
              ...item.game,
              official: item.game.crossplayInformation?.isOfficial || false
            };
          });
      };

      // Get recommendations with unified approach
      const similarGames = await calculateRecommendations();
      
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
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
