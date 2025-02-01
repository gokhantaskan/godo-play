import { db } from "~~/server/db";

export default defineEventHandler(async () => {
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
});
