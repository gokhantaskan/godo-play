import { CATEGORIES } from "~~/shared/constants/categories";

import { db } from "..";
import { gameCategories } from "../schema/tables/gameCategories";

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
