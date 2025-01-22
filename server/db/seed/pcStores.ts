import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { pcStores } from "~~/server/db/schema/tables/pcStores";
import { SUPPORTED_PC_STORES } from "~~/shared/constants/pcStores";

export async function seedPcStores() {
  try {
    const existingStores = await db.select().from(pcStores);

    if (!existingStores.length) {
      console.log("🌱 Seeding pc stores...");

      await db.insert(pcStores).values(
        SUPPORTED_PC_STORES.map(store => ({
          id: store.id,
          name: store.name,
          slug: store.slug,
        }))
      );

      console.log("✅ Platforms seeded successfully!");
    } else {
      console.log("🔄 Platforms already exist, skipping to update.");

      SUPPORTED_PC_STORES.forEach(store => {
        const existingStore = existingStores.find(p => p.id === store.id);

        if (!existingStore) {
          console.log(`🔄 Inserting pc store ${store.name}...`);

          db.insert(pcStores).values({
            id: store.id,
            name: store.name,
            slug: store.slug,
          });
        } else {
          console.log(`🔄 Updating pc store ${store.name}...`);

          db.update(pcStores)
            .set({
              name: store.name,
              slug: store.slug,
            })
            .where(eq(pcStores.id, store.id));
        }
      });

      console.log("✅ Platforms updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding platforms:", error);
    throw error;
  }
}
