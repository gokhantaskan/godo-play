import { $fetch } from "ofetch";

export default defineEventHandler(async event => {
  assertMethod(event, "POST");

  const config = useRuntimeConfig(event);
  const url = event.context.params?._;
  const body = await readBody(event);

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing URL parameter",
    });
  }

  // Convert the body to IGDB API format
  const hasSearch = Boolean(body.search);
  const parsedBody = Object.entries(body)
    .filter(([key, value]) => {
      // If there is a search, don't include the sort field
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

  if (process.env.NODE_ENV === "development") {
    console.log("IGDB Query:", parsedBody);
  }

  try {
    // Ensure we have a valid token before making the request
    await tokenStorage.retrieveSession({
      clientId: config.tw.clientId,
      clientSecret: config.tw.clientSecret,
      grantType: config.tw.grantType,
      oauthEndpoint: config.tw.oauthEndpoint,
    });

    // Rest of your existing code...
    const session = await tokenStorage.getSession();

    if (!session?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: "No valid authentication token",
      });
    }

    const response = await $fetch(url, {
      method: "POST",
      baseURL: config.igdb.endpoint,
      headers: {
        "Content-Type": "application/json",
        "Client-ID": config.tw.clientId,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: parsedBody,
    });

    return response;
  } catch (error) {
    console.error("IGDB API Error:", error);
    throw error;
  }
});
