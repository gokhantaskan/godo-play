import { sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgSequence,
  pgTable,
  primaryKey,
  real,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";

// Define a custom sequence starting from 100
export const gameModeIdSeq = pgSequence("game_mode_id_seq", {
  startWith: 100,
  increment: 1,
  minValue: 100,
});

export const gameModes = pgTable(
  "game_mode",
  {
    id: integer("id")
      .primaryKey()
      .default(sql`nextval('game_mode_id_seq')`),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique("game_mode_slug_key"),
    weight: real("weight").default(1.0).notNull(),
    ...defaultInsertTimestamps,
  },
  table => [index("game_mode_name_idx").on(table.name)]
);

/**
 * Junction table between games and game_modes.
 * Each record ties one game to one game_mode.
 */
export const gameGameModes = pgTable(
  "game_game_mode",
  {
    gameId: integer("game_id").notNull(),
    gameModeId: integer("game_mode_id").notNull(),
  },
  table => [
    primaryKey({
      name: "game_game_mode_pkey",
      columns: [table.gameId, table.gameModeId],
    }),
    foreignKey({
      name: "game_game_mode_game_id_fkey",
      columns: [table.gameId],
      foreignColumns: [games.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "game_game_mode_game_mode_id_fkey",
      columns: [table.gameModeId],
      foreignColumns: [gameModes.id],
    }).onDelete("cascade"),
    index("game_game_mode_game_mode_id_idx").on(table.gameModeId),
  ]
);

// Base Zod schemas generated from Drizzle schema
export const BaseGameModeSchema = createSelectSchema(gameModes);
export const BaseInsertGameModeSchema = createInsertSchema(gameModes);

export const BaseGameGameModeSchema = createSelectSchema(gameGameModes);
export const BaseInsertGameGameModeSchema = createInsertSchema(gameGameModes);

// Types for internal database usage
export type GameMode = typeof gameModes.$inferSelect;
export type InsertGameMode = typeof gameModes.$inferInsert;

export type GameGameMode = typeof gameGameModes.$inferSelect;
export type InsertGameGameMode = typeof gameGameModes.$inferInsert;
