import tokenStorage from "./tokenStorage";

export async function getIGDBClient() {
  const config = useRuntimeConfig();
  await tokenStorage.retrieveSession({
    clientId: config.tw.clientId,
    clientSecret: config.tw.clientSecret,
    grantType: config.tw.grantType,
    oauthEndpoint: config.tw.oauthEndpoint,
  });

  const session = await tokenStorage.getSession();
  if (!session?.access_token) {
    throw createError({
      statusCode: 401,
      message: "No valid authentication token",
    });
  }

  return (path: string, body: unknown) =>
    fetch(`${config.igdb.endpoint}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": config.tw.clientId,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
}
