import { relations } from "drizzle-orm";

import { crossplayInformation } from "../tables/crossplayInformation";
import { games } from "../tables/games";

export const crossplayInformationRelations = relations(
  crossplayInformation,
  ({ one }) => ({
    game: one(games, {
      fields: [crossplayInformation.gameId],
      references: [games.id],
    }),
  })
);
