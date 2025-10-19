import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/models/Cart";
import Purchase from "@/models/Purchase";
import User from "@/models/User";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import { getUserFromApiRoute, requireAdmin } from "@/lib/auth-guard";
import { Types } from "mongoose";

/**
 * GET /api/orders
 *  - if admin and ?admin=true -> returns all purchases (admin)
 *  - otherwise returns current user's purchases (paginated)
 *
 * POST /api/orders  (checkout)
 *  - processes user's cart, marks purchase as paid, updates user's purchased* arrays and clears cart
 *  - Body (optional): { paymentProvider?: string, providerPaymentId?: string } - used when integrated with real gateway later
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const adminFlag = url.searchParams.get("admin") === "true";

    const userToken = await getUserFromApiRoute();
    if (!userToken)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // admin fetch all
    if (adminFlag) {
      // require admin
      const payload = await requireAdmin(); // will throw if not admin
      // return all purchases
      const purchases = (await Purchase.find()
        .sort({ createdAt: -1 })
        .lean()
        .exec()) as any[];
      return NextResponse.json(
        purchases.map((p) => ({ id: p._id.toString(), ...p }))
      );
    }

    // normal user: return their purchases
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

    const userId = (userToken as any).id;

    // fetch cart
    const cart = (await Cart.findOne({ userId }).lean().exec()) as unknown as
      | any
      | null;
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // compute final items and total, re-resolve prices from DB for safety
    const resolvedItems: any[] = [];
    let total = 0;

    for (const it of cart.items) {
      if (it.itemType === "course") {
        const course = (await Course.findById(it.itemId)
          .lean()
          .exec()) as unknown as any | null;
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
          .exec()) as unknown as any | null;
        if (!chapter)
          return NextResponse.json(
            { error: "Chapter not found in cart" },
            { status: 400 }
          );
        // chapter price uses parent course.chapterPrice
        const course = (await Course.findById(chapter.courseId)
          .lean()
          .exec()) as unknown as any | null;
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

    // create purchase record (status: paid - mock)
    const body = await req.json().catch(() => ({}));
    const paymentProvider = body.paymentProvider ?? "mock";
    const providerPaymentId = body.providerPaymentId ?? null;

    const purchase = await Purchase.create({
      userId: new Types.ObjectId(userId),
      items: resolvedItems,
      amount: total,
      status: "paid",
      paymentProvider,
      providerPaymentId,
    });

    // update user's purchasedCourses and purchasedChapters using $addToSet
    const addCourseIds = resolvedItems
      .filter((i) => i.itemType === "course")
      .map((i) => i.itemId);
    const addChapterIds = resolvedItems
      .filter((i) => i.itemType === "chapter")
      .map((i) => i.itemId);

    // update user in DB
    const userDoc = await User.findById(userId).exec();
    if (userDoc) {
      // add courses
      if (addCourseIds.length > 0) {
        for (const cid of addCourseIds) {
          if (!userDoc.purchasedCourses) userDoc.purchasedCourses = [];
          const exists = (userDoc.purchasedCourses ?? []).some(
            (x: any) => x.toString() === cid.toString()
          );
          if (!exists) userDoc.purchasedCourses.push(cid);
        }
      }
      // add chapters
      if (addChapterIds.length > 0) {
        for (const chid of addChapterIds) {
          if (!userDoc.purchasedChapters) userDoc.purchasedChapters = [];
          const exists = (userDoc.purchasedChapters ?? []).some(
            (x: any) => x.toString() === chid.toString()
          );
          if (!exists) userDoc.purchasedChapters.push(chid);
        }
      }
      await userDoc.save();
    } else {
      console.warn("Checkout: user not found when updating purchases", userId);
    }

    // remove user's cart
    await Cart.findOneAndDelete({ userId }).exec();

    return NextResponse.json({
      id: purchase._id.toString(),
      status: purchase.status,
      amount: purchase.amount,
      items: purchase.items,
    });
  } catch (err: any) {
    console.error("POST /api/orders (checkout) error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
