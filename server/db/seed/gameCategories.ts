import { db } from "~~/server/db";
import { gameCategories } from "~~/server/db/schema/tables/gameCategories";
import { CATEGORIES } from "~~/shared/constants/categories";

export async function seedGameCategories() {
  try {
    const categories = await db
      .insert(gameCategories)
      .values(CATEGORIES)
      .onConflictDoNothing()
      .returning();

    console.log(`✅ Seeded ${categories.length} game categories`);

    return categories;
  } catch (error) {
    console.error("❌ Error seeding game categories:", error);
    throw error;
  }
}
