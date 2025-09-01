import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/crypto";
import { registerSchema } from "@/lib/validator";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = registerSchema.parse(body);
    const { name, email, password } = parsed;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
      provider: "credentials",
      isEmailVerified: false,
    });

    return NextResponse.json({
      success: true,
      user: { id: user._id, email: user.email },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
