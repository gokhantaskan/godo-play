import type { z } from "zod";

import {
  BaseInsertStoreCrossplayPlatformSchema,
  BaseInsertStorePlatformSchema,
  BaseStoreCrossplayPlatformSchema,
  BaseStorePlatformSchema,
} from "~~/server/db/schema/tables/storePlatforms";

export const StorePlatformSchema = BaseStorePlatformSchema;
export const InsertStorePlatformSchema = BaseInsertStorePlatformSchema;

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
