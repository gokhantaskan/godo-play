import { db } from "~~/server/db";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

export default defineEventHandler(async () => {
  try {
    const dbStores = await db.query.stores.findMany({
      with: {
        supportedPlatforms: {
          with: {
            platform: true,
          },
        },
      },
    });

    return dbStores;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log(error);
    }

    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to get stores",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
