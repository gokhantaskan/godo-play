import {
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";

export const tags = pgTable(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    weight: real("weight").default(1.0).notNull(),
    ...defaultInsertTimestamps,
  },
  table => [index("tags_name_idx").on(table.name)]
);

export const gamesTags = pgTable(
  "games_tags",
  {
    gameId: integer("game_id")
      .references(() => games.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    tagId: integer("tag_id")
      .references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
  },
  table => [
    primaryKey({ columns: [table.gameId, table.tagId] }),
    index("games_tags_tag_id_idx").on(table.tagId),
  ]
);

export const BaseTagSchema = createSelectSchema(tags);
export const BaseInsertTagSchema = createInsertSchema(tags);

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
