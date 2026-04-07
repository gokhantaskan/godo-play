import { relations } from "drizzle-orm";

import { crossplayInformation } from "../tables/crossplayInformation";
import { gameCategories } from "../tables/gameCategories";
import { gameGameModes, gameModes } from "../tables/gameModes";
import { games } from "../tables/games";
import { platformGroups } from "../tables/platformGroups";
import { storePlatforms } from "../tables/storePlatforms";
import { gamesTags } from "../tables/tags";

export const gamesRelations = relations(games, ({ many, one }) => ({
  platformGroups: many(platformGroups),
  storePlatforms: many(storePlatforms),
  gameGameModes: many(gameGameModes),
  crossplayInformation: one(crossplayInformation, {
    fields: [games.id],
    references: [crossplayInformation.gameId],
  }),
  category: one(gameCategories, {
    fields: [games.category],
    references: [gameCategories.pointer],
  }),
  tags: many(gamesTags),
}));

export const gameModesRelations = relations(gameModes, ({ many }) => ({
  gameGameModes: many(gameGameModes),
}));

export const gameGameModesRelations = relations(gameGameModes, ({ one }) => ({
  game: one(games, {
    fields: [gameGameModes.gameId],
    references: [games.id],
  }),
  gameMode: one(gameModes, {
    fields: [gameGameModes.gameModeId],
    references: [gameModes.id],
  }),
}));

export const gameCategoriesRelations = relations(
  gameCategories,
  ({ many }) => ({
    games: many(games),
  })
);
