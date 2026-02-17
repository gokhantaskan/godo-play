import tokenStorage from "~~/server/utils/tokenStorage";

export default defineEventHandler(async event => {
  assertMethod(event, "POST");

  const {
    tw: { clientId, clientSecret, grantType, oauthEndpoint },
  } = useRuntimeConfig(event);

  try {
    await tokenStorage.retrieveSession({
      clientId,
      clientSecret,
      grantType,
      oauthEndpoint,
    });

    return;
  } catch (error) {
    throwApiError(error);
  }
});
