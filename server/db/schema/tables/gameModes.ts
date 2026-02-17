import { sql } from "drizzle-orm";
import {
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
  "game_modes",
  {
    id: integer("id")
      .primaryKey()
      .default(sql`nextval('game_mode_id_seq')`),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    weight: real("weight").default(1.0).notNull(),
    ...defaultInsertTimestamps,
  },
  table => [index("game_modes_name_idx").on(table.name)]
);

/**
 * Junction table between game_submissions and game_modes.
 * Each record ties one game_submission to one game_mode.
 */
export const gameSubmissionGameModes = pgTable(
  "game_submission_game_modes",
  {
    submissionId: integer("submission_id")
      .references(() => games.id, { onDelete: "cascade" })
      .notNull(),
    gameModeId: integer("game_mode_id")
      .references(() => gameModes.id, { onDelete: "cascade" })
      .notNull(),
  },
  table => [
    primaryKey({ columns: [table.submissionId, table.gameModeId] }),
    index("gm_gm_game_mode_id_idx").on(table.gameModeId),
  ]
);

// Base Zod schemas generated from Drizzle schema
export const BaseGameModeSchema = createSelectSchema(gameModes);
export const BaseInsertGameModeSchema = createInsertSchema(gameModes);

export const BaseGameSubmissionGameModeSchema = createSelectSchema(
  gameSubmissionGameModes
);
export const BaseInsertGameSubmissionGameModeSchema = createInsertSchema(
  gameSubmissionGameModes
);

// Types for internal database usage
export type GameMode = typeof gameModes.$inferSelect;
export type InsertGameMode = typeof gameModes.$inferInsert;

export type GameSubmissionGameMode =
  typeof gameSubmissionGameModes.$inferSelect;
export type InsertGameSubmissionGameMode =
  typeof gameSubmissionGameModes.$inferInsert;
