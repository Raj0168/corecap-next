// lib/session.ts
import { NextResponse } from "next/server";
import { signAccessToken, signRefreshToken } from "./jwt";
import RefreshTokenModel from "@/models/RefreshToken";
import connectDB from "./db";
import mongoose from "mongoose";
import { config } from "../config";
import { uid } from "./uid";

export async function issueTokensAndStore(opts: {
  user: { id: string; role: string };
  ip?: string | null;
  userAgent?: string | null;
}) {
  await connectDB();

  const { user, ip = null, userAgent = null } = opts;
  const jti = uid();

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role, jti });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshTokenModel.create({
    userId: new mongoose.Types.ObjectId(user.id),
    jti,
    expiresAt,
    revoked: false,
    ip,
    userAgent,
  });

  const res = NextResponse.json({
    ok: true,
    user, // send user object to client for Zustand
  });

  // HTTP-only cookies
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
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
