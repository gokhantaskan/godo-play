import { relations } from "drizzle-orm";

import { gameModes, gameSubmissionGameModes } from "../tables/gameModes";
import { gameSubmissions } from "../tables/gameSubmissions";
import {
  pcStoreCrossplayPlatforms,
  pcStorePlatforms,
} from "../tables/pcStorePlatforms";
import {
  platformGroupPlatforms,
  platformGroups,
} from "../tables/platformGroups";
import { platforms } from "../tables/platforms";

export const gameSubmissionsRelations = relations(
  gameSubmissions,
  ({ many }) => ({
    // A submission can have many platform groups and many pc store entries
    platformGroups: many(platformGroups),
    pcStorePlatforms: many(pcStorePlatforms),
    gameSubmissionGameModes: many(gameSubmissionGameModes),
  })
);

export const gameModesRelations = relations(gameModes, ({ many }) => ({
  gameSubmissionGameModes: many(gameSubmissionGameModes),
}));

export const gameSubmissionGameModesRelations = relations(
  gameSubmissionGameModes,
  ({ one }) => ({
    submission: one(gameSubmissions, {
      fields: [gameSubmissionGameModes.submissionId],
      references: [gameSubmissions.id],
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
    submission: one(gameSubmissions, {
      fields: [platformGroups.submissionId],
      references: [gameSubmissions.id],
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

export const pcStorePlatformsRelations = relations(
  pcStorePlatforms,
  ({ one, many }) => ({
    submission: one(gameSubmissions, {
      fields: [pcStorePlatforms.submissionId],
      references: [gameSubmissions.id],
    }),
    // link to crossplay tables
    crossplayEntries: many(pcStoreCrossplayPlatforms),
  })
);

export const pcStoreCrossplayPlatformsRelations = relations(
  pcStoreCrossplayPlatforms,
  ({ one }) => ({
    pcStorePlatform: one(pcStorePlatforms, {
      fields: [pcStoreCrossplayPlatforms.pcStorePlatformId],
      references: [pcStorePlatforms.id],
    }),
    platform: one(platforms, {
      fields: [pcStoreCrossplayPlatforms.platformId],
      references: [platforms.id],
    }),
  })
);
