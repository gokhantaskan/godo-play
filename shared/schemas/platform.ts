import type { z } from "zod";

import {
  DbInsertPlatformSchema,
  DbPlatformSchema,
} from "~~/server/db/schema/tables/platforms";

// Extend base schemas only if you need runtime date coercion:
export const PlatformSchema = DbPlatformSchema;

// If no extra validation is needed, you can directly export DbInsertPlatformSchema
export const InsertPlatformSchema = DbInsertPlatformSchema;

// Export Types
export type Platform = z.infer<typeof PlatformSchema>;
export type InsertPlatform = z.infer<typeof InsertPlatformSchema>;
