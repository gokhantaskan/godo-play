import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const gameCategories = pgTable("game_category", {
  id: serial("id").primaryKey(),
  pointer: integer("pointer").notNull().unique("game_category_pointer_key"),
  slug: text("slug").notNull().unique("game_category_slug_key"),
  ...defaultInsertTimestamps,
});
