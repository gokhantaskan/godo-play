import { getGameBySlugPrepared } from "~~/server/db/prepared";
import type { GameWithRelations } from "~~/shared/types";

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

      return game satisfies GameWithRelations;
    } catch (error) {
      throwApiError(error);
    }
  },
  {
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 * 60 : 3,
    swr: false,
  }
);
