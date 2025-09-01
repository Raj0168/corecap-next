import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken } from "@/lib/jwt";
import { issueTokensAndStore, revokeRefreshSessionByJti } from "@/lib/session";

export async function POST() {
  try {
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

    // Revoke old session
    await revokeRefreshSessionByJti(payload.jti);

    // Issue new tokens and store new session
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
