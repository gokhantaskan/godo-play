import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  serial,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";

/**
 * Table that stores crossplay evidence and information for games
 */
export const crossplayInformation = pgTable(
  "crossplay_information",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull(),
    evidenceUrl: text("evidence_url"),
    information: text("information"),
    isOfficial: boolean("is_official").default(false),
    ...defaultInsertTimestamps,
  },
  table => [
    foreignKey({
      name: "crossplay_information_game_id_fkey",
      columns: [table.gameId],
      foreignColumns: [games.id],
    }),
    unique("crossplay_information_game_id_key").on(table.gameId),
  ]
);

// Types for database and API usage
export type DbCrossplayInformation = typeof crossplayInformation.$inferSelect;
export type DbInsertCrossplayInformation =
  typeof crossplayInformation.$inferInsert;

// Zod schemas for validation
export const DbCrossplayInformationSchema =
  createSelectSchema(crossplayInformation);
export const DbInsertCrossplayInformationSchema =
  createInsertSchema(crossplayInformation);
