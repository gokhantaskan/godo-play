import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameModes } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: "Invalid game mode ID",
    });
  }

  const [updatedGameMode] = await db
    .update(gameModes)
    .set(body)
    .where(eq(gameModes.id, id))
    .returning();

  if (!updatedGameMode) {
    throw createError({
      statusCode: 404,
      message: "Game mode not found",
    });
  }

  return updatedGameMode;
});
