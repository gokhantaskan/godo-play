import { createError } from "h3";

import tokenStorage from "../utils/tokenStorage";

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  const { tw, upstash } = config;

  // Validate required configuration
  if (!upstash?.redis?.rest?.url || !upstash?.redis?.rest?.token) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Redis configuration",
    });
  }

  if (
    !tw?.clientId ||
    !tw?.clientSecret ||
    !tw?.grantType ||
    !tw?.oauthEndpoint
  ) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Twitch configuration",
    });
  }

  const { url, token } = upstash.redis.rest;
  const { clientId, clientSecret, grantType, oauthEndpoint } = tw;

  try {
    // Initialize Redis storage
    await tokenStorage.initStorage({ url, token });
    console.info("Redis storage initialized successfully");

    // Initialize token on server start
    await tokenStorage.retrieveSession({
      clientId,
      clientSecret,
      grantType,
      oauthEndpoint,
    });

    console.info("Authentication initialized successfully during server start");
  } catch (error) {
    console.error("Failed to initialize authentication:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize authentication",
      cause: error instanceof Error ? error : undefined,
    });
  }
});
