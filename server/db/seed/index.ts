import { seedGameCategories } from "./gameCategories";
import { seedGameModes } from "./gameModes";
import { seedPlatforms } from "./platforms";
import { seedStores } from "./stores";

export async function seed() {
  try {
    await seedPlatforms();
    await seedStores();
    await seedGameModes();
    await seedGameCategories();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
