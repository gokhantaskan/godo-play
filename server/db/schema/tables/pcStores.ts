import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const pcStores = pgTable("pc_stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...defaultInsertTimestamps,
});

// Base Zod schemas generated from Drizzle schema
export const BasePcStoreSchema = createSelectSchema(pcStores);
export const BaseInsertPcStoreSchema = createInsertSchema(pcStores);

// Types for internal database usage
export type PcStore = typeof pcStores.$inferSelect;
export type InsertPcStore = typeof pcStores.$inferInsert;
