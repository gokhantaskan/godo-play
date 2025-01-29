import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";

/**
 * Table that stores crossplay evidence and information for games
 */
export const crossplayInformation = pgTable("crossplay_information", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id)
    .unique(), // One-to-one relationship with games
  evidenceUrl: text("evidence_url"),
  information: text("information"),
  ...defaultInsertTimestamps,
});

// Types for database and API usage
export type DbCrossplayInformation = typeof crossplayInformation.$inferSelect;
export type DbInsertCrossplayInformation =
  typeof crossplayInformation.$inferInsert;

// Zod schemas for validation
export const DbCrossplayInformationSchema =
  createSelectSchema(crossplayInformation);
export const DbInsertCrossplayInformationSchema =
  createInsertSchema(crossplayInformation);
