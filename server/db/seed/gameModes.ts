import { gameModes } from "~~/server/db/schema/tables/gameModes";
import { SUPPORTED_GAME_MODES } from "~~/shared/constants/gameModes";

import { upsertSeedData } from "./helpers";

export async function seedGameModes() {
  await upsertSeedData({
    table: gameModes,
    idColumn: gameModes.id,
    sourceData: SUPPORTED_GAME_MODES,
    mapFn: m => ({ id: m.id, name: m.name, slug: m.slug }),
    hasChanged: (existing, source) =>
      existing.name !== source.name || existing.slug !== source.slug,
    label: "game modes",
  });
}
