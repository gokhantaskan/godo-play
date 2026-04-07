import type { z } from "zod";

import {
  DbInsertStoreCrossplayPlatformSchema,
  DbInsertStorePlatformSchema,
  DbStoreCrossplayPlatformSchema,
  DbStorePlatformSchema,
} from "~~/server/db/schema/tables/storePlatforms";

export const StorePlatformSchema = DbStorePlatformSchema;
export const InsertStorePlatformSchema = DbInsertStorePlatformSchema;

export const StoreCrossplayPlatformSchema =
  DbStoreCrossplayPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export const InsertStoreCrossplayPlatformSchema =
  DbInsertStoreCrossplayPlatformSchema.extend({
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
