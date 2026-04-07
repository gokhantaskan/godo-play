import { relations } from "drizzle-orm";

import { games } from "../tables/games";
import {
  platformGroupPlatforms,
  platformGroups,
} from "../tables/platformGroups";
import { platforms } from "../tables/platforms";
import { storeCrossplayPlatforms } from "../tables/storePlatforms";
import { storeSupportedPlatforms } from "../tables/stores";

export const platformGroupsRelations = relations(
  platformGroups,
  ({ one, many }) => ({
    game: one(games, {
      fields: [platformGroups.gameId],
      references: [games.id],
    }),
    platformGroupPlatforms: many(platformGroupPlatforms),
  })
);

export const platformGroupPlatformsRelations = relations(
  platformGroupPlatforms,
  ({ one }) => ({
    platformGroup: one(platformGroups, {
      fields: [platformGroupPlatforms.platformGroupId],
      references: [platformGroups.id],
    }),
    platform: one(platforms, {
      fields: [platformGroupPlatforms.platformId],
      references: [platforms.id],
    }),
  })
);

export const platformsRelations = relations(platforms, ({ many }) => ({
  platformGroupLinks: many(platformGroupPlatforms),
  storeCrossplayLinks: many(storeCrossplayPlatforms),
  storeSupportedLinks: many(storeSupportedPlatforms),
}));
