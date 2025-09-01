import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

export async function sendMail(to: string, subject: string, text: string) {
  return transporter.sendMail({
    from: `"Corecap" <${config.smtpUser}>`,
    to,
    subject,
    text,
  });
}
