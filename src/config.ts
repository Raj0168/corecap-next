function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export const config = {
  appUrl: requireEnv("NEXT_PUBLIC_APP_URL"),
  mongoUri: requireEnv("MONGODB_URI"),
  accessTokenSecret: requireEnv("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: requireEnv("REFRESH_TOKEN_SECRET"),
  smtpUser: requireEnv("SMTP_USER"),
  smtpPass: requireEnv("SMTP_PASS"),
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI!,
  nodeEnv: process.env.NODE_ENV || "development",
  saltRounds: parseInt(process.env.SALT_ROUNDS || "10", 10),
};
