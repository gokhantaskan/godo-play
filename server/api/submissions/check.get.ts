import { desc } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameSubmissions } from "~~/server/db/schema";

export default defineEventHandler(async () => {
  const submissions = await db.query.gameSubmissions.findMany({
    with: {
      platformGroups: true,
      pcStorePlatforms: true,
    },
    orderBy: [desc(gameSubmissions.createdAt)],
  });

  return {
    submissions,
  };
});
