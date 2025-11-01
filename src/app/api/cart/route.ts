// src/app/api/cart/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart, { ICart } from "@/models/Cart";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { Types } from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId(user.id);
    const cart = await Cart.findOne({ userId }).lean<ICart>().exec();

    if (!cart)
      return NextResponse.json({
        items: [],
        total: 0,
        discount: 0,
        payable: 0,
        coupon: null,
      });

    const total = cart.items.reduce((s, it) => s + it.price, 0);
    const discount = cart.coupon?.discount ?? 0;
    const payable = Math.max(total - discount, 0);

    const items = await Promise.all(
      cart.items.map(async (it) => {
        let name = "";

        if (it.itemType === "course") {
          const c = await Course.findById(it.itemId)
            .select("title")
            .lean<ICourse>()
            .exec();
          name = c?.title ?? "Unknown Course";
        } else {
          const ch = await Chapter.findById(it.itemId)
            .select("title")
            .lean<IChapter>()
            .exec();
          name = ch?.title ?? "Unknown Chapter";
        }

        return {
          itemId: it.itemId.toString(),
          itemType: it.itemType,
          name,
          price: it.price,
          addedAt: it.addedAt,
        };
      })
    );

    return NextResponse.json({
      items,
      total,
      discount,
      payable,
      coupon: cart.coupon ?? null,
    });
  } catch (err: any) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
