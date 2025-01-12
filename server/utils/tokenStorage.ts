import type { H3Event } from "h3";
import { createError, H3Error } from "h3";
import merge from "lodash/merge.js";

import type {
  AuthSession,
  TwitchAuthResponse,
} from "~~/shared/types/igdb/globals";

import { getStorage, initStorage as initRedisStorage } from "./redisStorage";

const SESSION_KEY = "twitch_session";
let session: AuthSession | null = null;

async function initStorage(config: {
  url: string;
  token: string;
}): Promise<void> {
  try {
    await initRedisStorage(config);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to initialize token storage",
      cause: error instanceof Error ? error : undefined,
    });
  }
}

async function setSession(_session: AuthSession): Promise<void> {
  try {
    session = _session;
    await getStorage().setItem(SESSION_KEY, _session);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to set session in storage",
      cause: error instanceof Error ? error : undefined,
    });
  }
}

async function getSession(): Promise<AuthSession | null> {
  try {
    if (!session) {
      const storedSession =
        await getStorage().getItem<AuthSession>(SESSION_KEY);
      if (storedSession) {
        session = storedSession;
      }
    }
    return session;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to get session from storage",
      cause: error instanceof Error ? error : undefined,
    });
  }
}

async function clearSession(): Promise<void> {
  try {
    session = null;
    await getStorage().removeItem(SESSION_KEY);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to clear session from storage",
      cause: error instanceof Error ? error : undefined,
    });
  }
}

function isExpiringSoon(session: AuthSession): boolean {
  const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes
  const isExpiring = session.expires_at <= Date.now() + REFRESH_THRESHOLD;
  return isExpiring;
}

async function retrieveSession(config: {
  clientId: string;
  clientSecret: string;
  grantType: string;
  oauthEndpoint: string;
}): Promise<AuthSession> {
  try {
    const existingSession = await getSession();

    if (
      existingSession &&
      existingSession.expires_at > Date.now() &&
      !isExpiringSoon(existingSession)
    ) {
      console.info("[Auth] Using existing valid session");
      return existingSession;
    }

    if (existingSession) {
      console.info(
        `[Auth] Session ${
          isExpiringSoon(existingSession) ? "is expiring soon" : "has expired"
        }, refreshing...`
      );
      await clearSession();
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: config.grantType,
    });

    const url = new URL(config.oauthEndpoint);
    url.search = params.toString();

    console.info("[Auth] Requesting new token from Twitch...");
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Auth] Failed to get token");

      throw createError({
        statusCode: response.status,
        statusMessage: `Twitch authentication failed: ${response.statusText}`,
        data: {
          error: errorText,
          endpoint: config.oauthEndpoint,
          grantType: config.grantType,
        },
      });
    }

    const data: TwitchAuthResponse = await response.json();
    console.info("[Auth] Received response from Twitch");

    if (!data.access_token) {
      console.error("[Auth] Invalid response from Twitch");
      throw createError({
        statusCode: 500,
        statusMessage: "Invalid response from Twitch: missing access token",
      });
    }

    const newSession: AuthSession = {
      access_token: data.access_token,
      token_type: data.token_type || "bearer",
      expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    };

    console.info("[Auth] Successfully obtained new token");
    await setSession(newSession);
    return newSession;
  } catch (error) {
    console.error("[Auth] Error retrieving session");

    if (error instanceof Error) {
      throw createError({
        statusCode: error instanceof H3Error ? error.statusCode : 500,
        statusMessage: "Failed to retrieve Twitch session",
        cause: error,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Unknown error while retrieving Twitch session",
    });
  }
}

async function makeAuthenticatedRequest(
  event: H3Event,
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  const {
    tw: { clientId, clientSecret, grantType, oauthEndpoint },
    igdb: { endpoint },
  } = useRuntimeConfig(event);

  try {
    const session = await retrieveSession({
      clientId,
      clientSecret,
      grantType,
      oauthEndpoint,
    });

    if (!session?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: "No valid authentication session",
      });
    }

    options = merge({}, options, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-ID": clientId,
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (url.startsWith("/")) {
      url = url.slice(1);
    }

    const requestUrl = `${endpoint}/${url}`;
    console.info(`[IGDB] Making request to ${requestUrl}`);
    const response = await fetch(requestUrl, options);

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401 && retryCount === 0) {
        console.info("[IGDB] Token expired, clearing session and retrying...");
        await clearSession();
        return makeAuthenticatedRequest(event, url, options, retryCount + 1);
      }

      throw createError({
        statusCode: response.status,
        statusMessage: `IGDB request failed: ${response.statusText}`,
        data: {
          error: errorText,
          endpoint: requestUrl,
        },
      });
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw createError({
        statusCode: error instanceof H3Error ? error.statusCode : 500,
        statusMessage: "Failed to make authenticated request to IGDB",
        cause: error,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Unknown error while making request to IGDB",
    });
  }
}

export default {
  initStorage,
  setSession,
  getSession,
  clearSession,
  isExpiringSoon,
  retrieveSession,
  makeAuthenticatedRequest,
};
