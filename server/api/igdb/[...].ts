import {
  clampInteger,
  escapeApicalypseString,
  parseIgdbSort,
} from "~~/server/utils/igdbQuery";

export default defineEventHandler(async event => {
  try {
    const path = event.path.replace("/api/igdb/", "");
    const body = await readBody(event);

    // Format the query string for IGDB
    const queryParts = [];

    // Search should be before fields for IGDB to properly include them
    if (body.search) {
      queryParts.push(
        `search "${escapeApicalypseString(String(body.search))}";`
      );
    }

    if (body.fields) {
      // Only allow well-formed field tokens (name, cover.*, platforms.name)
      const fields = new Set(
        String(body.fields)
          .split(",")
          .map(field => field.trim())
          .filter(field => /^[\w.*]+$/.test(field))
      );

      if (fields.size) {
        queryParts.push(`fields ${Array.from(fields).join(",")};`);
      }
    }

    if (body.where) {
      // Strip the statement terminator so a where clause can't inject extra
      // Apicalypse statements
      const where = String(body.where).replace(/;/g, "").trim();

      if (where) {
        queryParts.push(`where ${where};`);
      }
    }

    if (body.limit) {
      queryParts.push(`limit ${clampInteger(body.limit, 100, 1, 250)};`);
    }

    if (body.offset) {
      queryParts.push(`offset ${clampInteger(body.offset, 0, 0, 5000)};`);
    }

    if (body.sort) {
      queryParts.push(`sort ${parseIgdbSort(body.sort)};`);
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
  } catch (error) {
    throwApiError(error);
  }
});
