import tokenStorage from "../utils/tokenStorage";

export default defineNitroPlugin(async () => {
  const {
    tw: { clientId, clientSecret, grantType, oauthEndpoint },
  } = useRuntimeConfig();

  try {
    // Initialize token on server start
    await tokenStorage.retrieveSession({
      clientId,
      clientSecret,
      grantType,
      oauthEndpoint,
    });

    console.info("Authentication initialized successfully during server start");
  } catch (error) {
    console.error(
      "Failed to initialize authentication during server start:",
      error
    );
  }
});
