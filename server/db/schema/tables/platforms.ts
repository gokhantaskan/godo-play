import type { InferSelectModel } from "drizzle-orm";
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

export const insertPlatformSchema = createInsertSchema(platforms);
export const selectPlatformSchema = createSelectSchema(platforms);

export type Platform = InferSelectModel<typeof platforms>;
