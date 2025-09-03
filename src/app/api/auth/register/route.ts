import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/crypto";
import { registerSchema } from "@/lib/validator";
import Otp from "@/models/Otp";
import { generateOtp } from "@/lib/otp";
import { OTP_TIMEOUT } from "@/constants/backend";
import { sendVerificationOtp } from "@/lib/mail";

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

    await Otp.deleteMany({ email, purpose: "verify_email", consumed: false });

    const hashed = await hashPassword(password);
    const code = generateOtp();

    await Otp.create({
      email,
      code,
      purpose: "verify_email",
      expiresAt: new Date(Date.now() + OTP_TIMEOUT * 60 * 1000),
      data: { name, email, password: hashed },
    });

    await sendVerificationOtp(email, code);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email. Please verify to complete signup.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
