import { db } from "~~/server/db";

export default defineCachedEventHandler(
  async () => {
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
      throwApiError(error);
    }
  },
  {
    swr: true,
    maxAge: process.env.NODE_ENV === "development" ? 5 : 60 * 5,
  }
);
