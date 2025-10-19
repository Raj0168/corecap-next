import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import type { TokenPayload } from "./jwt";

/**
 * Read auth cookie inside App Router server functions / API routes.
 * Returns TokenPayload or null.
 */
export async function getUserFromApiRoute(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies(); // synchronous
    const token = (await cookieStore).get("accessToken")?.value;
    if (!token) return null;
    const payload = verifyAccessToken(token); // throws if invalid
    return payload ?? null;
  } catch {
    return null;
  }
}

/**
 * Use inside middleware (NextRequest)
 */
export function getUserFromMiddleware(req: NextRequest): TokenPayload | null {
  try {
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return null;
    const payload = verifyAccessToken(token);
    return payload ?? null;
  } catch {
    return null;
  }
}

/**
 * Require an admin user inside server routes (throws Error if not admin).
 */
export async function requireAdmin(): Promise<TokenPayload> {
  const user = await getUserFromApiRoute();
  if (!user || user.role !== "admin") {
    const err = new Error("Forbidden: admin required");
    (err as any).status = 403;
    throw err;
  }
  return user;
}

/**
 * Convenience: return user id or null
 */
export async function getUserIdFromApiRoute(): Promise<string | null> {
  const u = await getUserFromApiRoute();
  return (u as any)?.id ?? null;
}
