import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/crypto";
import { issueTokensAndStore } from "@/lib/session";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin || !admin.password) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent") ?? null;
    const ipHeader =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      null;
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;

    return await issueTokensAndStore({
      user: { id: admin._id.toString(), role: admin.role },
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
