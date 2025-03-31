import { createError } from "h3";

import { db } from "../../db";
import { tags } from "../../db/schema";

export default defineEventHandler(async event => {
  if (event.method === "GET") {
    return db.select().from(tags);
  }

  if (event.method === "POST") {
    const body = await readBody(event);
    const { name, slug } = body;

    try {
      const [tag] = await db
        .insert(tags)
        .values({
          name,
          slug,
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
      throw error;
    }
  }

  throw createError({
    statusCode: 405,
    message: "Method not allowed",
  });
});
