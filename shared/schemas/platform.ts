import { z } from "zod";

import {
  BaseInsertPlatformSchema,
  BasePlatformSchema,
} from "~~/server/db/schema/tables/platforms";

// Extend base schemas with additional validation/transformation
export const PlatformSchema = BasePlatformSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsertPlatformSchema = BaseInsertPlatformSchema.extend({
  // Add any additional validation or transformations here
});

// Export types for use in the application
export type Platform = z.infer<typeof PlatformSchema>;
export type InsertPlatform = z.infer<typeof InsertPlatformSchema>;
