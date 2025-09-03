import { config } from "@/config";

type GoogleTokens = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
  id_token: string;
  refresh_token?: string;
};

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export function getGoogleAuthUrl(state: string) {
  const root = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `${root}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GoogleTokens> {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const body = new URLSearchParams({
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.googleRedirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }

  return (await res.json()) as GoogleTokens;
}

export async function fetchGoogleUser(
  accessToken: string
): Promise<GoogleProfile> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google userinfo fetch failed: ${res.status} ${text}`);
  }

  return (await res.json()) as GoogleProfile;
}

/**
 * High-level helper: code -> tokens -> profile
 */
export async function getGoogleUser(code: string): Promise<GoogleProfile> {
  const tokens = await exchangeCodeForTokens(code);
  const profile = await fetchGoogleUser(tokens.access_token);
  return profile;
}
