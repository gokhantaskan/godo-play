import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  slug: text("slug").notNull().unique(),
  ...defaultInsertTimestamps,
});

// Base Zod schemas generated from Drizzle schema
export const BasePlatformSchema = createSelectSchema(platforms);
export const BaseInsertPlatformSchema = createInsertSchema(platforms);

// Types for internal database usage
export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = typeof platforms.$inferInsert;
