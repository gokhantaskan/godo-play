import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const gameCategories = pgTable("game_categories", {
  id: serial("id").primaryKey(),
  pointer: integer("pointer").notNull().unique(),
  slug: text("slug").notNull().unique(),
  ...defaultInsertTimestamps,
});
