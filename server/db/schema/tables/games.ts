import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { gameCategories } from "./gameCategories";

/**
 * The central table that stores information about a game submission.
 * This is the source of truth for submission types.
 */
export const games = pgTable(
  "game",
  {
    id: serial("id").primaryKey(),
    external: jsonb("external")
      .$type<ExternalData>()
      .default(sql`'{}'::jsonb`),
    category: integer("category").notNull(),
    firstReleaseDate: date("first_release_date", { mode: "string" }),
    freeToPlay: boolean("free_to_play").notNull().default(false),
    name: text("name").notNull(),
    slug: text("slug").unique("game_slug_key").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
    ...defaultInsertTimestamps,
  },
  table => [
    foreignKey({
      name: "game_category_fkey",
      columns: [table.category],
      foreignColumns: [gameCategories.pointer],
    }),
    index("game_category_idx").on(table.category),
    index("game_name_idx").on(table.name),
    index("game_status_idx").on(table.status),
    index("game_first_release_date_idx").on(table.firstReleaseDate),
    index("game_created_at_idx").on(table.createdAt),
    index("game_updated_at_idx").on(table.updatedAt),
    index("game_external_igdb_rating_idx").using(
      "btree",
      sql`CAST(external->>'igdbAggregatedRating' AS float) DESC NULLS LAST`
    ),
    index("game_status_created_at_idx").on(
      table.status,
      table.createdAt.desc()
    ),
    index("game_approved_created_at_idx")
      .on(table.createdAt.desc())
      .where(sql`status = 'approved'`),
  ]
);

interface ExternalData {
  igdbId: number;
  igdbImageId?: string;
  igdbAggregatedRating?: number;
}

// Base Zod schemas for validation
const _ExternalDataSchema = z.object({
  igdbId: z.number(),
  igdbImageId: z.string().optional(),
  igdbAggregatedRating: z.number().optional(),
});

export const DbGameSchema = createSelectSchema(games, {
  external: _ExternalDataSchema,
});

export const DbInsertGameSchema = createInsertSchema(games, {
  external: _ExternalDataSchema,
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
      storeUrl: z.string().url().optional(),
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
