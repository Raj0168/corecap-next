// src/app/api/user/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";

export async function GET(req: NextRequest) {
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

  const data = items.map((c) => ({
    id: c._id.toString(),
    title: c.title,
    slug: c.slug,
    description: c.description,
    price: c.price,
    chapterPrice: c.chapterPrice,
    thumbnailUrl: c.thumbnailUrl,
    pages: c.pages,
    author: c.author,
    schoolGrade: c.schoolGrade,
    subject: c.subject,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return NextResponse.json({ items: data, meta: { page, limit, total } });
}
