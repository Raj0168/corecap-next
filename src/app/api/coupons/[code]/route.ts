// src/app/api/coupons/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon, { ICoupon } from "@/models/Coupon";
import { getUserFromApiRoute } from "@/lib/auth-guard";

type UpdateBody = Partial<{
  discountAmount: number;
  minAmount: number;
  expiresAt: string;
  maxUses: number;
  code: string;
}>;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await context.params;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    }).lean<ICoupon>();

    if (!coupon)
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    console.error("ADMIN GET COUPON ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await context.params;
    const body = (await req.json()) as UpdateBody;

    const update: any = {};
    if (body.discountAmount !== undefined)
      update.discountAmount = body.discountAmount;
    if (body.minAmount !== undefined) update.minAmount = body.minAmount;
    if (body.expiresAt !== undefined)
      update.expiresAt = new Date(body.expiresAt);
    if (body.maxUses !== undefined) update.maxUses = body.maxUses;
    if (body.code !== undefined) update.code = body.code.toUpperCase();

    const updated = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $set: update },
      { new: true }
    ).lean<ICoupon>();

    if (!updated)
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    console.error("ADMIN PATCH COUPON ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await context.params;
    const deleted = await Coupon.findOneAndDelete({ code: code.toUpperCase() });

    if (!deleted)
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("ADMIN DELETE COUPON ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
