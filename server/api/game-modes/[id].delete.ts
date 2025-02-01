import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameModes, gameSubmissionGameModes } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

export default defineEventHandler(async event => {
  const gameModeId = parseInt(event.context.params?.id as string);

  if (isNaN(gameModeId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid game mode ID",
    });
  }

  try {
    const result = await db.transaction(async tx => {
      // First check if game mode exists
      const gameMode = await tx.query.gameModes.findFirst({
        where: eq(gameModes.id, gameModeId),
      });

      if (!gameMode) {
        throw createError({
          statusCode: 404,
          message: "Game mode not found",
        });
      }

      // Delete all relations in the junction table first
      await tx
        .delete(gameSubmissionGameModes)
        .where(eq(gameSubmissionGameModes.gameModeId, gameModeId));

      // Then delete the game mode itself
      await tx.delete(gameModes).where(eq(gameModes.id, gameModeId));

      return gameMode;
    });

    return result;
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to delete game mode",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
