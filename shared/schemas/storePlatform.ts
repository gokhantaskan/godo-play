import { z } from "zod";

import {
  BaseInsertStoreCrossplayPlatformSchema,
  BaseInsertStorePlatformSchema,
  BaseStoreCrossplayPlatformSchema,
  BaseStorePlatformSchema,
} from "~~/server/db/schema/tables/storePlatforms";

export const StorePlatformSchema = BaseStorePlatformSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsertStorePlatformSchema = BaseInsertStorePlatformSchema.extend({
  // Add any additional validation or transformations here
});

export const StoreCrossplayPlatformSchema =
  BaseStoreCrossplayPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export const InsertStoreCrossplayPlatformSchema =
  BaseInsertStoreCrossplayPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export type StorePlatform = z.infer<typeof StorePlatformSchema>;
export type InsertStorePlatform = z.infer<typeof InsertStorePlatformSchema>;

export type StoreCrossplayPlatform = z.infer<
  typeof StoreCrossplayPlatformSchema
>;
export type InsertStoreCrossplayPlatform = z.infer<
  typeof InsertStoreCrossplayPlatformSchema
>;
