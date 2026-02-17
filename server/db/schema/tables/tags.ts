import {
  foreignKey,
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
  "tag",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique("tag_slug_key"),
    weight: real("weight").default(1.0).notNull(),
    ...defaultInsertTimestamps,
  },
  table => [index("tag_name_idx").on(table.name)]
);

export const gamesTags = pgTable(
  "game_tag",
  {
    gameId: integer("game_id").notNull(),
    tagId: integer("tag_id").notNull(),
  },
  table => [
    primaryKey({
      name: "game_tag_pkey",
      columns: [table.gameId, table.tagId],
    }),
    foreignKey({
      name: "game_tag_game_id_fkey",
      columns: [table.gameId],
      foreignColumns: [games.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "game_tag_tag_id_fkey",
      columns: [table.tagId],
      foreignColumns: [tags.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("game_tag_tag_id_idx").on(table.tagId),
  ]
);

export const BaseTagSchema = createSelectSchema(tags);
export const BaseInsertTagSchema = createInsertSchema(tags);

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;
