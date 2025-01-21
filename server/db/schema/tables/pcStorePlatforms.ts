import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { gameSubmissions } from "./gameSubmissions";
import { platforms } from "./platforms";

export const pcStorePlatformGroups = pgTable("pc_store_platform_groups", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id)
    .notNull(),
  ...defaultInsertTimestamps,
});

/**
 * pc_store_platforms
 * Associates a submission with a PC store (e.g., "steam", "epic").
 * Previously, crossplayPlatforms was an integer array;
 * now we'll use a pivot table for crossplay references.
 */
export const pcStorePlatforms = pgTable("pc_store_platforms", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id, { onDelete: "cascade" })
    .notNull(),
  storeSlug: text("store_slug").notNull(),
  ...defaultInsertTimestamps,
});

/**
 * Junction table linking pc_store_platforms to platforms for crossplay.
 * Each row ties one PC store entry to a single platform,
 * allowing you to query crossplay on a per-platform basis.
 */
export const pcStoreCrossplayPlatforms = pgTable(
  "pc_store_crossplay_platforms",
  {
    pcStorePlatformId: integer("pc_store_platform_id")
      .references(() => pcStorePlatforms.id, { onDelete: "cascade" })
      .notNull(),
    platformId: integer("platform_id")
      .references(() => platforms.id)
      .notNull(),
  },
  table => [
    primaryKey({
      columns: [table.pcStorePlatformId, table.platformId],
    }),
  ]
);

export const insertPcStorePlatformSchema = createInsertSchema(pcStorePlatforms);
export const selectPcStorePlatformSchema = createSelectSchema(pcStorePlatforms);

export const insertPcStoreCrossplayPlatformsSchema = createInsertSchema(
  pcStoreCrossplayPlatforms
);
export const selectPcStoreCrossplayPlatformsSchema = createSelectSchema(
  pcStoreCrossplayPlatforms
);
