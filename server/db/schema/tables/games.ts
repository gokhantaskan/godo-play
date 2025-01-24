import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

/**
 * The central table that stores information about a game submission.
 * This is the source of truth for submission types.
 */
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  externalId: integer("external_id").unique().notNull(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  imageId: text("image_id").unique(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  ...defaultInsertTimestamps,
});

// Base Zod schemas for validation
export const DbGameSchema = createSelectSchema(games);
export const DbInsertGameSchema = createInsertSchema(games, {
  status: z.enum(["pending", "approved", "rejected"]),
});

// Types for database and API usage
export type DbGame = typeof games.$inferSelect;
export type DbInsertGame = typeof games.$inferInsert;

// Extended schema with relations for API responses
export const DbGameWithRelationsSchema = DbGameSchema.extend({
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

export type DbGameWithRelations = z.infer<typeof DbGameWithRelationsSchema>;
