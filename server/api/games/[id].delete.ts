import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { crossplayInformation, games } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  const gameId = parseInt(event.context.params?.id as string);

  if (isNaN(gameId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid game ID",
    });
  }

  try {
    const result = await db.transaction(async tx => {
      // Check if game exists and is approved
      const game = await tx.query.games.findFirst({
        where: eq(games.id, gameId),
      });

      if (!game) {
        throw createError({
          statusCode: 404,
          message: "Game not found",
        });
      }

      if (game.status !== "approved") {
        throw createError({
          statusCode: 400,
          message: "Only approved games can be deleted",
        });
      }

      // First delete the crossplay information to resolve the foreign key constraint
      await tx
        .delete(crossplayInformation)
        .where(eq(crossplayInformation.gameId, gameId));

      // Then delete the game
      await tx.delete(games).where(eq(games.id, gameId));

      return game;
    });

    return result;
  } catch (error) {
    throwApiError(error);
  }
});
