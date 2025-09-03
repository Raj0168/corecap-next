import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import Otp from "@/models/Otp";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, code, newPassword } = await req.json();

    const otp = await Otp.findOne({
      email,
      code,
      purpose: "reset_password",
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

    // Cleanup other reset OTPs
    await Otp.deleteMany({ email, purpose: "reset_password", consumed: false });

    const hashed = await hashPassword(newPassword);
    await User.updateOne({ email }, { $set: { password: hashed } });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
