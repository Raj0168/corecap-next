import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";
import { getUserFromApiRoute, getUserIdFromApiRoute } from "@/lib/auth-guard";
import { sanitizeHtml } from "@/lib/sanitize";
import { canAccessChapter } from "@/lib/access";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const course = await Course.findOne({ slug }).exec();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(
      200,
      parseInt(url.searchParams.get("limit") || "100", 10)
    );
    const skip = (page - 1) * limit;

    const userId = await getUserIdFromApiRoute();

    const [items, total] = await Promise.all([
      Chapter.find({ courseId: course._id })
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Chapter.countDocuments({ courseId: course._id }).exec(),
    ]);

    const data = await Promise.all(
      items.map(async (ch) => {
        const hasAccess = await canAccessChapter(
          userId,
          (ch._id as Types.ObjectId).toString()
        );
        return {
          id: (ch._id as Types.ObjectId).toString(),
          title: ch.title,
          slug: ch.slug,
          order: ch.order,
          public: ch.public,
          excerpt: ch.excerpt,
          content:
            hasAccess && ch.contentHtml ? sanitizeHtml(ch.contentHtml) : null,
        };
      })
    );

    return NextResponse.json({ items: data, meta: { page, limit, total } });
  } catch (err: any) {
    console.error("GET /api/courses/[slug]/chapters error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await Course.findOne({ slug }).exec();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const body = await req.json();
    if (!body.title || !body.slug)
      return NextResponse.json(
        { error: "title and slug required" },
        { status: 400 }
      );

    const contentHtml = sanitizeHtml(body.contentHtml ?? "");

    const chapter = await Chapter.create({
      courseId: course._id,
      title: body.title,
      slug: body.slug,
      order: body.order ?? 0,
      public: !!body.public,
      excerpt: body.excerpt ?? "",
      contentHtml,
      assets: body.assets ?? [],
    });

    return NextResponse.json(
      { id: (chapter._id as Types.ObjectId).toString() },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/courses/[slug]/chapters error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
