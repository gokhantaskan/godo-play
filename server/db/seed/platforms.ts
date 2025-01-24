import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import type { Platform } from "~~/server/db/schema/tables/platforms";
import { platforms } from "~~/server/db/schema/tables/platforms";
import { SUPPORTED_PLATFORMS } from "~~/shared/constants/platforms";

export async function seedPlatforms() {
  try {
    const existingPlatforms = await db.select().from(platforms);

    if (!existingPlatforms.length) {
      console.log("🌱 Seeding platforms...");

      await db.insert(platforms).values(
        SUPPORTED_PLATFORMS.map(platform => ({
          id: platform.id,
          name: platform.name,
          slug: platform.slug,
          abbreviation: platform.abbreviation,
        }))
      );

      console.log("✅ Platforms seeded successfully!");
    } else {
      console.log("🔄 Platforms already exist, checking for updates...");

      const updates: Promise<any>[] = [];
      const inserts: Pick<Platform, "id" | "name" | "slug" | "abbreviation">[] =
        [];

      SUPPORTED_PLATFORMS.forEach(platform => {
        const existingPlatform = existingPlatforms.find(
          p => p.id === platform.id
        );

        if (!existingPlatform) {
          console.log(`🔄 Queuing insert for platform ${platform.name}...`);
          inserts.push({
            id: platform.id,
            name: platform.name,
            slug: platform.slug,
            abbreviation: platform.abbreviation,
          });
        } else if (
          existingPlatform.name !== platform.name ||
          existingPlatform.slug !== platform.slug ||
          existingPlatform.abbreviation !== platform.abbreviation
        ) {
          console.log(`🔄 Queuing update for platform ${platform.name}...`);
          updates.push(
            db
              .update(platforms)
              .set({
                name: platform.name,
                slug: platform.slug,
                abbreviation: platform.abbreviation,
              })
              .where(eq(platforms.id, platform.id))
          );
        }
      });

      if (inserts.length > 0) {
        console.log(`🔄 Inserting ${inserts.length} new platforms...`);
        await db.insert(platforms).values(inserts);
      }

      if (updates.length > 0) {
        console.log(`🔄 Updating ${updates.length} existing platforms...`);
        await Promise.all(updates);
      }

      console.log("✅ Platforms updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding platforms:", error);
    throw error;
  }
}
