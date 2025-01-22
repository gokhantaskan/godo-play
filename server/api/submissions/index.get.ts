import { desc } from "drizzle-orm";

import { db } from "~~/server/db";
import { gameSubmissions } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

export default defineEventHandler(async () => {
  try {
    const submissions = await db.query.gameSubmissions.findMany({
      with: {
        platformGroups: {
          with: {
            platformGroupPlatforms: {
              with: {
                platform: true,
              },
            },
          },
        },
        pcStorePlatforms: {
          with: {
            crossplayEntries: {
              with: {
                platform: true,
              },
            },
          },
        },
      },
      orderBy: [desc(gameSubmissions.updatedAt)],
    });

    return submissions;
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to retrieve game submissions",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
