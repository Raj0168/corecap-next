import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";

export async function GET() {
  await connectDB();

  const existing = await User.findOne({ email: "test@example.com" });
  if (existing) {
    return NextResponse.json({ msg: "User already exists", user: existing });
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await User.create({
    email: "test@example.com",
    password: hashedPassword,
    role: "admin",
  });

  return NextResponse.json({ msg: "User created", user });
}
