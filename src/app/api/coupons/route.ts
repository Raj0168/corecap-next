// src/app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon, { ICoupon } from "@/models/Coupon";
import { getUserFromApiRoute } from "@/lib/auth-guard";

type CreateCouponBody = {
  code: string;
  discountAmount: number;
  minAmount?: number;
  expiresAt: string; // ISO string
  maxUses: number;
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || 20))
    );
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Coupon.countDocuments({}),
      Coupon.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ICoupon>(),
    ]);

    return NextResponse.json({
      success: true,
      data: { items, total, page, limit },
    });
  } catch (err: any) {
    console.error("ADMIN GET COUPONS ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as CreateCouponBody;

    if (!body?.code)
      return NextResponse.json({ error: "code required" }, { status: 400 });
    if (typeof body.discountAmount !== "number")
      return NextResponse.json(
        { error: "discountAmount required" },
        { status: 400 }
      );
    if (!body?.expiresAt)
      return NextResponse.json(
        { error: "expiresAt required" },
        { status: 400 }
      );
    if (typeof body.maxUses !== "number")
      return NextResponse.json({ error: "maxUses required" }, { status: 400 });

    // basic validation
    const exists = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (exists)
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );

    const coupon = await Coupon.create({
      code: body.code.toUpperCase(),
      discountAmount: body.discountAmount,
      minAmount: body.minAmount ?? 0,
      expiresAt: new Date(body.expiresAt),
      maxUses: body.maxUses,
      usedCount: 0,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    console.error("ADMIN CREATE COUPON ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
