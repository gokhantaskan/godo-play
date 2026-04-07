import type { z } from "zod";

import {
  DbInsertPlatformGroupPlatformSchema,
  DbInsertPlatformGroupSchema,
  DbPlatformGroupPlatformSchema,
  DbPlatformGroupSchema,
} from "~~/server/db/schema/tables/platformGroups";

// Extend base schemas with additional validation/transformation
export const PlatformGroupSchema = DbPlatformGroupSchema;

export const InsertPlatformGroupSchema = DbInsertPlatformGroupSchema;

export const PlatformGroupPlatformsSchema =
  DbPlatformGroupPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

export const InsertPlatformGroupPlatformsSchema =
  DbInsertPlatformGroupPlatformSchema.extend({
    // Add any additional validation or transformations here
  });

// Export types for use in the application
export type PlatformGroup = z.infer<typeof PlatformGroupSchema>;
export type InsertPlatformGroup = z.infer<typeof InsertPlatformGroupSchema>;
export type PlatformGroupPlatform = z.infer<
  typeof PlatformGroupPlatformsSchema
>;
export type InsertPlatformGroupPlatform = z.infer<
  typeof InsertPlatformGroupPlatformsSchema
>;
