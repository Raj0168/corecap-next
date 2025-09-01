import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config";

export type TokenPayload = {
  id: string;
  role: string;
  type?: "access" | "refresh";
  iat?: number;
  exp?: number;
};

export function signAccessToken(payload: { id: string; role: string }) {
  return jwt.sign({ ...payload, type: "access" }, config.accessTokenSecret, {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: { id: string; role: string }) {
  return jwt.sign({ ...payload, type: "refresh" }, config.refreshTokenSecret, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.accessTokenSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.refreshTokenSecret) as TokenPayload;
}
