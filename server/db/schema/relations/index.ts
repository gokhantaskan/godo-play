import { relations } from "drizzle-orm";

import { crossplayInformation } from "../tables/crossplayInformation";
import { gameModes, gameSubmissionGameModes } from "../tables/gameModes";
import { games } from "../tables/games";
import {
  platformGroupPlatforms,
  platformGroups,
} from "../tables/platformGroups";
import { platforms } from "../tables/platforms";
import {
  storeCrossplayPlatforms,
  storePlatforms,
} from "../tables/storePlatforms";
import { stores, storeSupportedPlatforms } from "../tables/stores";

export const gameSubmissionsRelations = relations(games, ({ many }) => ({
  // A submission can have many platform groups and many pc store entries
  platformGroups: many(platformGroups),
  storePlatforms: many(storePlatforms),
  gameSubmissionGameModes: many(gameSubmissionGameModes),
}));

export const gameModesRelations = relations(gameModes, ({ many }) => ({
  gameSubmissionGameModes: many(gameSubmissionGameModes),
}));

export const crossplayInformationRelations = relations(
  crossplayInformation,
  ({ one }) => ({
    game: one(games, {
      fields: [crossplayInformation.gameId],
      references: [games.id],
    }),
  })
);

export const gameSubmissionGameModesRelations = relations(
  gameSubmissionGameModes,
  ({ one }) => ({
    submission: one(games, {
      fields: [gameSubmissionGameModes.submissionId],
      references: [games.id],
    }),
    gameMode: one(gameModes, {
      fields: [gameSubmissionGameModes.gameModeId],
      references: [gameModes.id],
    }),
  })
);

export const platformGroupsRelations = relations(
  platformGroups,
  ({ one, many }) => ({
    submission: one(games, {
      fields: [platformGroups.submissionId],
      references: [games.id],
    }),
    // a platform group can be linked to many platforms via platformGroupPlatforms
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

export const storePlatformsRelations = relations(
  storePlatforms,
  ({ one, many }) => ({
    submission: one(games, {
      fields: [storePlatforms.submissionId],
      references: [games.id],
    }),
    // link to crossplay tables
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
