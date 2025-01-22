import { seedPcStores } from "./pcStores";
import { seedPlatforms } from "./platforms";

export async function seed() {
  try {
    await seedPlatforms();
    await seedPcStores();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
