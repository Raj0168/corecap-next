// courses/[courseSlug]/chapters/[chapterSlug]
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import User, { IUser } from "@/models/User";

// GET single chapter
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

    const tokenPayload = await getUserFromApiRoute();
    const dbUser = tokenPayload?.id
      ? await User.findById(tokenPayload.id).lean<IUser>().exec()
      : null;

    const userPurchasedChapters = new Set(
      dbUser?.purchasedChapters?.map((id) => id.toString()) || []
    );
    const userPurchasedCourses = new Set(
      dbUser?.purchasedCourses?.map((id) => id.toString()) || []
    );
    const hasAccess =
      userPurchasedCourses.has(course._id.toString()) ||
      userPurchasedChapters.has(chapter._id.toString());

    return NextResponse.json({
      id: String(chapter._id),
      title: chapter.title,
      slug: chapter.slug,
      order: chapter.order,
      excerpt: chapter.excerpt,
      pages: chapter.pages,
      theoryPages: chapter.theoryPages ?? 0, // NEW
      questions: chapter.questions ?? 0, // NEW
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      hasAccess,
      pdfPath: hasAccess ? chapter.pdfPath : null,
      previewPdfPath:
        !hasAccess && chapter.previewPdfPath ? chapter.previewPdfPath : null,
    });
  } catch (err: any) {
    console.error("GET chapter error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

// PUT update chapter
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
          theoryPages: body.theoryPages ?? 0, // NEW
          questions: body.questions ?? 0, // NEW
        },
      },
      { new: true }
    ).lean<IChapter>();

    if (!updated)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    return NextResponse.json({ id: String(updated._id), ...updated });
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
