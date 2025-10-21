// courses/[courseSlug]/chapters
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import User, { IUser } from "@/models/User";
import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET(
  _req: NextRequest,
  { params }: { params: { courseSlug: string } }
) {
  try {
    await connectDB();

    const course = await Course.findOne({ slug: params.courseSlug })
      .lean<ICourse>()
      .exec();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const chapters = await Chapter.find({ courseId: course._id })
      .sort({ order: 1 })
      .lean<IChapter[]>()
      .exec();

    // get user
    const tokenPayload = await getUserFromApiRoute();
    const dbUser: IUser | null = tokenPayload
      ? await User.findById(tokenPayload.id).lean<IUser>().exec()
      : null;

    const userPurchasedChapters = new Set(
      dbUser?.purchasedChapters?.map((id) => id.toString()) || []
    );
    const userPurchasedCourses = new Set(
      dbUser?.purchasedCourses?.map((id) => id.toString()) || []
    );
    const hasCourseAccess = userPurchasedCourses.has(course._id.toString());

    const items = chapters.map((ch) => ({
      id: String(ch._id),
      title: ch.title,
      slug: ch.slug,
      order: ch.order,
      excerpt: ch.excerpt,
      pdfPath: ch.pdfPath,
      previewPdfPath: ch.previewPdfPath ?? null,
      pages: ch.pages,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
      hasAccess:
        hasCourseAccess || userPurchasedChapters.has(ch._id.toString()),
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("GET chapters error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { courseSlug: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (user?.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const course = await Course.findOne({ slug: params.courseSlug })
      .lean<ICourse>()
      .exec();
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const body = await req.json();
    const required = ["title", "slug", "order", "pdfPath", "pages"];
    for (const f of required) {
      if (!body[f])
        return NextResponse.json(
          { error: `Missing required field: ${f}` },
          { status: 400 }
        );
    }

    const existing = await Chapter.findOne({
      courseId: course._id,
      slug: body.slug,
    })
      .lean()
      .exec();

    if (existing)
      return NextResponse.json(
        { error: "Chapter slug already exists in this course" },
        { status: 409 }
      );

    const created = await Chapter.create({
      courseId: course._id,
      title: body.title,
      slug: body.slug,
      order: body.order,
      excerpt: body.excerpt ?? "",
      pdfPath: body.pdfPath,
      previewPdfPath: body.previewPdfPath ?? null,
      pages: body.pages,
    });

    return NextResponse.json({ id: String(created._id) }, { status: 201 });
  } catch (err: any) {
    console.error("POST chapters error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
