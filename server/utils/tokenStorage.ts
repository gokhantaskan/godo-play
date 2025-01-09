import type { H3Event } from "h3";
import { createError } from "h3";
import merge from "lodash/merge";

import { useStorage } from "#imports";
import type {
  AuthSession,
  TwitchAuthResponse,
} from "~~/shared/types/igdb/globals";

const storage = useStorage("twitch");
let session: AuthSession | null = null;

export default {
  async setSession(_session: AuthSession): Promise<void> {
    session = _session;
    await storage.setItem("twitch_session", _session);
  },

  async getSession(): Promise<AuthSession | null> {
    if (!session) {
      session = await storage.getItem("twitch_session");
    }

    return session;
  },

  async clearSession(): Promise<void> {
    session = null;
    await storage.removeItem("twitch_session");
  },

  isExpiringSoon(session: AuthSession): boolean {
    const REFRESH_THRESHOLD = 30 * 60 * 1000; // 30 minutes
    const isExpiring = session.expires_at <= Date.now() + REFRESH_THRESHOLD;
    return isExpiring;
  },

  async retrieveSession(config: {
    clientId: string;
    clientSecret: string;
    grantType: string;
    oauthEndpoint: string;
  }): Promise<AuthSession> {
    try {
      const existingSession = await this.getSession();

      if (
        existingSession &&
        existingSession.expires_at > Date.now() &&
        !this.isExpiringSoon(existingSession)
      ) {
        console.info("Returning existing session");
        return existingSession;
      }

      const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: config.grantType,
      });

      const response = await fetch(`${config.oauthEndpoint}?${params}`, {
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

      console.info("Returning new session");

      await this.setSession(res);
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
  },

  async makeAuthenticatedRequest(
    event: H3Event,
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const {
      tw: { clientId, clientSecret, grantType, oauthEndpoint },
      igdb: { endpoint },
    } = useRuntimeConfig(event);

    const session = await this.retrieveSession({
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
  },
};
