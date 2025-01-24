import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import type { PcStore } from "~~/server/db/schema/tables/pcStores";
import { pcStores } from "~~/server/db/schema/tables/pcStores";
import { SUPPORTED_PC_STORES } from "~~/shared/constants/pcStores";

export async function seedPcStores() {
  try {
    const existingStores = await db.select().from(pcStores);

    if (!existingStores.length) {
      console.log("🌱 Seeding PC stores...");

      await db.insert(pcStores).values(
        SUPPORTED_PC_STORES.map(store => ({
          id: store.id,
          name: store.name,
          slug: store.slug,
        }))
      );

      console.log("✅ PC stores seeded successfully!");
    } else {
      console.log("🔄 PC stores already exist, checking for updates...");

      const updates: Promise<any>[] = [];
      const inserts: Pick<PcStore, "id" | "name" | "slug">[] = [];

      SUPPORTED_PC_STORES.forEach(store => {
        const existingStore = existingStores.find(p => p.id === store.id);

        if (!existingStore) {
          console.log(`🔄 Queuing insert for PC store ${store.name}...`);
          inserts.push({
            id: store.id,
            name: store.name,
            slug: store.slug,
          });
        } else if (
          existingStore.name !== store.name ||
          existingStore.slug !== store.slug
        ) {
          console.log(`🔄 Queuing update for PC store ${store.name}...`);
          updates.push(
            db
              .update(pcStores)
              .set({
                name: store.name,
                slug: store.slug,
              })
              .where(eq(pcStores.id, store.id))
          );
        }
      });

      if (inserts.length > 0) {
        console.log(`🔄 Inserting ${inserts.length} new PC stores...`);
        await db.insert(pcStores).values(inserts);
      }

      if (updates.length > 0) {
        console.log(`🔄 Updating ${updates.length} existing PC stores...`);
        await Promise.all(updates);
      }

      console.log("✅ PC stores updated successfully!");
    }
  } catch (error) {
    console.error("❌ Error seeding PC stores:", error);
    throw error;
  }
}
