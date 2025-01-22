import { integer, pgTable, primaryKey, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { gameSubmissions } from "./gameSubmissions";
import { platforms } from "./platforms";

/**
 * platform_groups
 * Represents a grouping concept for platforms associated with a single submission.
 * Instead of using an array, we'll create a junction table that links each platform individually.
 */
export const platformGroups = pgTable("platform_groups", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id, { onDelete: "cascade" })
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

export const insertPlatformGroupSchema = createInsertSchema(platformGroups);
export const selectPlatformGroupSchema = createSelectSchema(platformGroups);

export const insertPlatformGroupPlatformsSchema = createInsertSchema(
  platformGroupPlatforms
);
export const selectPlatformGroupPlatformsSchema = createSelectSchema(
  platformGroupPlatforms
);
