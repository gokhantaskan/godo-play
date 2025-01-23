import {
  handleAuthError,
  handleExternalApiError,
} from "~~/server/utils/errorHandler";
import { GAME_MODE_IDS } from "~~/shared/constants/gameModes";
import { SUPPORTED_PLATFORM_IDS } from "~~/shared/constants/platforms";
import type { DashboardGamesRequestBody } from "~~/shared/types/queries";

export default defineCachedEventHandler(
  async event => {
    const query = getQuery(event);
    const parseArrayParam = (param?: string) =>
      param ? decodeURIComponent(param).split(",").map(Number) : undefined;

    const {
      gameModes,
      genres,
      limit = 60,
      offset = 0,
      platforms,
      playerPerspectives,
      search,
      sort = "aggregated_rating desc",
      themes,
    }: DashboardGamesRequestBody = {
      ...query,
      platforms: parseArrayParam(query.platforms as string),
      gameModes: parseArrayParam(query.gameModes as string),
      playerPerspectives: parseArrayParam(query.playerPerspectives as string),
      genres: parseArrayParam(query.genres as string),
      themes: parseArrayParam(query.themes as string),
      search: query.search
        ? decodeURIComponent(query.search as string)
        : undefined,
    };

    const tenYearsAgoUnix =
      new Date(new Date().getFullYear() - 10, 0, 1).getTime() / 1000;

    // Combine fixed conditions with dynamic where clause
    const fixedConditions = [
      "category=(0,3,8,9)", // 0: main game, 3: bundle, 8: remake, 9: remaster
      "version_parent=null",
      "aggregated_rating > 50",
      "aggregated_rating_count > 2",
      "age_ratings.category=(2)", // PEGI
      `release_dates.date >= ${tenYearsAgoUnix}`,
    ];

    const whereConditions = [];

    if (platforms?.length) {
      whereConditions.push(`platforms=[${platforms.join(",")}]`);
    } else {
      whereConditions.push(`platforms=(${SUPPORTED_PLATFORM_IDS.join(",")})`);
    }

    if (gameModes?.length) {
      const hasSinglePlayerOnly = gameModes.length === 1 && gameModes[0] === 1;
      const hasMultiplayerModes = gameModes.some(mode => mode !== 1);

      if (hasSinglePlayerOnly) {
        // If only single-player is selected, include multiplayer and cooperative modes
        whereConditions.push(`game_modes != 1`);
      } else if (hasMultiplayerModes) {
        // If other modes are selected, use the provided selection
        whereConditions.push(`game_modes=[${gameModes.join(",")}]`);
      }
    } else {
      // Default behavior: exclude single-player only games
      whereConditions.push(
        `game_modes=(${GAME_MODE_IDS.filter(id => id !== 1).join(",")})`
      );
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
    ].join(",");

    // Simplified body construction
    const queryParts = [];

    queryParts.push(`fields ${fields}`);
    queryParts.push(`where ${where}`);
    queryParts.push(`limit ${limit}`);
    queryParts.push(`offset ${offset}`);
    queryParts.push(`sort ${sort}`);

    // Construct the final query string
    const parsedBody = queryParts.join("; ").concat(";");

    if (process.env.NODE_ENV === "development") {
      console.log("IGDB Query:", parsedBody);
    }

    try {
      const session = await tokenStorage.getSession();

      if (!session) {
        throw handleAuthError(new Error("No valid authentication session"));
      }

      const response = await tokenStorage.makeAuthenticatedRequest(
        event,
        "/games",
        {
          body: parsedBody,
        }
      );

      if (!response.ok) {
        throw handleExternalApiError(
          new Error(`HTTP ${response.status}: ${response.statusText}`),
          "IGDB"
        );
      }

      return await response.json();
    } catch (error) {
      if (error && typeof error === "object" && "statusCode" in error) {
        throw error;
      }

      throw handleExternalApiError(error, "IGDB");
    }
  },
  {
    // 5 minutes in production, 5 seconds in dev
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
