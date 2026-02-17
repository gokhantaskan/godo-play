import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import {
  stores,
  storeSupportedPlatforms,
} from "~~/server/db/schema/tables/stores";

// Update store schema
const UpdateStoreSchema = z.object({
  name: z.string(),
  supportedPlatformIds: z.array(z.number()),
});

export default defineEventHandler(async event => {
  try {
    const id = Number(event.context.params?.id);
    const body = await readBody(event);

    // Validate request body
    const validatedStore = UpdateStoreSchema.parse(body);

    // Start a transaction
    return await db.transaction(async tx => {
      // Update store name
      await tx
        .update(stores)
        .set({
          name: validatedStore.name,
        })
        .where(eq(stores.id, id));

      // Delete existing supported platforms
      await tx
        .delete(storeSupportedPlatforms)
        .where(eq(storeSupportedPlatforms.storeId, id));

      // Insert new supported platforms
      if (validatedStore.supportedPlatformIds.length > 0) {
        await tx.insert(storeSupportedPlatforms).values(
          validatedStore.supportedPlatformIds.map(platformId => ({
            storeId: id,
            platformId,
          }))
        );
      }

      // Return updated store with relations
      const storeWithPlatforms = await tx.query.stores.findFirst({
        where: eq(stores.id, id),
        with: {
          supportedPlatforms: {
            with: {
              platform: true,
            },
          },
        },
      });

      return storeWithPlatforms;
    });
  } catch (error) {
    throwApiError(error);
  }
});
