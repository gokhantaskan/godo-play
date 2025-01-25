import { sql } from "drizzle-orm";

import { db } from "~~/server/db";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

export default defineEventHandler(async () => {
  try {
    const games = await db.query.games.findMany({
      with: {
        platformGroups: {
          columns: {
            id: true,
          },
          with: {
            platformGroupPlatforms: {
              columns: {},
              with: {
                platform: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        pcStorePlatforms: {
          columns: {
            id: true,
            storeSlug: true,
          },
          with: {
            crossplayEntries: {
              columns: {},
              with: {
                platform: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
        gameSubmissionGameModes: {
          columns: {
            gameModeId: true,
          },
          with: {
            gameMode: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: [
        sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`,
      ],
    });

    return games;
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
