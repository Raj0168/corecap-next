import { signAccessToken, signRefreshToken } from "./jwt";
import { NextResponse } from "next/server";
import { config } from "../config";
import { uid } from "./uid";
import RefreshTokenModel from "@/models/RefreshToken";
import connectDB from "./db";
import mongoose from "mongoose";

/**
 * Issue access + refresh cookies and persist refresh session to DB.
 * Accepts optional request metadata to store (ip/userAgent).
 */
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

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshTokenModel.create({
    userId: new (mongoose as any).Types.ObjectId(user.id),
    jti,
    expiresAt,
    revoked: false,
    ip,
    userAgent,
  });

  const res = NextResponse.json({ ok: true });

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return res;
}

export async function revokeRefreshSessionByJti(jti: string) {
  await connectDB();
  await RefreshTokenModel.updateOne({ jti }, { revoked: true }).exec();
}

export async function revokeUserSessions(userId: string) {
  await connectDB();
  await RefreshTokenModel.updateMany({ userId }, { revoked: true }).exec();
}
