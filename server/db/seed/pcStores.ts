import { SUPPORTED_PC_STORES } from "~~/shared/constants/pcStores";

import { db } from "..";
import { pcStores } from "../schema/tables/pcStores";

export async function seedPcStores() {
  try {
    const existingPcStores = await db.select().from(pcStores);

    if (existingPcStores.length === 0) {
      console.log("🌱 Seeding pc stores...");
      await db.insert(pcStores).values(
        SUPPORTED_PC_STORES.map(pcStore => ({
          id: pcStore.id,
          name: pcStore.label,
          slug: pcStore.slug,
        }))
      );
      console.log("✅ Pc stores seeded successfully!");
    } else {
      console.log("ℹ️ Pc stores already exist, skipping seed.");
    }
  } catch (error) {
    console.error("❌ Error seeding pc stores:", error);
    throw error;
  }
}
