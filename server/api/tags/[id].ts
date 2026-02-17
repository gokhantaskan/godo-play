import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { tags } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  const id = Number(event.context.params?.id);

  if (event.method === "PATCH") {
    const body = await readBody(event);
    const { name, slug } = body;

    try {
      const [tag] = await db
        .update(tags)
        .set({
          name,
          slug,
        })
        .where(eq(tags.id, id))
        .returning();

      if (!tag) {
        throw createError({
          statusCode: 404,
          message: "Tag not found",
        });
      }

      return tag;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("unique constraint")
      ) {
        throw createError({
          statusCode: 400,
          message: "A tag with this slug already exists",
        });
      }
      throwApiError(error);
    }
  }

  if (event.method === "DELETE") {
    const [tag] = await db.delete(tags).where(eq(tags.id, id)).returning();

    if (!tag) {
      throw createError({
        statusCode: 404,
        message: "Tag not found",
      });
    }

    return tag;
  }

  throw createError({
    statusCode: 405,
    message: "Method not allowed",
  });
});
