import { z } from "zod";

import {
  BaseInsertPcStoreCrossplayPlatformSchema,
  BaseInsertPcStorePlatformSchema,
  BasePcStoreCrossplayPlatformSchema,
  BasePcStorePlatformSchema,
} from "~~/server/db/schema/tables/pcStorePlatforms";

export const PcStorePlatformSchema = BasePcStorePlatformSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsertPcStorePlatformSchema =
  BaseInsertPcStorePlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export const PcStoreCrossplayPlatformSchema =
  BasePcStoreCrossplayPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export const InsertPcStoreCrossplayPlatformSchema =
  BaseInsertPcStoreCrossplayPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export type PcStorePlatform = z.infer<typeof PcStorePlatformSchema>;
export type InsertPcStorePlatform = z.infer<typeof InsertPcStorePlatformSchema>;

export type PcStoreCrossplayPlatform = z.infer<
  typeof PcStoreCrossplayPlatformSchema
>;
export type InsertPcStoreCrossplayPlatform = z.infer<
  typeof InsertPcStoreCrossplayPlatformSchema
>;
