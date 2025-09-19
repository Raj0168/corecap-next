import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Purchase from "@/models/Purchase";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    await connectDB();
    await requireAdmin();

    const purchases = await Purchase.find()
      .populate("userId", "name email")
      .populate("courseId", "title")
      .populate("chapterId", "title")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      purchases.map((p: any) => ({
        id: p._id.toString(),
        user: p.userId,
        course: p.courseId,
        chapter: p.chapterId,
        amount: p.amount,
        status: p.status,
        paymentProvider: p.paymentProvider,
        createdAt: p.createdAt,
      }))
    );
  } catch (err: any) {
    console.error("GET /api/admin/purchases error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
