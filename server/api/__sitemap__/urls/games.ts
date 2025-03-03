import type { SitemapUrl } from "#sitemap/types";

export default defineSitemapEventHandler(async event => {
  if (event.method !== "GET") {
    throw createError({
      statusCode: 405,
      message: "Method not allowed",
    });
  }

  try {
    // Use the public API endpoint instead of direct database query
    const { data: games } = await event.$fetch("/api/public/games", {
      params: {
        limit: 1000, // Adjust limit as needed for your sitemap
        status: "approved",
      },
    });

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
    return [];
  }
});
