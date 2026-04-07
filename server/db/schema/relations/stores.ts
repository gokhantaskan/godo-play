import { relations } from "drizzle-orm";

import { games } from "../tables/games";
import { platforms } from "../tables/platforms";
import {
  storeCrossplayPlatforms,
  storePlatforms,
} from "../tables/storePlatforms";
import { stores, storeSupportedPlatforms } from "../tables/stores";

export const storePlatformsRelations = relations(
  storePlatforms,
  ({ one, many }) => ({
    game: one(games, {
      fields: [storePlatforms.gameId],
      references: [games.id],
    }),
    store: one(stores, {
      fields: [storePlatforms.storeId],
      references: [stores.id],
    }),
    crossplayEntries: many(storeCrossplayPlatforms),
  })
);

export const storeCrossplayPlatformsRelations = relations(
  storeCrossplayPlatforms,
  ({ one }) => ({
    storePlatform: one(storePlatforms, {
      fields: [storeCrossplayPlatforms.storePlatformId],
      references: [storePlatforms.id],
    }),
    platform: one(platforms, {
      fields: [storeCrossplayPlatforms.platformId],
      references: [platforms.id],
    }),
  })
);

export const storesRelations = relations(stores, ({ many }) => ({
  supportedPlatforms: many(storeSupportedPlatforms),
  storePlatforms: many(storePlatforms),
}));

export const storeSupportedPlatformsRelations = relations(
  storeSupportedPlatforms,
  ({ one }) => ({
    store: one(stores, {
      fields: [storeSupportedPlatforms.storeId],
      references: [stores.id],
    }),
    platform: one(platforms, {
      fields: [storeSupportedPlatforms.platformId],
      references: [platforms.id],
    }),
  })
);
