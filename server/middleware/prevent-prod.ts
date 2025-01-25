export default defineEventHandler(event => {
  const requestURL = getRequestURL(event);
  const method = event.method;

  // Allow GET requests
  if (method === "GET") {
    return;
  }

  // Check if we're in production and the URL contains 'games'
  if (
    process.env.NODE_ENV === "production" &&
    requestURL.href.includes("api/games")
  ) {
    throw createError({
      statusCode: 403,
      message: "Only GET requests are allowed in production",
    });
  }

  // Keep existing admin check
  if (requestURL.href.includes("admin")) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }
});
