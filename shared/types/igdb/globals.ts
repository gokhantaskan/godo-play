export interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: "bearer" | string;
}

export interface AuthSession extends Omit<TwitchAuthResponse, "expires_in"> {
  expires_at: number;
}
