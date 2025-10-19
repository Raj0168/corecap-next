import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: { courseSlug: string; chapterSlug: string } }
) {
  try {
    await connectDB();

    const course = await Course.findOne({
      slug: params.courseSlug,
    }).lean<ICourse>();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const chapter = await Chapter.findOne({
      courseId: course._id,
      slug: params.chapterSlug,
    }).lean<IChapter>();

    if (!chapter)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    return NextResponse.json({
      id: String(chapter._id),
      title: chapter.title,
      slug: chapter.slug,
      order: chapter.order,
      excerpt: chapter.excerpt,
      pdfPath: chapter.pdfPath,
      previewPdfPath: chapter.previewPdfPath,
      pages: chapter.pages,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    });
  } catch (err: any) {
    console.error("GET chapter error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { courseSlug: string; chapterSlug: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (user?.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await Course.findOne({
      slug: params.courseSlug,
    }).lean<ICourse>();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const body = await req.json();

    const updated = await Chapter.findOneAndUpdate(
      { courseId: course._id, slug: params.chapterSlug },
      {
        $set: {
          title: body.title,
          slug: body.slug,
          order: body.order,
          excerpt: body.excerpt ?? "",
          pdfPath: body.pdfPath,
          previewPdfPath: body.previewPdfPath ?? null,
          pages: body.pages,
        },
      },
      { new: true }
    ).lean<IChapter>();

    if (!updated)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    return NextResponse.json({
      id: String(updated._id),
      ...updated,
    });
  } catch (err: any) {
    console.error("PUT chapter error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseSlug: string; chapterSlug: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (user?.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await Course.findOne({
      slug: params.courseSlug,
    }).lean<ICourse>();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const deleted = await Chapter.findOneAndDelete({
      courseId: course._id,
      slug: params.chapterSlug,
    }).lean<IChapter>();

    if (!deleted)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    return NextResponse.json({ id: String(deleted._id) });
  } catch (err: any) {
    console.error("DELETE chapter error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
