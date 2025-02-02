import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import type { GameMode } from "~~/server/db/schema/tables/gameModes";
import { gameModes } from "~~/server/db/schema/tables/gameModes";
import { SUPPORTED_GAME_MODES } from "~~/shared/constants/gameModes";

export async function seedGameModes() {
  try {
    const existingGameModes = await db.select().from(gameModes);

    if (!existingGameModes.length) {
      console.log("🌱 Seeding game modes...");

      await db.insert(gameModes).values(
        SUPPORTED_GAME_MODES.map(mode => ({
          id: mode.id,
          name: mode.name,
          slug: mode.slug,
        }))
      );

      console.log("✅ Game modes seeded successfully!");
    } else {
      console.log("🔄 Game modes already exist, checking for updates...");

      const updates: Promise<any>[] = [];
      const inserts: Pick<GameMode, "id" | "name" | "slug">[] = [];

      SUPPORTED_GAME_MODES.forEach(mode => {
        const existingMode = existingGameModes.find(p => p.id === mode.id);

        if (!existingMode) {
          console.log(`🔄 Queuing insert for game mode ${mode.name}...`);
          inserts.push({
            id: mode.id,
            name: mode.name,
            slug: mode.slug,
          });
        } else if (
          existingMode.name !== mode.name ||
          existingMode.slug !== mode.slug
        ) {
          console.log(`🔄 Queuing update for game mode ${mode.name}...`);
          updates.push(
            db
              .update(gameModes)
              .set({
                name: mode.name,
                slug: mode.slug,
              })
              .where(eq(gameModes.id, mode.id))
          );
        }
      });

      if (inserts.length > 0) {
        console.log(`🔄 Inserting ${inserts.length} new game modes...`);
        await db.insert(gameModes).values(inserts);
      }

      if (updates.length > 0) {
        console.log(`🔄 Updating ${updates.length} existing game modes...`);
        await Promise.all(updates);
      }

      console.log("✅ Game modes updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding game modes:", error);
    throw error;
  }
}
