import { integer, pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";
import { platforms } from "./platforms";

/**
 * platform_groups
 * Represents a grouping concept for platforms associated with a single submission.
 * Instead of using an array, we'll create a junction table that links each platform individually.
 */
export const platformGroups = pgTable("platform_groups", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => games.id, { onDelete: "cascade" })
    .notNull(),
  ...defaultInsertTimestamps,
});

/**
 * Junction table between platform_groups and platforms.
 * Each record ties one platform_group to one platform.
 */
export const platformGroupPlatforms = pgTable(
  "platform_group_platforms",
  {
    platformGroupId: integer("platform_group_id")
      .references(() => platformGroups.id, { onDelete: "cascade" })
      .notNull(),
    platformId: integer("platform_id")
      .references(() => platforms.id)
      .notNull(),
  },
  table => [primaryKey({ columns: [table.platformGroupId, table.platformId] })]
);

// Base Zod schemas generated from Drizzle schema
export const BasePlatformGroupSchema = createSelectSchema(platformGroups);
export const BaseInsertPlatformGroupSchema = createInsertSchema(platformGroups);

export const BasePlatformGroupPlatformsSchema = createSelectSchema(
  platformGroupPlatforms
);
export const BaseInsertPlatformGroupPlatformsSchema = createInsertSchema(
  platformGroupPlatforms
);

// Types for internal database usage
export type PlatformGroup = typeof platformGroups.$inferSelect;
export type InsertPlatformGroup = typeof platformGroups.$inferInsert;

export type PlatformGroupPlatform = typeof platformGroupPlatforms.$inferSelect;
export type InsertPlatformGroupPlatform =
  typeof platformGroupPlatforms.$inferInsert;
