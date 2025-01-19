import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
} from "drizzle-zod";

import { defaultInsertTimestamps } from "./helpers/defaults";

/** 
 * The central table that stores information about a game submission.
 * (IGDB references, name, slug, image, status)
 */
export const gameSubmissions = pgTable("game_submissions", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull(),      // IGDB game ID
  gameName: text("game_name").notNull(),  // IGDB game name
  gameSlug: text("game_slug").notNull(),  // IGDB game slug
  gameImageId: text("game_image_id"),     // IGDB image ID
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  ...defaultInsertTimestamps,
});

/** 
 * A table of distinct platforms (instead of storing them as arrays).
 * This allows advanced queries (like searching by platform name/ID).
 */
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),  // e.g., "PlayStation 5", "Xbox Series X"
  slug: text("slug").notNull(),  // e.g., "ps5", "xbox-series-x"
  ...defaultInsertTimestamps,
});

/** 
 * platform_groups 
 * Represents a grouping concept for platforms associated with a single submission.
 * Instead of using an array, we'll create a junction table that links each platform individually.
 */
export const platformGroups = pgTable("platform_groups", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id)
    .notNull(),
  groupName: text("group_name").notNull(), // e.g., "Standard Platforms"
  ...defaultInsertTimestamps,
});

/**
 * Junction table between platform_groups and platforms.
 * Each record ties one platform_group to one platform.
 */
export const platformGroupPlatforms = pgTable("platform_group_platforms", {
  platformGroupId: integer("platform_group_id")
    .references(() => platformGroups.id)
    .notNull(),
  platformId: integer("platform_id")
    .references(() => platforms.id)
    .notNull(),
  // Composite primary key ensures unique pairs
  primaryKey: primaryKey("platformGroupId", "platformId"),
});

/** 
 * pc_store_platforms 
 * Associates a submission with a PC store (e.g., "steam", "epic").
 * Previously, crossplayPlatforms was an integer array; 
 * now we’ll use a pivot table for crossplay references.
 */
export const pcStorePlatforms = pgTable("pc_store_platforms", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id)
    .notNull(),
  storeSlug: text("store_slug").notNull(), // e.g., "steam", "epic"
  ...defaultInsertTimestamps,
});

/** 
 * Junction table linking pc_store_platforms to platforms for crossplay.
 * Each row ties one PC store entry to a single platform, 
 * allowing you to query crossplay on a per-platform basis.
 */
export const pcStoreCrossplayPlatforms = pgTable("pc_store_crossplay_platforms", {
  pcStorePlatformId: integer("pc_store_platform_id")
    .references(() => pcStorePlatforms.id)
    .notNull(),
  platformId: integer("platform_id")
    .references(() => platforms.id)
    .notNull(),
  primaryKey: primaryKey("pcStorePlatformId", "platformId"),
});

/**
 * Define relations using Drizzle's "relations" helper.
 * This clarifies how tables connect for your ORM queries.
 */
export const gameSubmissionsRelations = relations(
  gameSubmissions,
  ({ many }) => ({
    // A submission can have many platform groups and many pc store entries
    platformGroups: many(platformGroups),
    pcStorePlatforms: many(pcStorePlatforms),
  })
);

export const platformGroupsRelations = relations(platformGroups, ({ one, many }) => ({
  submission: one(gameSubmissions, {
    fields: [platformGroups.submissionId],
    references: [gameSubmissions.id],
  }),
  // a platform group can be linked to many platforms via platformGroupPlatforms
  platformGroupPlatforms: many(platformGroupPlatforms),
}));

export const platformGroupPlatformsRelations = relations(
  platformGroupPlatforms,
  ({ one }) => ({
    platformGroup: one(platformGroups, {
      fields: [platformGroupPlatforms.platformGroupId],
      references: [platformGroups.id],
    }),
    platform: one(platforms, {
      fields: [platformGroupPlatforms.platformId],
      references: [platforms.id],
    }),
  })
);

export const pcStorePlatformsRelations = relations(
  pcStorePlatforms,
  ({ one, many }) => ({
    submission: one(gameSubmissions, {
      fields: [pcStorePlatforms.submissionId],
      references: [gameSubmissions.id],
    }),
    // link to crossplay tables
    crossplayEntries: many(pcStoreCrossplayPlatforms),
  })
);

export const pcStoreCrossplayPlatformsRelations = relations(
  pcStoreCrossplayPlatforms,
  ({ one }) => ({
    pcStorePlatform: one(pcStorePlatforms, {
      fields: [pcStoreCrossplayPlatforms.pcStorePlatformId],
      references: [pcStorePlatforms.id],
    }),
    platform: one(platforms, {
      fields: [pcStoreCrossplayPlatforms.platformId],
      references: [platforms.id],
    }),
  })
);

/**
 * Zod Schemas for validation, now extended to new tables.
 */
export const insertGameSubmissionSchema = createInsertSchema(gameSubmissions);
export const selectGameSubmissionSchema = createSelectSchema(gameSubmissions);

export const insertPlatformSchema = createInsertSchema(platforms);
export const selectPlatformSchema = createSelectSchema(platforms);

export const insertPlatformGroupSchema = createInsertSchema(platformGroups);
export const selectPlatformGroupSchema = createSelectSchema(platformGroups);

export const insertPlatformGroupPlatformsSchema = createInsertSchema(platformGroupPlatforms);
export const selectPlatformGroupPlatformsSchema = createSelectSchema(platformGroupPlatforms);

export const insertPcStorePlatformSchema = createInsertSchema(pcStorePlatforms);
export const selectPcStorePlatformSchema = createSelectSchema(pcStorePlatforms);

export const insertPcStoreCrossplayPlatformsSchema = createInsertSchema(pcStoreCrossplayPlatforms);
export const selectPcStoreCrossplayPlatformsSchema = createSelectSchema(pcStoreCrossplayPlatforms);
