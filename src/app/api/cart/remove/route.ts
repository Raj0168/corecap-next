import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart, { ICart, ICartItem } from "@/models/Cart";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { Types } from "mongoose";

type RemoveBody = { itemId: string; itemType: "course" | "chapter" };

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const rawUser = (await getUserFromApiRoute()) as { id: string } | null;
    if (!rawUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId(rawUser.id);
    const body = (await req.json()) as RemoveBody | null;

    if (!body)
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const { itemId, itemType } = body;
    if (!itemId || !itemType)
      return NextResponse.json(
        { error: "itemId and itemType required" },
        { status: 400 }
      );

    const cartDoc = await Cart.findOne({ userId }).exec();
    if (!cartDoc)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    const beforeLen = cartDoc.items.length;

    cartDoc.items = (cartDoc.items as ICartItem[]).filter(
      (it: ICartItem) =>
        !(
          it.itemType === itemType && it.itemId.toString() === itemId.toString()
        )
    );

    if (cartDoc.items.length === beforeLen)
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );

    await cartDoc.save();

    const total = (cartDoc.items as ICartItem[]).reduce(
      (s: number, it: ICartItem) => s + (it.price ?? 0),
      0
    );

    const items = (cartDoc.items as ICartItem[]).map((it: ICartItem) => ({
      itemId: it.itemId.toString(),
      itemType: it.itemType,
      price: it.price,
      addedAt: it.addedAt,
    }));

    return NextResponse.json({ success: true, items, total });
  } catch (err: any) {
    console.error("POST /api/cart/remove error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
