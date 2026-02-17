import { z } from "zod";

import { db } from "~~/server/db";
import { BaseInsertGameModeSchema, gameModes } from "~~/server/db/schema";

const schema = BaseInsertGameModeSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export default defineEventHandler(async event => {
  const body = await readBody(event);

  try {
    const validatedData = schema.parse(body);

    const [gameMode] = await db
      .insert(gameModes)
      .values(validatedData)
      .returning();

    return gameMode;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid input",
        data: error.issues,
      });
    }

    throw error;
  }
});
