import {
  foreignKey,
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
 * store_platform
 * Associates a submission with a PC store (e.g., "steam", "epic").
 * Previously, crossplayPlatforms was an integer array;
 * now we'll use a pivot table for crossplay references.
 */
export const storePlatforms = pgTable(
  "store_platform",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id").notNull(),
    storeSlug: text("store_slug").notNull(),
    storeUrl: text("store_url"),
    ...defaultInsertTimestamps,
  },
  table => [
    foreignKey({
      name: "store_platform_submission_id_fkey",
      columns: [table.submissionId],
      foreignColumns: [games.id],
    }).onDelete("cascade"),
    index("store_platform_submission_id_idx").on(table.submissionId),
    index("store_platform_store_slug_idx").on(table.storeSlug),
  ]
);

/**
 * Junction table linking store_platforms to platforms for crossplay.
 * Each row ties one store entry to a single platform,
 * allowing you to query crossplay on a per-platform basis.
 */
export const storeCrossplayPlatforms = pgTable(
  "store_crossplay_platform",
  {
    storePlatformId: integer("store_platform_id").notNull(),
    platformId: integer("platform_id").notNull(),
  },
  table => [
    primaryKey({
      name: "store_crossplay_platform_pkey",
      columns: [table.storePlatformId, table.platformId],
    }),
    foreignKey({
      name: "store_crossplay_platform_store_platform_id_fkey",
      columns: [table.storePlatformId],
      foreignColumns: [storePlatforms.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "store_crossplay_platform_platform_id_fkey",
      columns: [table.platformId],
      foreignColumns: [platforms.id],
    }),
    index("store_crossplay_platform_platform_id_idx").on(table.platformId),
  ]
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

export type StoreCrossplayPlatform =
  typeof storeCrossplayPlatforms.$inferSelect;
export type InsertStoreCrossplayPlatform =
  typeof storeCrossplayPlatforms.$inferInsert;
