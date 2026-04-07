import { platforms } from "~~/server/db/schema/tables/platforms";
import { SUPPORTED_PLATFORMS } from "~~/shared/constants/platforms";

import { upsertSeedData } from "./helpers";

export async function seedPlatforms() {
  await upsertSeedData({
    table: platforms,
    idColumn: platforms.id,
    sourceData: SUPPORTED_PLATFORMS,
    mapFn: p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      abbreviation: p.abbreviation,
    }),
    hasChanged: (existing, source) =>
      existing.name !== source.name ||
      existing.slug !== source.slug ||
      existing.abbreviation !== source.abbreviation,
    label: "platforms",
  });
}
