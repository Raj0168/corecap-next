import { signAccessToken, signRefreshToken } from "./jwt";
import { NextResponse } from "next/server";
import { config } from "../config";

export function issueTokens(user: { id: string; role: string }) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const res = NextResponse.json({ ok: true });

  // cookies.set expects age in seconds maxAge
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return res;
}

export function clearTokens() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  return res;
}
