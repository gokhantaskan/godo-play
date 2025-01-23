import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { gameSubmissions } from "./gameSubmissions";

export const gameModes = pgTable("game_modes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...defaultInsertTimestamps,
});

/**
 * Junction table between game_submissions and game_modes.
 * Each record ties one game_submission to one game_mode.
 */
export const gameSubmissionGameModes = pgTable(
  "game_submission_game_modes",
  {
    submissionId: integer("submission_id")
      .references(() => gameSubmissions.id, { onDelete: "cascade" })
      .notNull(),
    gameModeId: integer("game_mode_id")
      .references(() => gameModes.id)
      .notNull(),
  },
  table => [primaryKey({ columns: [table.submissionId, table.gameModeId] })]
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
