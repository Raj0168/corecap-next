import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "test-ip";
  try {
    rateLimit(ip);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
}
