import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Order from "@/models/Order";
import Cart, { ICartItem } from "@/models/Cart";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const payload = await getUserFromApiRoute();
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await Order.find({ userId: payload.id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await connectDB();
    const payload = await getUserFromApiRoute();
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(payload.id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = cart.items.reduce(
      (sum: number, i: ICartItem) => sum + i.price,
      0
    );

    const order = await Order.create({
      userId: user._id,
      items: cart.items,
      amount: total,
      status: "paid", // ✅ fake success
    });

    // grant access
    const courseIds = cart.items
      .filter((i: any) => i.itemType === "course")
      .map((i: any) => i.itemId);
    const chapterIds = cart.items
      .filter((i: any) => i.itemType === "chapter")
      .map((i: any) => i.itemId);

    await User.findByIdAndUpdate(user._id, {
      $addToSet: {
        purchasedCourses: { $each: courseIds },
        purchasedChapters: { $each: chapterIds },
      },
    });

    cart.items = [];
    await cart.save();

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
