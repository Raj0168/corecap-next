import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute, getUserIdFromApiRoute } from "@/lib/auth-guard";
import { canAccessChapter } from "@/lib/access";
import { sanitizeHtml } from "@/lib/sanitize";
import { Types } from "mongoose";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const userId = await getUserIdFromApiRoute();

    const course = await Course.findOne({ slug }).lean<ICourse>().exec();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const chapters = await Chapter.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean<IChapter[]>()
      .exec();

    const chaptersForClient = await Promise.all(
      chapters.map(async (ch) => {
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

    return NextResponse.json({
      course: {
        id: (course._id as Types.ObjectId).toString(),
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        chapterPrice: course.chapterPrice,
        thumbnailUrl: course.thumbnailUrl,
      },
      chapters: chaptersForClient,
    });
  } catch (err: any) {
    console.error("GET /api/courses/[slug] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const updated = await Course.findOneAndUpdate({ slug }, body, {
      new: true,
    })
      .lean<ICourse>()
      .exec();
    if (!updated)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json({
      id: (updated._id as Types.ObjectId).toString(),
    });
  } catch (err: any) {
    console.error("PATCH /api/courses/[slug] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await Course.findOneAndDelete({ slug })
      .lean<ICourse>()
      .exec();
    if (course) {
      await Chapter.deleteMany({ courseId: course._id }).exec();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/courses/[slug] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
