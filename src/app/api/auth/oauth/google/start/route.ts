import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google";
import { uid } from "@/lib/uid";
import { config } from "@/config";

export async function GET() {
  const state = uid();
  const authUrl = getGoogleAuthUrl(state);

  const res = NextResponse.redirect(authUrl);

  // short-lived state cookie
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}
