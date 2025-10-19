import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart, { ICart, ICartItem } from "@/models/Cart";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { Types } from "mongoose";

type AddItemBody = {
  itemId: string;
  itemType: "course" | "chapter";
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const rawUser = (await getUserFromApiRoute()) as { id: string } | null;
    if (!rawUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = new Types.ObjectId(rawUser.id);

    const body = (await req.json()) as AddItemBody | null;
    if (!body)
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const { itemId, itemType } = body;
    if (!itemId || !itemType)
      return NextResponse.json(
        { error: "itemId and itemType required" },
        { status: 400 }
      );

    if (itemType !== "course" && itemType !== "chapter")
      return NextResponse.json(
        { error: "itemType must be 'course' or 'chapter'" },
        { status: 400 }
      );

    let price = 0;
    let courseIdOfChapter: Types.ObjectId | null = null;

    if (itemType === "course") {
      const course = await Course.findById(itemId).lean<ICourse>().exec();
      if (!course)
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      price = course.price;
    } else {
      const chapter = await Chapter.findById(itemId).lean<IChapter>().exec();
      if (!chapter)
        return NextResponse.json(
          { error: "Chapter not found" },
          { status: 404 }
        );

      const parentCourse = await Course.findById(chapter.courseId)
        .lean<ICourse>()
        .exec();
      if (!parentCourse)
        return NextResponse.json(
          { error: "Parent course not found" },
          { status: 500 }
        );

      price = parentCourse.chapterPrice;
      courseIdOfChapter = chapter.courseId as Types.ObjectId;
    }

    // find or create cart
    let cart = await Cart.findOne({ userId }).exec();
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // business logic
    if (itemType === "course") {
      const newItems: ICartItem[] = [];
      for (const it of cart.items as ICartItem[]) {
        if (it.itemType === "chapter") {
          const ch = await Chapter.findById(it.itemId).lean<IChapter>().exec();
          if (
            ch &&
            ch.courseId &&
            ch.courseId.toString() === itemId.toString()
          ) {
            continue;
          }
        }
        newItems.push(it);
      }
      cart.items = newItems;
    } else if (itemType === "chapter" && courseIdOfChapter) {
      const courseInCart = (cart.items as ICartItem[]).find(
        (it) =>
          it.itemType === "course" &&
          it.itemId.toString() === courseIdOfChapter.toString()
      );
      if (courseInCart) {
        return NextResponse.json(
          { error: "Course already in cart — cannot add chapter" },
          { status: 409 }
        );
      }
    }

    // prevent duplicate item
    const exists = (cart.items as ICartItem[]).some(
      (it) =>
        it.itemType === itemType && it.itemId.toString() === itemId.toString()
    );
    if (exists)
      return NextResponse.json(
        { error: "Item already in cart" },
        { status: 409 }
      );

    // push new item
    const newItem: ICartItem = {
      itemId: new Types.ObjectId(itemId),
      itemType,
      price,
      addedAt: new Date(),
    };
    cart.items.push(newItem as any);

    await cart.save();

    const total = (cart.items as ICartItem[]).reduce(
      (s: number, it: ICartItem) => s + (it.price ?? 0),
      0
    );

    const responseItems = (cart.items as ICartItem[]).map((it: ICartItem) => ({
      itemId: it.itemId.toString(),
      itemType: it.itemType,
      price: it.price,
      addedAt: it.addedAt,
    }));

    return NextResponse.json({ success: true, items: responseItems, total });
  } catch (err: any) {
    console.error("POST /api/cart/add error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
