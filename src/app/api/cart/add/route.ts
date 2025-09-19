import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart, { ICartItem } from "@/models/Cart";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await getUserFromApiRoute();
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findById(payload.id);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { itemId, itemType, price } = await req.json();
    if (!itemId || !itemType || !price) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Prevent duplicates from purchased
    if (
      itemType === "course" &&
      user.purchasedCourses?.some((id: any) => id.toString() === itemId)
    ) {
      return NextResponse.json(
        { error: "Course already purchased" },
        { status: 400 }
      );
    }
    if (
      itemType === "chapter" &&
      user.purchasedChapters?.some((id: any) => id.toString() === itemId)
    ) {
      return NextResponse.json(
        { error: "Chapter already purchased" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id, items: [] });
    }

    const exists = cart.items.some(
      (i: ICartItem) =>
        i.itemId.toString() === itemId && i.itemType === itemType
    );
    if (exists) {
      return NextResponse.json(
        { error: "Item already in cart" },
        { status: 400 }
      );
    }

    cart.items.push({ itemId, itemType, price });
    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (err: any) {
    console.error("POST /api/cart/add error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
