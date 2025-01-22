import { z } from "zod";

import {
  BaseInsertPlatformGroupPlatformsSchema,
  BaseInsertPlatformGroupSchema,
  BasePlatformGroupPlatformsSchema,
  BasePlatformGroupSchema,
} from "~~/server/db/schema/tables/platformGroups";

// Extend base schemas with additional validation/transformation
export const PlatformGroupSchema = BasePlatformGroupSchema.extend({
  // Add any additional validation or transformations here
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const InsertPlatformGroupSchema = BaseInsertPlatformGroupSchema.extend({
  // Add any additional validation or transformations here
});

export const PlatformGroupPlatformsSchema =
  BasePlatformGroupPlatformsSchema.extend({
    // Add any additional validation or transformations here
  });

export const InsertPlatformGroupPlatformsSchema =
  BaseInsertPlatformGroupPlatformsSchema.extend({
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
