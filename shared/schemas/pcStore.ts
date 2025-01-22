import { z } from "zod";

import {
  BaseInsertPcStoreSchema,
  BasePcStoreSchema,
} from "~~/server/db/schema/tables/pcStores";

// Extend base schemas with additional validation/transformation
export const PcStoreSchema = BasePcStoreSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsertPcStoreSchema = BaseInsertPcStoreSchema.extend({
  // Add any additional validation or transformations here
});

// Export types for use in the application
export type PcStore = z.infer<typeof PcStoreSchema>;
export type InsertPcStore = z.infer<typeof InsertPcStoreSchema>;
