// src/app/api/user/courses/[slug]/chapters/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { getSignedUrl } from "@/lib/gcp";

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  await connectDB();
  const { slug } = context.params;

  const course = await Course.findOne({ slug }).lean<ICourse>().exec();
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const chapters = await Chapter.find({ courseId: course._id })
    .sort({ order: 1 })
    .lean<IChapter[]>()
    .exec();

  const user = await getUserFromApiRoute();
  const purchasedCourses =
    user?.purchasedCourses?.map((id) => id.toString()) ?? [];
  const purchasedChapters =
    user?.purchasedChapters?.map((id) => id.toString()) ?? [];

  const data = await Promise.all(
    chapters.map(async (ch) => {
      const hasAccess =
        purchasedCourses.includes(course._id.toString()) ||
        purchasedChapters.includes(ch._id.toString());

      return {
        id: ch._id.toString(),
        title: ch.title,
        slug: ch.slug,
        order: ch.order,
        excerpt: ch.excerpt,
        pages: ch.pages,
        pdfUrl: hasAccess ? await getSignedUrl(ch.pdfPath, 60) : null,
        previewPdfUrl:
          !hasAccess && ch.previewPdfPath
            ? await getSignedUrl(ch.previewPdfPath, 60)
            : null,
      };
    })
  );

  return NextResponse.json({ items: data, meta: { total: data.length } });
}
