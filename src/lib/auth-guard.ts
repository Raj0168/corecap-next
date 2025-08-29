import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import type { JwtPayload } from "jsonwebtoken";

type UserPayload = JwtPayload & { role?: string; sub?: string };

/**
 * Used inside API routes (App Router).
 */
export async function getUserFromApiRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  try {
    return verifyAccessToken(token) as UserPayload;
  } catch {
    return null;
  }
}

/**
 * Used inside middleware.ts
 */
export function getUserFromMiddleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;
  try {
    return verifyAccessToken(token) as UserPayload;
  } catch {
    return null;
  }
}
