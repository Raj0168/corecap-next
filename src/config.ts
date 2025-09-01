function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export const config = {
  mongoUri: requireEnv("MONGODB_URI"),
  accessTokenSecret: requireEnv("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: requireEnv("REFRESH_TOKEN_SECRET"),
  smtpUser: requireEnv("SMTP_USER"),
  smtpPass: requireEnv("SMTP_PASS"),
  nodeEnv: process.env.NODE_ENV || "development",
  saltRounds: parseInt(process.env.SALT_ROUNDS || "10", 10),
};
