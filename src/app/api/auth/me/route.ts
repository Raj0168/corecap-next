// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET() {
  await connectDB();

  const payload = await getUserFromApiRoute();
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findById(payload.id).select("-password");
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ ok: true, user }, { status: 200 });
}
