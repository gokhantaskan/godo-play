// Protected URLs that require special handling
const PROTECTED_URLS: string[] = [];

export default defineEventHandler(event => {
  const requestURL = getRequestURL(event);
  const method = event.method;

  // Allow GET requests
  if (method === "GET") {
    return;
  }

  // Check protected URLs first
  if (PROTECTED_URLS.some(url => requestURL.href.includes(url))) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  // Block all non-GET requests in production
  if (process.env.NODE_ENV === "production") {
    throw createError({
      statusCode: 403,
      message: "Only GET requests are allowed in production",
    });
  }
});
