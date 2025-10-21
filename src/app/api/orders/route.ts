import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Cart, { ICart } from "@/models/Cart";
import Purchase from "@/models/Purchase";
import User from "@/models/User";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import { getUserFromApiRoute, requireAdmin } from "@/lib/auth-guard";
import mongoose, { Types } from "mongoose";

interface ICourse {
  _id: Types.ObjectId;
  price: number;
  chapterPrice: number;
}
interface IChapter {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const adminFlag = url.searchParams.get("admin") === "true";

    const userToken = await getUserFromApiRoute();
    if (!userToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (adminFlag) {
      await requireAdmin();
      const purchases = (await Purchase.find()
        .sort({ createdAt: -1 })
        .lean()
        .exec()) as any[];
      return NextResponse.json(
        purchases.map((p) => ({ id: p._id.toString(), ...p }))
      );
    }

    const userId = (userToken as any).id;
    const purchases = (await Purchase.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as any[];

    return NextResponse.json(
      purchases.map((p) => ({ id: p._id.toString(), ...p }))
    );
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userToken = await getUserFromApiRoute();
    if (!userToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId((userToken as any).id);

    const cart = (await Cart.findOne({ userId }).lean().exec()) as Pick<
      ICart,
      "items"
    > | null;
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const resolvedItems: any[] = [];
    let total = 0;

    for (const it of cart.items) {
      if (it.itemType === "course") {
        const course = (await Course.findById(it.itemId)
          .lean()
          .exec()) as ICourse | null;
        if (!course)
          return NextResponse.json(
            { error: "Course not found in cart" },
            { status: 400 }
          );
        const price = course.price;
        resolvedItems.push({
          itemId: new Types.ObjectId(it.itemId),
          itemType: "course",
          price,
        });
        total += price;
      } else {
        const chapter = (await Chapter.findById(it.itemId)
          .lean()
          .exec()) as IChapter | null;
        if (!chapter)
          return NextResponse.json(
            { error: "Chapter not found in cart" },
            { status: 400 }
          );
        const course = (await Course.findById(chapter.courseId)
          .lean()
          .exec()) as ICourse | null;
        if (!course)
          return NextResponse.json(
            { error: "Parent course not found for chapter" },
            { status: 400 }
          );
        const price = course.chapterPrice;
        resolvedItems.push({
          itemId: new Types.ObjectId(it.itemId),
          itemType: "chapter",
          price,
        });
        total += price;
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const body = await req.json().catch(() => ({}));
      const paymentProvider = body.paymentProvider ?? "mock";
      const providerPaymentId = body.providerPaymentId ?? null;

      const purchase = await Purchase.create(
        [
          {
            userId,
            items: resolvedItems,
            amount: total,
            status: "paid",
            paymentProvider,
            providerPaymentId,
          },
        ],
        { session }
      );

      const courseIds = resolvedItems
        .filter((r) => r.itemType === "course")
        .map((r) => r.itemId);
      const chapterIds = resolvedItems
        .filter((r) => r.itemType === "chapter")
        .map((r) => r.itemId);

      await User.updateOne(
        { _id: userId },
        {
          $addToSet: {
            purchasedCourses: { $each: courseIds },
            purchasedChapters: { $each: chapterIds },
          },
        },
        { session }
      ).exec();

      await Cart.deleteOne({ userId }, { session }).exec();

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        id: purchase[0]._id.toString(),
        status: purchase[0].status,
        amount: purchase[0].amount,
        items: purchase[0].items,
      });
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      console.error("Checkout tx error:", txErr);
      return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("POST /api/orders (checkout) error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
