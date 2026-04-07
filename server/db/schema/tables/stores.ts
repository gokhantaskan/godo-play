import {
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";
import { platforms } from "./platforms";

// Main stores table
export const stores = pgTable(
  "store",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique("store_slug_key"),
    ...defaultInsertTimestamps,
  },
  table => [index("store_name_idx").on(table.name)]
);

// Junction table for store-platform relationships
export const storeSupportedPlatforms = pgTable(
  "store_supported_platform",
  {
    storeId: integer("store_id").notNull(),
    platformId: integer("platform_id").notNull(),
  },
  table => [
    primaryKey({
      name: "store_supported_platform_pkey",
      columns: [table.storeId, table.platformId],
    }),
    foreignKey({
      name: "store_supported_platform_store_id_fkey",
      columns: [table.storeId],
      foreignColumns: [stores.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "store_supported_platform_platform_id_fkey",
      columns: [table.platformId],
      foreignColumns: [platforms.id],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    index("store_supported_platform_platform_id_idx").on(table.platformId),
  ]
);

// Base Zod schemas for the main table
export const DbStoreSchema = createSelectSchema(stores);
export const DbInsertStoreSchema = createInsertSchema(stores);

// Base Zod schemas for the junction table
export const DbStoreSupportedPlatformSchema = createSelectSchema(
  storeSupportedPlatforms
);
export const DbInsertStoreSupportedPlatformSchema = createInsertSchema(
  storeSupportedPlatforms
);

// Types for internal database usage
export type DbStore = typeof stores.$inferSelect;
export type DbInsertStore = typeof stores.$inferInsert;

export type DbStoreSupportedPlatform =
  typeof storeSupportedPlatforms.$inferSelect;
export type DbInsertStoreSupportedPlatform =
  typeof storeSupportedPlatforms.$inferInsert;
