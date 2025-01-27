import { sql } from "drizzle-orm";

import { CATEGORIES } from "~~/shared/constants/categories";

import { db } from "../db";
import { games } from "../db/schema";
import { getIGDBClient } from "../utils/igdb";

const BATCH_SIZE = 10;
const DELAY_MS = 250;

const categoryIds = CATEGORIES.map(c => c.pointer);

// IGDB category mapping to our category pointers
const IGDB_CATEGORY_MAP = Array.from(
  { length: categoryIds.length },
  (_, i) => categoryIds[i]
);

async function updateAggregatedRatings() {
  const submissions = await db.query.games.findMany({
    columns: {
      id: true,
      external: true,
      name: true,
      category: true,
    },
    where: sql`external IS NOT NULL AND external->>'igdbId' IS NOT NULL`,
  });

  const igdbIds = submissions
    .map(game => game.external?.igdbId)
    .filter(Boolean);

  if (!igdbIds.length) {
    return 0;
  }

  let updatedCount = 0;

  for (let i = 0; i < igdbIds.length; i += BATCH_SIZE) {
    const batchIds = igdbIds.slice(i, i + BATCH_SIZE);
    const igdbClient = await getIGDBClient();

    const requestBody = `fields id,category,aggregated_rating; where id = (${batchIds.join(",")});`;
    const response = await igdbClient("games", requestBody);

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`);
    }

    const igdbGames = await response.json();
    console.log("Response:", igdbGames);

    for (const igdbGame of igdbGames) {
      const idStr = igdbGame.id.toString();
      const matchingSubmission = submissions.find(
        s => s.external?.igdbId?.toString() === idStr
      );

      if (!matchingSubmission) {
        console.log(`No matching game found for IGDB ID: ${idStr}`);
        continue;
      }

      // Map IGDB category to our category pointer, default to main_game (0)
      const categoryPointer = IGDB_CATEGORY_MAP[igdbGame.category] ?? 0;

      const [game] = await db
        .update(games)
        .set({
          category: categoryPointer,
          external: sql`
            jsonb_set(
              external,
              '{igdbAggregatedRating}',
              ${JSON.stringify(igdbGame.aggregated_rating || 0)}::jsonb
            )
          `,
        })
        .where(sql`id = ${matchingSubmission.id}`)
        .returning();

      if (game) {
        updatedCount++;
        console.log(
          `Updated game ${matchingSubmission.name} with category: ${categoryPointer}`
        );
      }
    }

    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  return updatedCount;
}

export default defineTask({
  meta: {
    name: "games:update-ratings",
  },
  async run() {
    try {
      const updatedCount = await updateAggregatedRatings();
      return {
        result: "success ✅",
        message: `Updated ${updatedCount} games.`,
      };
    } catch (error) {
      console.error(error);
      return {
        result: "error ❌",
        message: "Failed to update game ratings",
      };
    }
  },
});
