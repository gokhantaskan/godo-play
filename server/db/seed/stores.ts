import { stores } from "~~/server/db/schema/tables/stores";
import { SUPPORTED_STORES } from "~~/shared/constants/stores";

import { upsertSeedData } from "./helpers";

export async function seedStores() {
  await upsertSeedData({
    table: stores,
    idColumn: stores.id,
    sourceData: SUPPORTED_STORES,
    mapFn: s => ({ id: s.id, name: s.name, slug: s.slug }),
    hasChanged: (existing, source) =>
      existing.name !== source.name || existing.slug !== source.slug,
    label: "PC stores",
  });
}
