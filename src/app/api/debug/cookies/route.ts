import { NextResponse } from "next/server";
import { signAccessToken } from "@/lib/jwt";
import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET() {
  const token = signAccessToken({ sub: "123", role: "user" });

  const res = NextResponse.json({ msg: "cookie set" });
  res.cookies.set("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res;
}

export async function POST() {
  const user = await getUserFromApiRoute();
  return NextResponse.json({ user });
}
