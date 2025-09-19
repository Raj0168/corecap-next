import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Cart from "@/models/Cart";

export async function GET() {
  try {
    await connectDB();
    const payload = await getUserFromApiRoute();
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await Cart.findOne({ userId: payload.id });
    if (!cart) return NextResponse.json({ cart: { items: [] } });

    return NextResponse.json({ cart });
  } catch (err: any) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
