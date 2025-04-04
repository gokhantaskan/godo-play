import { db } from "~~/server/db";
import { tags } from "~~/server/db/schema";

export default defineCachedEventHandler(
  async () => {
    const allTags = await db.query.tags.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return allTags;
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
