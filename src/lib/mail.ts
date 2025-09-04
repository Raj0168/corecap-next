import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * Sends an email with optional HTML content.
 */
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  return transporter.sendMail({
    from: `"Corecap" <${config.smtpUser}>`,
    to,
    subject,
    text,
    html,
  });
}

export async function sendVerificationOtp(email: string, code: string) {
  const subject = "Verify your Corecap account";
  const text = `Your verification code is: ${code}\nThis code expires in 10 minutes.`;
  const html = `<p>Your verification code is: <strong>${code}</strong></p>
                <p>This code expires in 10 minutes.</p>`;
  return sendMail(email, subject, text, html);
}

export async function sendPasswordResetOtp(email: string, code: string) {
  const subject = "Reset your Corecap password";
  const text = `Your password reset code is: ${code}\nIf you didn't request this, ignore this email.`;
  const html = `<p>Your password reset code is: <strong>${code}</strong></p>
                <p>If you didn't request this, ignore this email.</p>`;
  return sendMail(email, subject, text, html);
}
