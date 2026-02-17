import {
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { games } from "./games";
import { platforms } from "./platforms";

/**
 * platform_group
 * Represents a grouping concept for platforms associated with a single game.
 * Instead of using an array, we'll create a junction table that links each platform individually.
 */
export const platformGroups = pgTable(
  "platform_group",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").notNull(),
    ...defaultInsertTimestamps,
  },
  table => [
    foreignKey({
      name: "platform_group_game_id_fkey",
      columns: [table.gameId],
      foreignColumns: [games.id],
    }).onDelete("cascade"),
    index("platform_group_game_id_idx").on(table.gameId),
  ]
);

/**
 * Junction table between platform_groups and platforms.
 * Each record ties one platform_group to one platform.
 */
export const platformGroupPlatforms = pgTable(
  "platform_group_platform",
  {
    platformGroupId: integer("platform_group_id").notNull(),
    platformId: integer("platform_id").notNull(),
  },
  table => [
    primaryKey({
      name: "platform_group_platform_pkey",
      columns: [table.platformGroupId, table.platformId],
    }),
    foreignKey({
      name: "platform_group_platform_platform_group_id_fkey",
      columns: [table.platformGroupId],
      foreignColumns: [platformGroups.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "platform_group_platform_platform_id_fkey",
      columns: [table.platformId],
      foreignColumns: [platforms.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("platform_group_platform_platform_id_idx").on(table.platformId),
  ]
);

// Base Zod schemas generated from Drizzle schema
export const BasePlatformGroupSchema = createSelectSchema(platformGroups);
export const BaseInsertPlatformGroupSchema = createInsertSchema(platformGroups);

export const BasePlatformGroupPlatformsSchema = createSelectSchema(
  platformGroupPlatforms
);
export const BaseInsertPlatformGroupPlatformsSchema = createInsertSchema(
  platformGroupPlatforms
);

// Types for internal database usage
export type PlatformGroup = typeof platformGroups.$inferSelect;
export type InsertPlatformGroup = typeof platformGroups.$inferInsert;

export type PlatformGroupPlatform = typeof platformGroupPlatforms.$inferSelect;
export type InsertPlatformGroupPlatform =
  typeof platformGroupPlatforms.$inferInsert;
