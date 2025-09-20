import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken } from "@/lib/jwt";
import { revokeRefreshSessionByJti } from "@/lib/session";
import connectDB from "@/lib/db";

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken) as {
          jti?: string;
        };
        if (payload?.jti) {
          await revokeRefreshSessionByJti(payload.jti);
        }
      } catch {
        // ignore invalid token
      }
    }

    const res = NextResponse.json({ ok: true });

    // Clear cookies on logout
    res.cookies.set("accessToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
