interface H3ErrorLike {
  statusCode: number;
  message: string;
}

export default defineEventHandler(async event => {
  try {
    const path = event.path.replace("/api/igdb/", "");
    const body = await readBody(event);

    // Format the query string for IGDB
    const queryParts = [];

    // Search should be before fields for IGDB to properly include them
    if (body.search) {
      queryParts.push(`search "${body.search}";`);
    }

    if (body.fields) {
      // Ensure basic fields are always included
      const fields = new Set(body.fields.split(","));
      queryParts.push(`fields ${Array.from(fields).join(",")};`);
    }

    if (body.where) {
      queryParts.push(`where ${body.where};`);
    }

    if (body.limit) {
      queryParts.push(`limit ${body.limit};`);
    }

    if (body.offset) {
      queryParts.push(`offset ${body.offset};`);
    }

    if (body.sort) {
      queryParts.push(`sort ${body.sort};`);
    }

    const queryString = queryParts.join(" ");

    // Log the query string in development
    if (process.env.NODE_ENV === "development") {
      console.log("IGDB Query:", queryString);
    }

    const response = await fetch(
      `${useRuntimeConfig().igdb.endpoint}/${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "Client-ID": useRuntimeConfig().tw.clientId,
          Authorization: `Bearer ${(await tokenStorage.getSession())?.access_token}`,
        },
        body: queryString,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: "IGDB API request failed",
        data: process.env.NODE_ENV === "development" ? data : undefined,
      });
    }

    return data;
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to fetch data from IGDB",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

function isH3ErrorLike(error: unknown): error is H3ErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "message" in error
  );
}
