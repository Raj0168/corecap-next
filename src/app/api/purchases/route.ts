// /api/purchases/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Purchase from "@/models/Purchase";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchases = await Purchase.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .select("amount status createdAt updatedAt")
      .lean();

    return NextResponse.json({ success: true, purchases });
  } catch (err: any) {
    console.error("GET PURCHASES ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
