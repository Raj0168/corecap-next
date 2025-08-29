import { NextResponse } from "next/server";
import { signAccessToken, verifyAccessToken } from "@/lib/jwt";

export async function GET() {
  const token = signAccessToken({ sub: "123", role: "admin" });
  const payload = verifyAccessToken(token);
  return NextResponse.json({ token, payload });
}
