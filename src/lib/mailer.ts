import { OTP_TIMEOUT } from "@/constants/backend";
import { sendMail } from "./mail";

export async function sendVerificationOtp(email: string, code: string) {
  const subject = "Verify your Corecap account";
  const text = `Your Corecap verification code is: ${code}\n\nThis code expires in ${OTP_TIMEOUT} minutes.`;
  return sendMail(email, subject, text);
}

export async function sendPasswordResetOtp(email: string, code: string) {
  const subject = "Reset your Corecap password";
  const text = `Your password reset code is: ${code}\n\nThis code expires in ${OTP_TIMEOUT} minutes. If you didn't request this, ignore this email.`;
  return sendMail(email, subject, text);
}
