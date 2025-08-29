import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(to: string, subject: string, text: string) {
  return transporter.sendMail({
    from: `"Corecap" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
}
