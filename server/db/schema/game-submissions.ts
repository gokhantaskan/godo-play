import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "./helpers/defaults";

export const gameSubmissions = pgTable("game_submissions", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull(), // IGDB game ID
  gameName: text("game_name").notNull(), // IGDB game name
  gameSlug: text("game_slug").notNull(), // IGDB game slug
  gameImageId: text("game_image_id"), // IGDB image ID
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  ...defaultInsertTimestamps,
});

export const platformGroups = pgTable("platform_groups", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id)
    .notNull(),
  platforms: integer("platforms").array().notNull(), // Array of platform IDs
  ...defaultInsertTimestamps,
});

export const pcStorePlatforms = pgTable("pc_store_platforms", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .references(() => gameSubmissions.id)
    .notNull(),
  storeSlug: text("store_slug").notNull(), // e.g., "steam", "epic", etc.
  crossplayPlatforms: integer("crossplay_platforms").array().notNull(), // Array of platform IDs
  ...defaultInsertTimestamps,
});

export const gameSubmissionsRelations = relations(
  gameSubmissions,
  ({ many }) => ({
    platformGroups: many(platformGroups),
    pcStorePlatforms: many(pcStorePlatforms),
  })
);

export const platformGroupsRelations = relations(platformGroups, ({ one }) => ({
  submission: one(gameSubmissions, {
    fields: [platformGroups.submissionId],
    references: [gameSubmissions.id],
  }),
}));

export const pcStorePlatformsRelations = relations(
  pcStorePlatforms,
  ({ one }) => ({
    submission: one(gameSubmissions, {
      fields: [pcStorePlatforms.submissionId],
      references: [gameSubmissions.id],
    }),
  })
);

// Zod Schemas for validation
export const insertGameSubmissionSchema = createInsertSchema(gameSubmissions);
export const selectGameSubmissionSchema = createSelectSchema(gameSubmissions);

export const insertPlatformGroupSchema = createInsertSchema(platformGroups);
export const selectPlatformGroupSchema = createSelectSchema(platformGroups);

export const insertPcStorePlatformSchema = createInsertSchema(pcStorePlatforms);
export const selectPcStorePlatformSchema = createSelectSchema(pcStorePlatforms);
