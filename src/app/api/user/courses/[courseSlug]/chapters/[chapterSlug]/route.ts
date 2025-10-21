import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { getSignedUrl } from "@/lib/gcp";

export async function GET(
  req: NextRequest,
  context: { params: { courseSlug: string; chapterSlug: string } }
) {
  await connectDB();
  const { courseSlug, chapterSlug } = context.params;

  const course = await Course.findOne({ slug: courseSlug })
    .lean<ICourse>()
    .exec();
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapter = await Chapter.findOne({
    courseId: course._id,
    slug: chapterSlug,
  })
    .lean<IChapter>()
    .exec();
  if (!chapter)
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

  const user = await getUserFromApiRoute();
  const purchasedCourses =
    user?.purchasedCourses?.map((id) => id.toString()) ?? [];
  const purchasedChapters =
    user?.purchasedChapters?.map((id) => id.toString()) ?? [];

  const hasAccess =
    purchasedCourses.includes(course._id.toString()) ||
    purchasedChapters.includes(chapter._id.toString());

  return NextResponse.json({
    id: chapter._id.toString(),
    title: chapter.title,
    slug: chapter.slug,
    order: chapter.order,
    excerpt: chapter.excerpt,
    pages: chapter.pages,
    hasAccess, // <-- add this
    pdfPath: hasAccess ? chapter.pdfPath : null, // normalized for frontend
    previewPdfPath:
      !hasAccess && chapter.previewPdfPath ? chapter.previewPdfPath : null, // normalized
    pdfUrl:
      hasAccess && chapter.pdfPath
        ? await getSignedUrl(chapter.pdfPath, 60)
        : null,
    previewPdfUrl:
      !hasAccess && chapter.previewPdfPath
        ? await getSignedUrl(chapter.previewPdfPath, 60)
        : null,
  });
}
