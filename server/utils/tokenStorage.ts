import type { H3Event } from "h3";
import { createError } from "h3";
import Redis from "ioredis";
import merge from "lodash/merge.js";

import type {
  AuthSession,
  TwitchAuthResponse,
} from "~~/shared/types/igdb/globals";

const SESSION_KEY = `godoplay:twitch:session`;
const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes

const redis = new Redis(process.env.REDIS_URL!);

async function getSession(): Promise<AuthSession | null> {
  try {
    const storedSession = await redis.get(SESSION_KEY);
    if (!storedSession) {
      return null;
    }

    return JSON.parse(storedSession) as AuthSession;
  } catch (error) {
    console.error("Error getting session from Redis:", error);
    return null;
  }
}

async function setSession(_session: AuthSession): Promise<void> {
  try {
    await redis.set(SESSION_KEY, JSON.stringify(_session));
  } catch (error) {
    console.error("Error setting session in Redis:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to store session in Redis",
    });
  }
}

async function clearSession(): Promise<void> {
  try {
    await redis.del(SESSION_KEY);
  } catch (error) {
    console.error("Error clearing session from Redis:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to clear session from Redis",
    });
  }
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
      existingSession.expires_at > Date.now() + REFRESH_THRESHOLD
    ) {
      console.info("Returning existing session");
      return existingSession;
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: config.grantType,
    });

    const url = new URL(config.oauthEndpoint);
    url.search = params.toString();

    const response = await fetch(url.toString(), {
      method: "POST",
    });

    if (!response.ok) {
      if (response.status === 401 && existingSession) {
        // Clear invalid session and retry once
        console.info("Clearing invalid session and retrying");
        await clearSession();
        return retrieveSession(config);
      }

      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
      });
    }

    const data: TwitchAuthResponse = await response.json();
    const res: AuthSession = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_at: Date.now() + data.expires_in * 1000,
    };

    console.info("Returning new session");
    await setSession(res);
    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw createError(error);
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        "An unexpected error occurred while retrieving Twitch session",
    });
  }
}

async function makeAuthenticatedRequest(
  event: H3Event,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const {
    tw: { clientId, clientSecret, grantType, oauthEndpoint },
    igdb: { endpoint },
  } = useRuntimeConfig(event);

  const session = await retrieveSession({
    clientId,
    clientSecret,
    grantType,
    oauthEndpoint,
  });

  if (!session) {
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

  const response = await fetch(`${endpoint}/${url}`, options);

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText,
    });
  }

  return response;
}

export default {
  getSession,
  retrieveSession,
  makeAuthenticatedRequest,
};
