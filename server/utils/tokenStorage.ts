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
  session = _session;
  await storage.setItem("twitch_session", _session);
}

async function getSession(): Promise<AuthSession | null> {
  if (!session) {
    session = await storage.getItem("twitch_session");
  }

  return session;
}

async function clearSession(): Promise<void> {
  session = null;
  await storage.removeItem("twitch_session");
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
  setSession,
  getSession,
  clearSession,
  isExpiringSoon,
  retrieveSession,
  makeAuthenticatedRequest,
};
