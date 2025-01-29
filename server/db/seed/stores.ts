import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import type { Store } from "~~/server/db/schema/tables/stores";
import { stores } from "~~/server/db/schema/tables/stores";
import { SUPPORTED_STORES } from "~~/shared/constants/stores";

export async function seedStores() {
  try {
    const existingStores = await db.select().from(stores);

    if (!existingStores.length) {
      console.log("🌱 Seeding PC stores...");

      await db.insert(stores).values(
        SUPPORTED_STORES.map(store => ({
          id: store.id,
          name: store.name,
          slug: store.slug,
        }))
      );

      console.log("✅ PC stores seeded successfully!");
    } else {
      console.log("🔄 PC stores already exist, checking for updates...");

      const updates: Promise<any>[] = [];
      const inserts: Pick<Store, "id" | "name" | "slug">[] = [];

      SUPPORTED_STORES.forEach(store => {
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
              .update(stores)
              .set({
                name: store.name,
                slug: store.slug,
              })
              .where(eq(stores.id, store.id))
          );
        }
      });

      if (inserts.length > 0) {
        console.log(`🔄 Inserting ${inserts.length} new PC stores...`);
        await db.insert(stores).values(inserts);
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
