import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const gameCategories = pgTable("game_category", {
  id: serial("id").primaryKey(),
  pointer: integer("pointer").notNull().unique("game_category_pointer_key"),
  slug: text("slug").notNull().unique("game_category_slug_key"),
  ...defaultInsertTimestamps,
});

// Base Zod schemas generated from Drizzle schema
export const DbGameCategorySchema = createSelectSchema(gameCategories);
export const DbInsertGameCategorySchema = createInsertSchema(gameCategories);

// Types for internal database usage
export type DbGameCategory = typeof gameCategories.$inferSelect;
export type DbInsertGameCategory = typeof gameCategories.$inferInsert;
