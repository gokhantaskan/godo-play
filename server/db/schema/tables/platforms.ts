import { index, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const platforms = pgTable(
  "platform",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    abbreviation: text("abbreviation").notNull(),
    slug: text("slug").notNull().unique("platform_slug_key"),
    ...defaultInsertTimestamps,
  },
  table => [
    index("platform_name_idx").on(table.name),
    index("platform_abbreviation_idx").on(table.abbreviation),
  ]
);

// Base Zod schemas generated from Drizzle schema
export const DbPlatformSchema = createSelectSchema(platforms);
export const DbInsertPlatformSchema = createInsertSchema(platforms);

// Types for internal database usage
export type DbPlatform = typeof platforms.$inferSelect;
export type DbInsertPlatform = typeof platforms.$inferInsert;
