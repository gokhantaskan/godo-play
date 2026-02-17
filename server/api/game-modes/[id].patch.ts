import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { gameModes } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  try {
    const id = parseInt(getRouterParam(event, "id") as string);

    const schema = z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      weight: z.number().min(0.1).max(10).optional(),
    });

    const body = await readValidatedBody(event, schema.parse);

    if (Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        message: "No valid fields to update",
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
  } catch (error) {
    throwApiError(error);
  }
});
