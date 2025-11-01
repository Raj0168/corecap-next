import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart from "@/models/Cart";
import { Types } from "mongoose";

export async function POST() {
  try {
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId(user.id);

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    // ❗ Do NOT touch coupon usedCount here — only update after payment success
    await Cart.updateOne({ userId }, { $unset: { coupon: 1 } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Coupon remove error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
