import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword } from "@/lib/crypto";
import { loginSchema } from "@/lib/validator";
import { issueTokens } from "@/lib/session";

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

    return issueTokens({ id: user._id.toString(), role: user.role });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
