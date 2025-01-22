import { z } from "zod";

import {
  BaseInsertPcStoreCrossplayPlatformSchema,
  BaseInsertPcStorePlatformGroupSchema,
  BaseInsertPcStorePlatformSchema,
  BasePcStoreCrossplayPlatformSchema,
  BasePcStorePlatformGroupSchema,
  BasePcStorePlatformSchema,
} from "~~/server/db/schema/tables/pcStorePlatforms";

// Extend base schemas with additional validation/transformation
export const PcStorePlatformGroupSchema = BasePcStorePlatformGroupSchema.extend(
  {
    // Add any additional validation or transformations here
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }
);

export const InsertPcStorePlatformGroupSchema =
  BaseInsertPcStorePlatformGroupSchema.extend({
    // Add any additional validation or transformations here
  });

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

// Export types for use in the application
export type PcStorePlatformGroup = z.infer<typeof PcStorePlatformGroupSchema>;
export type InsertPcStorePlatformGroup = z.infer<
  typeof InsertPcStorePlatformGroupSchema
>;

export type PcStorePlatform = z.infer<typeof PcStorePlatformSchema>;
export type InsertPcStorePlatform = z.infer<typeof InsertPcStorePlatformSchema>;

export type PcStoreCrossplayPlatform = z.infer<
  typeof PcStoreCrossplayPlatformSchema
>;
export type InsertPcStoreCrossplayPlatform = z.infer<
  typeof InsertPcStoreCrossplayPlatformSchema
>;
