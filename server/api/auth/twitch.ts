import tokenStorage from "~~/server/utils/tokenStorage";

export default defineEventHandler(async event => {
  assertMethod(event, "POST");

  const {
    tw: { clientId, clientSecret, grantType, oauthEndpoint },
  } = useRuntimeConfig(event);

  try {
    const response = await tokenStorage.retrieveSession({
      clientId,
      clientSecret,
      grantType,
      oauthEndpoint,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw createError(error);
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to authenticate with Twitch",
    });
  }
});
