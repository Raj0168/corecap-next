import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import { Types } from "mongoose";

interface ApplyCouponRequest {
  code: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as ApplyCouponRequest;
    const { code } = body;

    if (!code)
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );

    const user = await getUserFromApiRoute();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId(user.id);

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0)
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const coupon = await Coupon.findOne({ code });
    if (!coupon)
      return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });

    if (coupon.expiresAt < new Date())
      return NextResponse.json({ error: "Coupon expired" }, { status: 400 });

    if (coupon.usedCount >= coupon.maxUses)
      return NextResponse.json(
        { error: "Coupon usage limit reached" },
        { status: 400 }
      );

    const cartTotal = cart.items.reduce(
      (sum: number, item: { price: number }) => {
        return sum + item.price;
      },
      0
    );

    if (cartTotal < coupon.minAmount)
      return NextResponse.json(
        { error: `Minimum order amount ₹${coupon.minAmount}` },
        { status: 400 }
      );

    const discount = Math.min(coupon.discountAmount, cartTotal);

    cart.coupon = { code: coupon.code, discount };
    await cart.save();

    return NextResponse.json({
      success: true,
      coupon: cart.coupon,
    });
  } catch (err) {
    console.error("Coupon apply error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
