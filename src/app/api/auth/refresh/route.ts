import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken } from "@/lib/jwt";
import { issueTokensAndStore } from "@/lib/session";
import RefreshTokenModel from "@/models/RefreshToken";
import connectDB from "@/lib/db";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken) as {
        id: string;
        role: string;
        jti?: string;
      };
    } catch {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (!payload.jti) {
      return NextResponse.json(
        { error: "Invalid token (missing jti)" },
        { status: 401 }
      );
    }

    // Check session validity in DB
    const session = await RefreshTokenModel.findOne({ jti: payload.jti });
    if (!session || session.revoked || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // session.lastUsedAt = new Date();
    // await session.save();

    // Issue new tokens and keep old refresh session alive
    return await issueTokensAndStore({
      user: { id: payload.id, role: payload.role },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
