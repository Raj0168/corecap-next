import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import type { TokenPayload } from "./jwt";

export async function getUserFromApiRoute(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("accessToken")?.value;
    if (!token) return null;
    const payload = verifyAccessToken(token);
    return payload ?? null;
  } catch {
    return null;
  }
}

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

export async function requireAdmin(): Promise<TokenPayload> {
  const user = await getUserFromApiRoute();
  if (!user || user.role !== "admin") {
    const err = new Error("Forbidden: admin required");
    (err as any).status = 403;
    throw err;
  }
  return user;
}

export async function getUserIdFromApiRoute(): Promise<string | null> {
  const u = await getUserFromApiRoute();
  return u?.id ?? null;
}
