import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken } from "@/lib/jwt";
import { revokeRefreshSessionByJti } from "@/lib/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken) as { jti?: string };
        if (payload?.jti) {
          await revokeRefreshSessionByJti(payload.jti);
        }
      } catch {
        // ignore invalid token
      }
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
