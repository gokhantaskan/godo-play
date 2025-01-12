import type { H3Event } from "h3";
import { createError } from "h3";
import merge from "lodash/merge.js";

// @ts-ignore - `vue-tsc` doesn't support it yet
import { useStorage } from "#imports";
import type {
  AuthSession,
  TwitchAuthResponse,
} from "~~/shared/types/igdb/globals";

// Use Redis only in production
const storage = useStorage("redis");

let session: AuthSession | null = null;

async function setSession(_session: AuthSession): Promise<void> {
  try {
    session = _session;
    await storage.setItem("twitch_session", _session);
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to store authentication session",
    });
  }
}

async function getSession(): Promise<AuthSession | null> {
  try {
    if (!session) {
      session = await storage.getItem("twitch_session");
    }

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expires_at <= Date.now()) {
      await clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

async function clearSession(): Promise<void> {
  try {
    session = null;
    await storage.removeItem("twitch_session");
  } catch {
    // Ignore error since we're clearing anyway
  }
}

function isExpiringSoon(session: AuthSession): boolean {
  const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes
  return session.expires_at <= Date.now() + REFRESH_THRESHOLD;
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
      return existingSession;
    }

    // Force clear session if it's invalid or expired
    if (existingSession) {
      await clearSession();
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

    await setSession(res);
    return res;
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: "Failed to retrieve authentication token",
    });
  }
}

async function makeAuthenticatedRequest(
  event: H3Event,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
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

    if (!session?.access_token) {
      throw createError({
        statusCode: 401,
        statusMessage: "No valid authentication token",
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
      if (response.status === 401) {
        // Clear invalid session and retry once
        await clearSession();
        // Retry with a fresh token
        return makeAuthenticatedRequest(event, url, options);
      }

      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Authentication request failed",
      });
    }
    throw error;
  }
}

export default {
  setSession,
  getSession,
  clearSession,
  isExpiringSoon,
  retrieveSession,
  makeAuthenticatedRequest,
};
