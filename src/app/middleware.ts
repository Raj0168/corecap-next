import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromMiddleware } from "../lib/auth-guard";
import { rateLimit } from "../lib/ratelimit";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // debug:
  console.log("Middleware running for:", url.pathname);

  // Protect admin area
  if (url.pathname.startsWith("/api/admin")) {
    const user = getUserFromMiddleware(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Rate limit OTP endpoint
  if (url.pathname === "/api/notifications/send-otp") {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    try {
      rateLimit(ip);
    } catch {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  return NextResponse.next();
}
