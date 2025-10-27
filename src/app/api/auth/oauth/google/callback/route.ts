import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import RefreshTokenModel from "@/models/RefreshToken";
import { uid } from "@/lib/uid";
import { config } from "@/config";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { getGoogleUser } from "@/lib/google";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");

    if (!code)
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );

    // Validate state (CSRF)
    const cookieStore = await cookies();
    const expectedState = cookieStore.get("oauth_state")?.value;
    if (!expectedState || returnedState !== expectedState) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }
    // Clear state cookie
    const clear = NextResponse.next();
    clear.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });

    // Fetch Google profile
    const profile = await getGoogleUser(code);
    const { email, name, email_verified } = profile;

    if (!email) {
      return NextResponse.json(
        { error: "Google account has no email" },
        { status: 400 }
      );
    }

    let userDoc = await User.findOne({ email });

    if (!userDoc) {
      const fallbackName = email.split("@")[0];
      userDoc = await User.create({
        name: name || fallbackName,
        email,
        provider: "google",
        isEmailVerified: email_verified ?? true,
        password: null,
      });
    } else {
      if (email_verified && !userDoc.isEmailVerified) {
        userDoc.isEmailVerified = true;
        await userDoc.save();
      }
    }

    const jti = uid();
    const accessToken = signAccessToken({
      id: userDoc._id.toString(),
      role: userDoc.role,
    });
    const refreshToken = signRefreshToken({
      id: userDoc._id.toString(),
      role: userDoc.role,
      jti,
    });

    await RefreshTokenModel.create({
      userId: userDoc._id,
      jti,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    const res = NextResponse.redirect(`${config.appUrl}/my-courses`);

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "OAuth callback error" },
      { status: 500 }
    );
  }
}
