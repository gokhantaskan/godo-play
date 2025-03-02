import { sql } from "drizzle-orm";

import type { SitemapUrl } from "#sitemap/types";
import { db } from "~~/server/db";
import { games as gamesTable } from "~~/server/db/schema";

export default defineSitemapEventHandler(async event => {
  if (event.method !== "GET") {
    throw createError({
      statusCode: 405,
      message: "Method not allowed",
    });
  }

  try {
    const games = await db
      .select({
        slug: gamesTable.slug,
        updatedAt: gamesTable.updatedAt,
      })
      .from(gamesTable)
      .where(sql`status = 'approved'`);

    return games.map(
      game =>
        ({
          loc: `/games/${game.slug}`,
          lastmod: game.updatedAt,
          _sitemap: "games",
        }) satisfies SitemapUrl
    );
  } catch (error) {
    console.error("[Sitemap Games]", error);
    throw createError({
      statusCode: 500,
      message: "Failed to generate games sitemap",
    });
  }
});
