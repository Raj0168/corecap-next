import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import Otp from "@/models/Otp";
import { generateOtp } from "@/lib/otp";
import { OTP_TIMEOUT } from "@/constants/backend";
import { sendPasswordResetOtp } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Remove old OTPs
    await Otp.deleteMany({ email, purpose: "reset_password", consumed: false });

    const code = generateOtp();

    await Otp.create({
      email,
      code,
      purpose: "reset_password",
      expiresAt: new Date(Date.now() + OTP_TIMEOUT * 60 * 1000),
    });

    await sendPasswordResetOtp(email, code);

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to your email.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
