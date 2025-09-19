import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password, secret } = await req.json();

    if (!name || !email || !password || !secret) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check secret
    if (secret !== process.env.SECRET_ADMIN_PWD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      isEmailVerified: true,
      provider: "credentials",
    });

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
