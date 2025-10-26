// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { issueTokensAndStore } from "@/lib/session";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { comparePassword } from "@/lib/crypto";
import { loginSchema } from "@/lib/validator";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    if (!user.isEmailVerified) {
      return new Response(JSON.stringify({ error: "Email not verified" }), {
        status: 403,
      });
    }

    const userAgent = req.headers.get("user-agent") ?? null;
    const ipHeader =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      null;
    const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;

    return await issueTokensAndStore({
      user: { id: user._id.toString(), role: user.role },
      ip,
      userAgent,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Server error" }),
      { status: 500 }
    );
  }
}
