import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

/**
 * The central table that stores information about a game submission.
 * (IGDB references, name, slug, image, status)
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

export const insertGameSubmissionSchema = createInsertSchema(gameSubmissions);
export const selectGameSubmissionSchema = createSelectSchema(gameSubmissions);
