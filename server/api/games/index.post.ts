import { GAME_MODE_IDS } from "~~/shared/constants/gameModes";
import { SUPPORTED_PLATFORM_IDS } from "~~/shared/constants/platforms";
import type { DashboardGamesRequestBody } from "~~/shared/types/queries";

export default defineEventHandler(async event => {
  const {
    igdb: { endpoint: baseURL },
    tw: { clientId },
  } = useRuntimeConfig(event);

  const {
    gameModes,
    genres,
    limit = 100,
    platforms,
    playerPerspectives,
    search,
    sort = "aggregated_rating desc",
    themes,
  } = await readBody<DashboardGamesRequestBody>(event);

  const endpoint = `${baseURL}/games`;
  const tenYearsAgoUnix =
    new Date(new Date().getFullYear() - 10, 0, 1).getTime() / 1000;

  // Combine fixed conditions with dynamic where clause
  const fixedConditions = [
    "category=(0,3,8,9)",
    "version_parent=null",
    "aggregated_rating_count > 5",
    `release_dates.date >= ${tenYearsAgoUnix}`,
  ];

  const whereConditions = [];

  if (platforms?.length) {
    whereConditions.push(`platforms=[${platforms.join(",")}]`);
  } else {
    whereConditions.push(`platforms=(${SUPPORTED_PLATFORM_IDS.join(",")})`);
  }

  if (gameModes?.length) {
    whereConditions.push(`game_modes=[${gameModes.join(",")}]`);
  } else {
    whereConditions.push(`game_modes=(${GAME_MODE_IDS.join(",")})`);
  }

  if (playerPerspectives?.length) {
    whereConditions.push(
      `player_perspectives=(${playerPerspectives.join(",")})`
    );
  }

  if (genres?.length) {
    whereConditions.push(`genres=(${genres.join(",")})`);
  }

  if (themes?.length) {
    whereConditions.push(`themes=(${themes.join(",")})`);
  }

  if (search) {
    whereConditions.push(`name ~ *"${search}"*`);
  }

  const where = [...fixedConditions, ...whereConditions].join(" & ");

  const fields = [
    "name",
    "slug",
    "category",
    "platforms.*",
    "genres.*",
    "player_perspectives.*",
    "themes.*",
    "cover.*",
    "game_modes.*",
    "multiplayer_modes.*",
    "release_dates.date",
    "aggregated_rating",
  ].join(",");

  // Simplified body construction
  const queryParts = [];

  queryParts.push(`fields ${fields}`);
  queryParts.push(`where ${where}`);
  queryParts.push(`limit ${limit}`);
  queryParts.push(`sort ${sort}`);

  // Construct the final query string
  const parsedBody = queryParts.join("; ").concat(";");

  if (process.env.NODE_ENV === "development") {
    console.log("IGDB Query:", parsedBody);
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": clientId,
        Authorization: `Bearer ${tokenStorage.getSession()?.access_token}`,
      },
      body: parsedBody,
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
      });
    }

    return await response.json();
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
