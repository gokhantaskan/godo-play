import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { tags } from "~~/server/db/schema";

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

    const [updatedTag] = await db
      .update(tags)
      .set(body)
      .where(eq(tags.id, id))
      .returning();

    if (!updatedTag) {
      throw createError({
        statusCode: 404,
        message: "Tag not found",
      });
    }

    return updatedTag;
  } catch (error) {
    throwApiError(error);
  }
});
