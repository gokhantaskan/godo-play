import { z } from "zod";

import {
  BaseInsertStoreSchema,
  BaseStoreSchema,
} from "~~/server/db/schema/tables/stores";

// Extend base schemas with additional validation/transformation
export const StoreSchema = BaseStoreSchema;
export const InsertStoreSchema = BaseInsertStoreSchema;

// Store with relations schema
export const StoreWithRelationsSchema = StoreSchema.extend({
  supportedPlatforms: z.array(
    z.object({
      platform: z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        abbreviation: z.string(),
      }),
    })
  ),
});

// Export types for use in the application
export type Store = z.infer<typeof StoreSchema>;
export type InsertStore = z.infer<typeof InsertStoreSchema>;
export type StoreWithRelations = z.infer<typeof StoreWithRelationsSchema>;
