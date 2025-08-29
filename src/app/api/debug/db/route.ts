import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db";

export async function GET() {
  await connectDB();
  const count = await User.countDocuments();
  return NextResponse.json({ ok: true, users: count });
}
