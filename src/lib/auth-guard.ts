import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import type { TokenPayload } from "./jwt";

/**
 * Use inside App Router API routes / server functions:
 * const user = await getUserFromApiRoute();
 */
export async function getUserFromApiRoute(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;
    return verifyAccessToken(token);
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
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}
