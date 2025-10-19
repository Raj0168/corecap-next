// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart, { ICart } from "@/models/Cart";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // narrow auth helper return to { id: string } shape
    const rawUser = (await getUserFromApiRoute()) as { id: string } | null;
    if (!rawUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId(rawUser.id);

    const cart = await Cart.findOne({ userId }).lean<ICart>().exec();
    if (!cart) return NextResponse.json({ items: [], total: 0 });

    const total = (cart.items ?? []).reduce((s, it) => s + (it.price ?? 0), 0);

    // convert ObjectIds to strings for JSON
    const items = cart.items.map((it) => ({
      itemId: it.itemId.toString(),
      itemType: it.itemType,
      price: it.price,
      addedAt: it.addedAt,
    }));

    return NextResponse.json({ items, total });
  } catch (err: any) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
