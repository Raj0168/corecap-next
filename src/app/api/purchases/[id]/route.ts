import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import Purchase from "@/models/Purchase";

const { ObjectId } = mongoose.Types;

// ✅ FIX: Correct param type (async params in Next 14+)
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Extract param safely
    const { id } = await context.params;

    // Get logged-in user
    const user = await getUserFromApiRoute();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid purchase ID" },
        { status: 400 }
      );
    }

    const userIdString = user.id;
    if (!userIdString || !ObjectId.isValid(userIdString)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userObjectId = new ObjectId(userIdString);
    const purchaseObjectId = new ObjectId(id);

    console.log("DEBUG — purchase detail request:", {
      purchaseId: purchaseObjectId.toString(),
      userId: userObjectId.toString(),
    });

    const purchase = await Purchase.findOne({
      _id: purchaseObjectId,
      userId: userObjectId,
    }).lean();

    console.log("DEBUG — found purchase:", purchase);

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, purchase });
  } catch (err: any) {
    console.error("GET PURCHASE DETAIL ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
