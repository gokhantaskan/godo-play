import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { games } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";

export default defineCachedEventHandler(
  async event => {
    try {
      const slug = getRouterParam(event, "slug");

      if (!slug) {
        throw createError({
          statusCode: 400,
          message: "Slug parameter is required",
        });
      }

      const game = await db.query.games.findFirst({
        where: eq(games.slug, slug),
        with: {
          crossplayInformation: true,
          platformGroups: {
            columns: {
              id: true,
            },
            with: {
              platformGroupPlatforms: {
                columns: {
                  platformId: true,
                  platformGroupId: true,
                },
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
          storePlatforms: {
            columns: {
              id: true,
              storeSlug: true,
              storeUrl: true,
            },
            with: {
              crossplayEntries: {
                columns: {
                  platformId: true,
                },
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
      });

      if (!game) {
        throw createError({
          statusCode: 404,
          message: "Game not found",
        });
      }

      return game satisfies GameSubmissionWithRelations;
    } catch (error: unknown) {
      if (isH3ErrorLike(error)) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        message: "Failed to retrieve game",
        data: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
