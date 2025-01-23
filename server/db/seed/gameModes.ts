import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameModes } from "~~/server/db/schema/tables/gameModes";
import { GAME_MODES } from "~~/shared/constants/gameModes";

export async function seedGameModes() {
  try {
    const existingGameModes = await db.select().from(gameModes);

    if (!existingGameModes.length) {
      console.log("🌱 Seeding game modes...");

      await db.insert(gameModes).values(
        GAME_MODES.map(mode => ({
          id: mode.id,
          name: mode.name,
          slug: mode.slug,
        }))
      );

      console.log("✅ Game modes seeded successfully!");
    } else {
      console.log("🔄 Game modes already exist, skipping to update.");

      GAME_MODES.forEach(mode => {
        const existingMode = existingGameModes.find(p => p.id === mode.id);

        if (!existingMode) {
          console.log(`🔄 Inserting game mode ${mode.name}...`);

          db.insert(gameModes).values({
            id: mode.id,
            name: mode.name,
            slug: mode.slug,
          });
        } else {
          console.log(`🔄 Updating game mode ${mode.name}...`);

          db.update(gameModes)
            .set({
              name: mode.name,
              slug: mode.slug,
            })
            .where(eq(gameModes.id, mode.id));
        }
      });

      console.log("✅ Game modes updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding game modes:", error);
    throw error;
  }
}
