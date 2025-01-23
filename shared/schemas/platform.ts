import { z } from "zod";

import {
  BaseInsertPlatformSchema,
  BasePlatformSchema,
} from "~~/server/db/schema/tables/platforms";

// Extend base schemas only if you need runtime date coercion:
export const PlatformSchema = BasePlatformSchema.extend({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// If no extra validation is needed, you can directly export BaseInsertPlatformSchema
export const InsertPlatformSchema = BaseInsertPlatformSchema;

// Export Types
export type Platform = z.infer<typeof PlatformSchema>;
export type InsertPlatform = z.infer<typeof InsertPlatformSchema>;
