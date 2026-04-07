import type { Column, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { db } from "~~/server/db";

interface UpsertSeedOptions<
  TTable extends PgTable,
  TSource,
  TRow extends Record<string, unknown> = InferSelectModel<TTable>,
> {
  table: TTable;
  idColumn: Column;
  sourceData: TSource[];
  mapFn: (item: TSource) => Record<string, unknown>;
  hasChanged: (existing: TRow, source: TSource) => boolean;
  label: string;
}

type AnyPgTable = PgTable<any>;

export async function upsertSeedData<
  TTable extends PgTable,
  TSource,
  TRow extends Record<string, unknown> = InferSelectModel<TTable>,
>(options: UpsertSeedOptions<TTable, TSource, TRow>) {
  const { table, idColumn, sourceData, mapFn, hasChanged, label } = options;

  try {
    const existingRows = (await db
      .select()
      .from(table as AnyPgTable)) as TRow[];

    if (!existingRows.length) {
      console.log(`🌱 Seeding ${label}...`);
      await (
        db.insert(table as AnyPgTable) as ReturnType<typeof db.insert>
      ).values(sourceData.map(mapFn) as never);
      console.log(`✅ ${label} seeded successfully!`);
      return;
    }

    console.log(`🔄 ${label} already exist, checking for updates...`);

    const updates: Promise<unknown>[] = [];
    const inserts: Record<string, unknown>[] = [];

    for (const source of sourceData) {
      const mapped = mapFn(source);
      const existing = existingRows.find(
        row => row[idColumn.name] === mapped[idColumn.name]
      );

      if (!existing) {
        console.log(
          `🔄 Queuing insert for ${label.slice(0, -1)} ${(mapped as Record<string, string>).name}...`
        );
        inserts.push(mapped);
      } else if (hasChanged(existing, source)) {
        console.log(
          `🔄 Queuing update for ${label.slice(0, -1)} ${(mapped as Record<string, string>).name}...`
        );
        updates.push(
          db
            .update(table as AnyPgTable)
            .set(mapped as never)
            .where(eq(idColumn, mapped[idColumn.name]))
        );
      }
    }

    if (inserts.length > 0) {
      console.log(`🔄 Inserting ${inserts.length} new ${label}...`);
      await (
        db.insert(table as AnyPgTable) as ReturnType<typeof db.insert>
      ).values(inserts as never);
    }

    if (updates.length > 0) {
      console.log(`🔄 Updating ${updates.length} existing ${label}...`);
      await Promise.all(updates);
    }

    console.log(`✅ ${label} updated successfully!`);
  } catch (error) {
    console.error(`❌ Error seeding ${label}:`, error);
    throw error;
  }
}
