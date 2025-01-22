import { sql } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core";

export function defaultEmptyArray(name: string) {
  return text(name)
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`)
    .$type<string[]>();
}

export const defaultInsertTimestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow().$type<string>(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
    .$type<string>(),
};
