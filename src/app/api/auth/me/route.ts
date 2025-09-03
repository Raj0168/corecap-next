import { NextResponse } from "next/server";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
try {
  await connectDB();
  const payload = await getUserFromApiRoute();
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(payload.id).select("-password");
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ ok: true, user }, { status: 200 });
} catch (err: any) {
  return NextResponse.json({ error: err.message }, { status: 500 });
}
}
