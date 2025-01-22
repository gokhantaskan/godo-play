import type { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { defaultInsertTimestamps } from "../helpers/defaults";

export const pcStores = pgTable("pc_stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ...defaultInsertTimestamps,
});

export const insertPcStoreSchema = createInsertSchema(pcStores);
export const selectPcStoreSchema = createSelectSchema(pcStores);

export type GameStore = InferSelectModel<typeof pcStores>;
