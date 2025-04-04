import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { tags } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  try {
    // Get the tag ID from the route parameter
    const id = parseInt(getRouterParam(event, "id") as string);

    // Parse and validate the request body
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

    // Update the tag with the provided fields
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
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid request data",
        data: error.format(),
      });
    }

    throw error;
  }
});
