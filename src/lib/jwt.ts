import jwt from "jsonwebtoken";
import { config } from "../config";

export type TokenPayload = {
  _id: unknown;
  id: string;
  role: string;
  jti?: string;
  type?: "access" | "refresh";
  iat?: number;
  exp?: number;
};

export function signAccessToken(payload: { id: string; role: string }) {
  return jwt.sign({ ...payload, type: "access" }, config.accessTokenSecret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: {
  id: string;
  role: string;
  jti: string;
}) {
  return jwt.sign(
    { ...payload, type: "refresh", jti: payload.jti },
    config.refreshTokenSecret,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.accessTokenSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.refreshTokenSecret) as TokenPayload;
}
