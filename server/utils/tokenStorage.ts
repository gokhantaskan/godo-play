import { createError } from "h3";

import type {
  AuthSession,
  TwitchAuthResponse,
} from "~~/shared/types/igdb/globals";

export default {
  session: null as AuthSession | null,

  setSession(session: AuthSession): void {
    this.session = session;
  },

  getSession(): AuthSession | null {
    return this.session;
  },

  clearSession(): void {
    this.session = null;
  },

  async retrieveSession(config: {
    clientId: string;
    clientSecret: string;
    grantType: string;
    oauthEndpoint: string;
  }): Promise<AuthSession> {
    try {
      // First check if we have a valid session
      const existingSession = this.getSession();

      // 5 minutes before expiration
      if (
        existingSession &&
        existingSession.expires_at > Date.now() + 5 * 60 * 1000
      ) {
        console.info("Returning existing session");

        return existingSession;
      }

      // If no valid session, proceed with API call
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

      this.setSession(res);

      // TODO: Remove this later
      console.info("Retrieved new session");
      return this.getSession()!;
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
};
