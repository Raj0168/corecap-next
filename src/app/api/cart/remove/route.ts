import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart, { ICartItem } from "@/models/Cart";

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await getUserFromApiRoute();
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId, itemType } = await req.json();
    if (!itemId || !itemType) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: payload.id });
    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    cart.items = cart.items.filter(
      (i: ICartItem) =>
        !(i.itemId.toString() === itemId && i.itemType === itemType)
    );

    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (err: any) {
    console.error("POST /api/cart/remove error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
