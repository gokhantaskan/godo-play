import { db } from "../../db";
import { tags } from "../../db/schema";

export default defineEventHandler(async event => {
  if (event.method === "GET") {
    return db.select().from(tags);
  }

  if (event.method === "POST") {
    const body = await readBody(event);
    const { name, slug, weight } = body;

    try {
      const [tag] = await db
        .insert(tags)
        .values({
          name,
          slug,
          weight,
        })
        .returning();

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

  throw createError({
    statusCode: 405,
    message: "Method not allowed",
  });
});
