import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/crypto";
import { loginSchema } from "@/lib/validator";
import { issueTokensAndStore } from "@/lib/session";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = loginSchema.parse(body);
    const { email, password } = parsed;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isEmailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in." },
        { status: 403 }
      );
    }

    const userAgent = req.headers.get("user-agent") ?? null;

    // Prefer x-forwarded-for (proxies), fallback to x-real-ip
    const ipHeader =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      null;
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;

    // Issue tokens and store refresh session in DB
    return await issueTokensAndStore({
      user: { id: user._id.toString(), role: user.role },
      ip,
      userAgent,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
