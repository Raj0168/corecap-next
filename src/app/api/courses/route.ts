import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      parseInt(url.searchParams.get("limit") || "20", 10)
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Course.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ICourse[]>()
        .exec(),
      Course.countDocuments().exec(),
    ]);

    return NextResponse.json({
      items: items.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        description: c.description,
        price: c.price,
        chapterPrice: c.chapterPrice,
        thumbnailUrl: c.thumbnailUrl,
        createdAt: c.createdAt,
      })),
      meta: { page, limit, total },
    });
  } catch (err: any) {
    console.error("GET /api/courses error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.slug || typeof body.price !== "number") {
      return NextResponse.json(
        { error: "title, slug and price are required" },
        { status: 400 }
      );
    }

    const existing = await Course.findOne({ slug: body.slug })
      .lean<ICourse>()
      .exec();
    if (existing)
      return NextResponse.json(
        { error: "slug already exists" },
        { status: 409 }
      );

    const course = await Course.create({
      title: body.title,
      slug: body.slug,
      description: body.description ?? "",
      price: body.price,
      chapterPrice: body.chapterPrice ?? 0,
      thumbnailUrl: body.thumbnailUrl ?? null,
    });

    return NextResponse.json({ id: course._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/courses error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
