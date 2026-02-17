import {
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
  "stores",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    ...defaultInsertTimestamps,
  },
  table => [index("stores_name_idx").on(table.name)]
);

// Junction table for store-platform relationships
export const storeSupportedPlatforms = pgTable(
  "store_supported_platforms",
  {
    storeId: integer("store_id")
      .references(() => stores.id, { onDelete: "cascade", onUpdate: "cascade" })
      .notNull(),
    platformId: integer("platform_id")
      .references(() => platforms.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
  },
  table => [
    primaryKey({ columns: [table.storeId, table.platformId] }),
    index("ssp_platform_id_idx").on(table.platformId),
  ]
);

// Base Zod schemas for the main table
export const BaseStoreSchema = createSelectSchema(stores);
export const BaseInsertStoreSchema = createInsertSchema(stores);

// Base Zod schemas for the junction table
export const BaseStoreSupportedPlatformSchema = createSelectSchema(
  storeSupportedPlatforms
);
export const BaseInsertStoreSupportedPlatformSchema = createInsertSchema(
  storeSupportedPlatforms
);

// Types for internal database usage
export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

export type StoreSupportedPlatform =
  typeof storeSupportedPlatforms.$inferSelect;
export type InsertStoreSupportedPlatform =
  typeof storeSupportedPlatforms.$inferInsert;
