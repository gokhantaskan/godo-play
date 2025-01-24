import { desc } from "drizzle-orm";

import { db } from "~~/server/db";
import { games } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

export default defineEventHandler(async () => {
  try {
    const submissions = await db.query.games.findMany({
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
        gameSubmissionGameModes: {
          with: {
            gameMode: true,
          },
        },
      },
      orderBy: [desc(games.updatedAt)],
    });

    // Transform the response to match the schema
    const transformedSubmissions = submissions.map(({ ...submission }) => ({
      ...submission,
    }));

    return transformedSubmissions;
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
