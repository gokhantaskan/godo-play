import { sql } from "drizzle-orm";

import { CATEGORIES } from "~~/shared/constants/categories";

import { db } from "../db";
import { games } from "../db/schema";
import { getIGDBClient } from "../utils/igdb";

const BATCH_SIZE = 10;
const DELAY_MS = 250;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const categoryIds = CATEGORIES.map(c => c.pointer);
const IGDB_CATEGORY_MAP = Array.from(
  { length: categoryIds.length },
  (_, i) => categoryIds[i]
);

interface IGDBGame {
  id: number;
  game_type?: number;
  aggregated_rating?: number;
  first_release_date?: number;
  cover?: number;
}

interface IGDBCover {
  id: number;
  game: number;
  image_id: string;
}

interface UpdateResult {
  updatedCount: number;
  errorCount: number;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchIGDBGames(
  igdbClient: any,
  batchIds: number[],
  retryCount = 0
): Promise<{ games: IGDBGame[]; covers: IGDBCover[] }> {
  try {
    const gamesRequestBody = `fields id,game_type,aggregated_rating,first_release_date,cover; where id = (${batchIds.join(",")});`;
    const gamesResponse = await igdbClient("games", gamesRequestBody);

    if (!gamesResponse.ok) {
      throw new Error(`IGDB API error (games): ${gamesResponse.statusText}`);
    }

    const games = await gamesResponse.json();

    // Extract cover IDs from games
    const coverIds = games
      .map((game: IGDBGame) => game.cover)
      .filter((id: number | undefined) => id !== undefined);

    if (coverIds.length === 0) {
      return { games, covers: [] };
    }

    // Fetch covers data
    const coversRequestBody = `fields id,game,image_id; where id = (${coverIds.join(",")});`;
    const coversResponse = await igdbClient("covers", coversRequestBody);

    if (!coversResponse.ok) {
      throw new Error(`IGDB API error (covers): ${coversResponse.statusText}`);
    }

    const covers = await coversResponse.json();

    return { games, covers };
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(
        `Retry attempt ${retryCount + 1} for batch ${batchIds.join(",")}`
      );
      await sleep(RETRY_DELAY_MS);
      return fetchIGDBGames(igdbClient, batchIds, retryCount + 1);
    }
    throw error;
  }
}

function validateAndFormatDate(
  timestamp: number | undefined,
  gameName: string
): string | null {
  if (!timestamp) {
    return null;
  }

  try {
    const date = new Date(timestamp * 1000);
    const isoDate = date.toISOString();
    const [dateOnly] = isoDate.split("T");

    if (!dateOnly || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      console.warn(`Invalid date format for game ${gameName}: ${dateOnly}`);
      return null;
    }

    return dateOnly;
  } catch (error) {
    console.warn(`Error formatting date for game ${gameName}: ${error}`);
    return null;
  }
}

async function updateIGDBGameData(): Promise<UpdateResult> {
  const submissions = await db.query.games.findMany({
    columns: {
      id: true,
      external: true,
      name: true,
      category: true,
    },
    where: sql`external IS NOT NULL AND external->>'igdbId' IS NOT NULL`,
  });

  // Convert IGDB IDs to numbers and filter out invalid ones
  const igdbIds = submissions
    .map(game => {
      const id = game.external?.igdbId;
      return typeof id === "string"
        ? parseInt(id, 10)
        : typeof id === "number"
          ? id
          : null;
    })
    .filter((id): id is number => id != null && !isNaN(id));

  if (!igdbIds.length) {
    console.log("No games found with valid IGDB IDs");
    return { updatedCount: 0, errorCount: 0 };
  }

  console.log(`Processing ${igdbIds.length} games in batches of ${BATCH_SIZE}`);
  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < igdbIds.length; i += BATCH_SIZE) {
    const batchIds = igdbIds.slice(i, i + BATCH_SIZE);
    const igdbClient = await getIGDBClient();

    try {
      const { games: igdbGames, covers } = await fetchIGDBGames(
        igdbClient,
        batchIds
      );
      console.log(
        `Processing batch ${i / BATCH_SIZE + 1}/${Math.ceil(
          igdbIds.length / BATCH_SIZE
        )}`
      );

      await db.transaction(async tx => {
        for (const igdbGame of igdbGames) {
          const idStr = igdbGame.id.toString();
          const matchingGame = submissions.find(s => {
            const subId = s.external?.igdbId;
            return subId?.toString() === idStr;
          });

          if (!matchingGame) {
            console.warn(`No matching game found for IGDB ID: ${idStr}`);
            continue;
          }

          const categoryPointer =
            IGDB_CATEGORY_MAP[igdbGame.game_type ?? 0] ?? 0;
          const firstReleaseDate = validateAndFormatDate(
            igdbGame.first_release_date,
            matchingGame.name
          );

          // Find matching cover for this game
          const gameCover = covers.find(cover => cover.game === igdbGame.id);
          const imageId = gameCover ? gameCover.image_id : null;

          try {
            const [game] = await tx
              .update(games)
              .set({
                category: categoryPointer,
                firstReleaseDate,
                external: sql`
                  jsonb_set(
                    jsonb_set(
                      external,
                      '{igdbAggregatedRating}',
                      ${JSON.stringify(igdbGame.aggregated_rating || 0)}::jsonb
                    ),
                    '{igdbImageId}',
                    ${JSON.stringify(imageId || null)}::jsonb
                  )
                `,
                updatedAt: sql`CURRENT_TIMESTAMP`,
              })
              .where(sql`id = ${matchingGame.id}`)
              .returning();

            if (game) {
              updatedCount++;
              console.log(
                `Updated game "${matchingGame.name}" (ID: ${matchingGame.id}):`,
                `\n  - Category: ${categoryPointer}`,
                `\n  - Release Date: ${firstReleaseDate}`,
                `\n  - Rating: ${igdbGame.aggregated_rating || 0}`,
                imageId
                  ? `\n  - Cover Image ID: ${imageId}`
                  : "\n  - No cover image found"
              );
            }
          } catch (error) {
            errorCount++;
            console.error(
              `Failed to update game "${matchingGame.name}" (ID: ${matchingGame.id}):`,
              error
            );
          }
        }
      });

      await sleep(DELAY_MS);
    } catch (error) {
      errorCount += batchIds.length;
      console.error(`Failed to process batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }

  return { updatedCount, errorCount };
}

export default defineTask({
  meta: {
    name: "games:update-igdb-data",
  },
  async run() {
    try {
      const { updatedCount, errorCount } = await updateIGDBGameData();
      const message = [
        `✅ Updated ${updatedCount} games with IGDB data.`,
        errorCount > 0 ? `❌ Failed to update ${errorCount} games.` : "",
      ]
        .filter(Boolean)
        .join("\n");

      return {
        result: errorCount === 0 ? "success" : "partial",
        message,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Task failed:", error);
      return {
        result: "error",
        message: `Failed to update game data from IGDB: ${errorMessage}`,
      };
    }
  },
});
