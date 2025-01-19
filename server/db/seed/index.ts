import { SUPPORTED_PLATFORMS } from "~~/shared/constants/platforms";

import { db } from "..";
import { platforms } from "../schema/tables/platforms";

export async function seed() {
  try {
    const existingPlatforms = await db.select().from(platforms);

    if (existingPlatforms.length === 0) {
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
      console.log("ℹ️ Platforms already exist, skipping seed.");
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
