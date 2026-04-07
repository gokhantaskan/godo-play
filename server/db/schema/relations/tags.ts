import { relations } from "drizzle-orm";

import { games } from "../tables/games";
import { gamesTags, tags } from "../tables/tags";

export const tagsRelations = relations(tags, ({ many }) => ({
  games: many(gamesTags),
}));

export const gamesTagsRelations = relations(gamesTags, ({ one }) => ({
  tag: one(tags, {
    fields: [gamesTags.tagId],
    references: [tags.id],
  }),
  game: one(games, {
    fields: [gamesTags.gameId],
    references: [games.id],
  }),
}));
