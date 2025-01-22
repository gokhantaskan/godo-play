import { getIGDBClient } from "~~/server/utils/igdb";

interface H3ErrorLike {
  statusCode: number;
  message: string;
}

export default defineEventHandler(async event => {
  try {
    const igdb = await getIGDBClient();
    const path = event.path.replace("/api/igdb/", "");
    const body = await readBody(event);

    const response = await igdb(path, body);
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
