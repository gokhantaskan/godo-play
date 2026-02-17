import { eq } from "drizzle-orm";

import { db } from "../db";
import { games } from "../db/schema";
import {
  calculateScoreForCandidate,
  DEFAULT_GAME_MODE_WEIGHT,
  DEFAULT_TAG_WEIGHT,
  RECOMMENDATIONS_LIMIT,
} from "../utils/recommendationUtils";

// Game interface compatible with database response structure
interface Game {
  id: number;
  name: string;
  slug: string;
  external: any;
  status?: "pending" | "approved" | "rejected";
  category?: number;
  firstReleaseDate?: string | null;
  freeToPlay?: boolean;
  gameGameModes?: Array<{
    gameModeId: number;
  }>;
  tags?: Array<{
    tagId: number;
  }>;
}

interface OrphanAnalysisResult {
  totalGames: number;
  recommendedGames: number;
  orphanGames: Game[];
  topRecommended: Array<{
    game: Game;
    count: number;
  }>;
}

/**
 * Analyzes all games to find orphans (games not recommended by any other game)
 * using only the database
 */
async function analyzeOrphanGames(): Promise<OrphanAnalysisResult> {
  console.log("Fetching all approved games from database...");

  // Get all approved games from database with their tags and game modes
  const allGames = await db.query.games.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      status: true,
      category: true,
      firstReleaseDate: true,
      freeToPlay: true,
      external: true,
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
    where: eq(games.status, "approved"),
    limit: 1000,
  });

  console.log(`Found ${allGames.length} approved games`);

  // Create a structure to track games that are recommended and how often
  const recommendedGames = new Set<string>();
  const recommendationCounts: Record<string, number> = {};
  const gameMap: Record<string, Game> = {};

  // Create a map of slug to game for easier lookup and initialize counts
  allGames.forEach(game => {
    gameMap[game.slug] = game;
    recommendationCounts[game.slug] = 0;
  });

  // Fetch tag and game mode weights from the database
  console.log("Fetching tag and game mode weights...");
  const allTagsWithWeights = await db.query.tags.findMany({
    columns: {
      id: true,
      weight: true,
    },
  });

  const allGameModesWithWeights = await db.query.gameModes.findMany({
    columns: {
      id: true,
      weight: true,
    },
  });

  // Create maps for faster weight lookups
  const tagWeightMap = new Map(
    allTagsWithWeights.map(tag => [tag.id, tag.weight || DEFAULT_TAG_WEIGHT])
  );

  const gameModeWeightMap = new Map(
    allGameModesWithWeights.map(mode => [
      mode.id,
      mode.weight || DEFAULT_GAME_MODE_WEIGHT,
    ])
  );

  // Process each game to find its recommended games
  console.log("Analyzing game similarity to find recommendations...");
  let processed = 0;

  for (const sourceGame of allGames) {
    // Get source game's tags and game modes
    const sourceGameModeIds =
      sourceGame.gameGameModes?.map(mode => mode.gameModeId) || [];

    const sourceTagIds = sourceGame.tags?.map(tag => tag.tagId) || [];

    // Skip games with no tags or game modes since we can't make good recommendations
    if (sourceGameModeIds.length === 0 && sourceTagIds.length === 0) {
      processed++;
      continue;
    }

    const scoredGames = allGames
      .filter(game => game.id !== sourceGame.id) // Don't recommend the game to itself
      .map(game => ({
        game,
        score: calculateScoreForCandidate(
          {
            game,
            tags: game.tags,
            gameGameModes: game.gameGameModes,
          },
          sourceTagIds,
          sourceGameModeIds,
          tagWeightMap,
          gameModeWeightMap
        ),
      }));

    // Filter out games with no matches, sort by score, and take top RECOMMENDATIONS_LIMIT
    const recommendedGamesForSource = scoredGames
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, RECOMMENDATIONS_LIMIT)
      .map(item => item.game);

    // Record these games as being recommended
    recommendedGamesForSource.forEach(game => {
      recommendedGames.add(game.slug);
      recommendationCounts[game.slug] =
        (recommendationCounts[game.slug] || 0) + 1;
    });

    processed++;
    if (processed % 50 === 0) {
      console.log(`Processed ${processed}/${allGames.length} games`);
    }
  }

  console.log(`Finished processing ${processed} games for recommendations`);

  // Find orphan games (not recommended by any other game)
  const orphanGames = allGames.filter(game => !recommendedGames.has(game.slug));

  // Get top 10 most recommended games
  const topRecommended = Object.entries(recommendationCounts)
    .filter((entry): entry is [string, number] => entry[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([slug, count]) => {
      const game = gameMap[slug];
      return { game, count };
    })
    .filter((item): item is { game: Game; count: number } => !!item.game);

  return {
    totalGames: allGames.length,
    recommendedGames: recommendedGames.size,
    orphanGames,
    topRecommended,
  };
}

/**
 * Nitro task handler
 */
export default defineTask({
  meta: {
    name: "games:analyze-orphans",
  },
  async run() {
    try {
      const result = await analyzeOrphanGames();

      console.log("\n=== RESULTS ===");
      console.log(`Total games: ${result.totalGames}`);
      console.log(
        `Games recommended at least once: ${result.recommendedGames}`
      );
      console.log(
        `Orphan games (not recommended by any other game): ${result.orphanGames.length}`
      );

      console.log("\n=== ORPHAN GAMES ===");
      result.orphanGames.forEach((game: Game) => {
        console.log(`- ${game.name} (${game.slug})`);
      });

      console.log("\n=== TOP 10 MOST RECOMMENDED GAMES ===");
      result.topRecommended.forEach(({ game, count }) => {
        console.log(`- ${game.name} (${count} recommendations)`);
      });

      return {
        result: "success",
        message: `✅ Analysis complete: ${result.orphanGames.length} orphan games found out of ${result.totalGames} total games.`,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Task failed:", error);
      return {
        result: "error",
        message: `Failed to analyze orphan games: ${errorMessage}`,
      };
    }
  },
});
