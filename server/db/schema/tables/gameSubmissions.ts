import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

/**
 * The central table that stores information about a game submission.
 * This is the source of truth for submission types.
 */
export const gameSubmissions = pgTable("game_submissions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").unique().notNull(),
  gameName: text("game_name").notNull(),
  gameSlug: text("game_slug").unique().notNull(),
  gameImageId: text("game_image_id").unique(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  ...defaultInsertTimestamps,
});

// Base Zod schemas for validation
export const GameSubmissionSchema = createSelectSchema(gameSubmissions);
export const InsertGameSubmissionSchema = createInsertSchema(gameSubmissions, {
  status: z.enum(["pending", "approved", "rejected"]),
});

// Types for database and API usage
export type GameSubmission = typeof gameSubmissions.$inferSelect;
export type InsertGameSubmission = typeof gameSubmissions.$inferInsert;

// Extended schema with relations for API responses
export const GameSubmissionWithRelationsSchema = GameSubmissionSchema.extend({
  platformGroups: z.array(
    z.object({
      id: z.number(),
      platformGroupPlatforms: z.array(
        z.object({
          platform: z.object({
            id: z.number(),
            name: z.string(),
            slug: z.string(),
          }),
        })
      ),
    })
  ),
  pcStorePlatforms: z.array(
    z.object({
      id: z.number(),
      storeSlug: z.string(),
      crossplayEntries: z.array(
        z.object({
          platform: z.object({
            id: z.number(),
            name: z.string(),
            slug: z.string(),
          }),
        })
      ),
    })
  ),
});

export type GameSubmissionWithRelations = z.infer<
  typeof GameSubmissionWithRelationsSchema
>;
