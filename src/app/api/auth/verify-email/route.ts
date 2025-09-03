import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, code } = await req.json();

    const otp = await Otp.findOne({
      email,
      code,
      purpose: "verify_email",
      consumed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    otp.consumed = true;
    await otp.save();

    // Cleanup all other OTPs for this email
    await Otp.deleteMany({ email, purpose: "verify_email", consumed: false });

    const { name, password } = otp.data || {};
    if (!name || !password) {
      return NextResponse.json(
        { error: "Invalid signup data" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already verified/registered" },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true,
      provider: "credentials",
    });

    return NextResponse.json({
      success: true,
      user: { id: user._id, email: user.email },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
