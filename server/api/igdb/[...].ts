import { $fetch } from "ofetch";

export default defineEventHandler(async event => {
  assertMethod(event, "POST");

  const {
    igdb: { endpoint: baseURL },
    tw: { clientId },
  } = useRuntimeConfig(event);

  const url = event.context.params?._;
  const body = await readBody(event);

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

  console.log(parsedBody);

  try {
    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing or invalid URL",
      });
    }

    const response = await $fetch(url, {
      method: "POST",
      baseURL,
      headers: {
        "Content-Type": "application/json",
        "Client-ID": clientId,
        Authorization: `Bearer ${(await tokenStorage.getSession())?.access_token}`,
      },
      body: parsedBody,
    });

    return response;
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
