import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
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
      console.log("🔄 Platforms already exist, skipping to update.");

      SUPPORTED_PLATFORMS.forEach(platform => {
        const existingPlatform = existingPlatforms.find(
          p => p.id === platform.id
        );

        if (!existingPlatform) {
          console.log(`🔄 Inserting platform ${platform.name}...`);

          db.insert(platforms).values({
            id: platform.id,
            name: platform.name,
            slug: platform.slug,
            abbreviation: platform.abbreviation,
          });
        } else {
          console.log(`🔄 Updating platform ${platform.name}...`);

          db.update(platforms)
            .set({
              name: platform.name,
              slug: platform.slug,
            })
            .where(eq(platforms.id, platform.id));
        }
      });

      console.log("✅ Platforms updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding platforms:", error);
    throw error;
  }
}
