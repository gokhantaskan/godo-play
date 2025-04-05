import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";
import { platforms } from "./platforms";

/**
 * pc_store_platforms
 * Associates a submission with a PC store (e.g., "steam", "epic").
 * Previously, crossplayPlatforms was an integer array;
 * now we'll use a pivot table for crossplay references.
 */
export const storePlatforms = pgTable(
  "store_platforms",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id")
      .references(() => games.id, { onDelete: "cascade" })
      .notNull(),
    storeSlug: text("store_slug").notNull(),
    storeUrl: text("store_url"),
    ...defaultInsertTimestamps,
  },
  table => {
    return {
      submissionIdIdx: index("sp_submission_id_idx").on(table.submissionId),
      storeSlugIdx: index("sp_store_slug_idx").on(table.storeSlug),
    };
  }
);

/**
 * Junction table linking pc_store_platforms to platforms for crossplay.
 * Each row ties one PC store entry to a single platform,
 * allowing you to query crossplay on a per-platform basis.
 */
export const storeCrossplayPlatforms = pgTable(
  "store_crossplay_platforms",
  {
    storePlatformId: integer("store_platform_id")
      .references(() => storePlatforms.id, { onDelete: "cascade" })
      .notNull(),
    platformId: integer("platform_id")
      .references(() => platforms.id)
      .notNull(),
  },
  table => ({
    pk: primaryKey({
      columns: [table.storePlatformId, table.platformId],
    }),
    platformIdIdx: index("scp_platform_id_idx").on(table.platformId),
  })
);

/**
 * Base Zod schemas generated from Drizzle schema
 */
export const BaseStorePlatformSchema = createSelectSchema(storePlatforms);
export const BaseInsertStorePlatformSchema = createInsertSchema(storePlatforms);

export const BaseStoreCrossplayPlatformSchema = createSelectSchema(
  storeCrossplayPlatforms
);
export const BaseInsertStoreCrossplayPlatformSchema = createInsertSchema(
  storeCrossplayPlatforms
);

/**
 * Types for internal database usage
 */
export type StorePlatform = typeof storePlatforms.$inferSelect;
export type InsertStorePlatform = typeof storePlatforms.$inferInsert;
