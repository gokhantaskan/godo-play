import { db } from "~~/server/db";

export default defineCachedEventHandler(
  async () => {
    const gameModes = await db.query.gameModes.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return gameModes;
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
