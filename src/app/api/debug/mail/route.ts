import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
  try {
    await sendMail("prateek08raj@gmail.com", "Test", "Hello from Corecap!");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Mail failed" }, { status: 500 });
  }
}
