import { sql } from "drizzle-orm";

import type { SitemapUrl } from "#sitemap/types";
import { db } from "~~/server/db";
import { games as gamesTable } from "~~/server/db/schema";

export default defineSitemapEventHandler(async () => {
  const [games] = await Promise.all([
    db
      .select({
        slug: gamesTable.slug,
      })
      .from(gamesTable)
      .where(sql`status = 'approved'`)
      .then(games =>
        games.map(
          game =>
            ({
              loc: `/games/${game.slug}`,
              _sitemap: "games",
            }) satisfies SitemapUrl
        )
      ),
  ]);

  return [...games];
});
