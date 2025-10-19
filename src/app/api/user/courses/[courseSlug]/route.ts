// src/app/api/user/courses/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";

export async function GET(
  req: NextRequest,
  context: { params: { slug: string } }
) {
  await connectDB();

  const course = await Course.findOne({ slug: context.params.slug })
    .lean<ICourse>()
    .exec();
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json({
    id: course._id.toString(),
    title: course.title,
    slug: course.slug,
    description: course.description,
    price: course.price,
    chapterPrice: course.chapterPrice,
    thumbnailUrl: course.thumbnailUrl,
    pages: course.pages,
    author: course.author,
    schoolGrade: course.schoolGrade,
    subject: course.subject,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  });
}
