import { getGameBySlugPrepared } from "~~/server/db/prepared";
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

      const game = await getGameBySlugPrepared.execute({ slug });

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
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
