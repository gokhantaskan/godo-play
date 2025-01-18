import tokenStorage from "../utils/tokenStorage";

export default defineNitroPlugin(async () => {
  const {
    tw: { clientId, clientSecret, grantType, oauthEndpoint },
  } = useRuntimeConfig();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  async function initializeAuth(retryCount = 0): Promise<void> {
    try {
      await tokenStorage.retrieveSession({
        clientId,
        clientSecret,
        grantType,
        oauthEndpoint,
      });

      console.info(
        "Authentication initialized successfully during server start"
      );
    } catch (error) {
      console.error(
        "Failed to initialize authentication during server start:",
        error
      );

      if (retryCount < MAX_RETRIES) {
        console.info(
          `Retrying authentication initialization in ${RETRY_DELAY}ms...`
        );
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return initializeAuth(retryCount + 1);
      }

      console.error(
        `Failed to initialize authentication after ${MAX_RETRIES} retries`
      );
    }
  }

  await initializeAuth();
});
