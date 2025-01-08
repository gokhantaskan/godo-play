export default defineEventHandler(async event => {
  const {
    igdb: { endpoint: baseURL },
    tw: { clientId },
  } = useRuntimeConfig(event);

  const body = await readBody(event);
  const endpoint = `${baseURL}/games`;
  const tenYearsAgoUnix =
    new Date(new Date().getFullYear() - 10, 0, 1).getTime() / 1000;

  // Set default values
  const defaultBody = {
    limit: 100,
    sort: "aggregated_rating desc",
    ...body,
  };

  // Combine fixed conditions with dynamic where clause
  const fixedConditions = [
    "category=(0,3,8,9)",
    "version_parent=null",
    `release_dates.date >= ${tenYearsAgoUnix}`,
  ];

  if (defaultBody.where) {
    defaultBody.where = `${fixedConditions.join(" & ")} & ${defaultBody.where}`;
  } else {
    defaultBody.where = fixedConditions.join(" & ");
  }

  console.log(defaultBody);

  // Set fixed fields for dashboard games
  defaultBody.fields =
    "name,slug,category,platforms.*,genres.*,player_perspectives.*,themes.*,cover.*,game_modes.*,multiplayer_modes.*,first_release_date,release_dates.*";

  // Convert the body to IGDB API format
  const hasSearch = Boolean(defaultBody.search);
  const parsedBody = Object.entries(defaultBody)
    .filter(([key, value]) => {
      if (hasSearch && key === "sort") {
        return false;
      }
      return Boolean(value);
    })
    .map(([key, value]) => {
      if (key === "search") {
        return `search "${value}"`;
      }
      return `${key} ${value}`;
    })
    .join("; ")
    .concat(";")
    .trim();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
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
