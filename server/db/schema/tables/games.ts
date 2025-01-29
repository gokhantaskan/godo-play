import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { gameCategories } from "./gameCategories";

/**
 * The central table that stores information about a game submission.
 * This is the source of truth for submission types.
 */
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  external: jsonb("external")
    .$type<ExternalData>()
    .default(sql`'{}'::jsonb`),
  category: integer("category")
    .notNull()
    .references(() => gameCategories.pointer),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  ...defaultInsertTimestamps,
});

interface ExternalData {
  igdbId: number;
  igdbImageId?: string;
  igdbAggregatedRating?: number;
}

// Base Zod schemas for validation
const ExternalDataSchema = z.object({
  igdbId: z.number(),
  igdbImageId: z.string().optional(),
  igdbAggregatedRating: z.number().optional(),
});

export const DbGameSchema = createSelectSchema(games, {
  external: ExternalDataSchema,
});

export const DbInsertGameSchema = createInsertSchema(games, {
  external: ExternalDataSchema,
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
  storePlatforms: z.array(
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
