export default defineEventHandler(async event => {
  try {
    const {
      igdb: { endpoint: baseURL },
      tw: { clientId },
    } = useRuntimeConfig(event);

    const slug = getRouterParam(event, "slug");

    const fields = [
      "name",
      "age_ratings.*",
      "category",
      "cover.*",
      "multiplayer_modes.*",
      "screenshots.*",
      "storyline",
      "summary",
      "websites.*",
      // With names
      "game_modes.name",
      "genres.name",
      "platforms.name",
      "player_perspectives.name",
      "themes.name",
    ].join(",");

    console.log("IGDB Query:", `fields ${fields}; where slug="${slug}";`);

    const response = await fetch(`${baseURL}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": clientId,
        Authorization: `Bearer ${tokenStorage.getSession()?.access_token}`,
      },
      body: `fields ${fields}; where slug="${slug}";`,
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
      });
    }

    const [gameDetails] = await response.json();
    return gameDetails;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error);
      throw createError(error);
    }

    console.error("Unknown Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
