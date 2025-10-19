// src/app/api/cart/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const rawUser = (await getUserFromApiRoute()) as { id: string } | null;
    if (!rawUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = new Types.ObjectId(rawUser.id);

    await Cart.findOneAndDelete({ userId }).exec();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/cart/clear error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
