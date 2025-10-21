// src/app/api/cart/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart, { ICartItem } from "@/models/Cart";
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

    if (!Types.ObjectId.isValid(itemId))
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });

    if (itemType !== "course" && itemType !== "chapter")
      return NextResponse.json(
        { error: "itemType must be 'course' or 'chapter'" },
        { status: 400 }
      );

    // find or create cart
    let cart = await Cart.findOne({ userId }).exec();
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    // check if item already exists
    const exists = (cart.items as ICartItem[]).some(
      (it) => it.itemType === itemType && it.itemId.toString() === itemId
    );
    if (exists)
      return NextResponse.json(
        { error: "Item already in cart" },
        { status: 409 }
      );

    // enforce exclusive types
    const hasCourse = (cart.items as ICartItem[]).some(
      (it) => it.itemType === "course"
    );
    const hasChapter = (cart.items as ICartItem[]).some(
      (it) => it.itemType === "chapter"
    );

    if (itemType === "course" && hasChapter)
      return NextResponse.json(
        { error: "Cannot add courses: cart already has chapters" },
        { status: 409 }
      );
    if (itemType === "chapter" && hasCourse)
      return NextResponse.json(
        { error: "Cannot add chapters: cart already has courses" },
        { status: 409 }
      );

    // get price
    let price = 0;
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
    }

    // push item
    const newItem: ICartItem = {
      itemId: new Types.ObjectId(itemId),
      itemType,
      price,
      addedAt: new Date(),
    };
    cart.items.push(newItem as any);

    await cart.save();

    const total = (cart.items as ICartItem[]).reduce(
      (s, it) => s + (it.price ?? 0),
      0
    );
    const responseItems = (cart.items as ICartItem[]).map((it: ICartItem) => ({
      itemId: it.itemId.toString(),
      itemType: it.itemType,
      price: it.price,
      addedAt: it.addedAt,
    }));

    return NextResponse.json(
      { success: true, items: responseItems, total },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/cart/add error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
