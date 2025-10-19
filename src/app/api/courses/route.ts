import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import { getUserFromApiRoute } from "@/lib/auth-guard";

type CourseCreateBody = {
  title: string;
  slug: string;
  description?: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl: string;
  fullCoursePdfPath: string;
  author: string;
  pages: number;
  schoolGrade: "10" | "11" | "12";
  subject: string;
};

export async function GET(req: NextRequest) {
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
        .lean<ICourse[]>(),
      Course.countDocuments(),
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
        fullCoursePdfPath: c.fullCoursePdfPath,
        author: c.author,
        pages: c.pages,
        schoolGrade: c.schoolGrade,
        subject: c.subject,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user?.role || user.role !== "admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as CourseCreateBody;

    const required = [
      "title",
      "slug",
      "price",
      "chapterPrice",
      "fullCoursePdfPath",
      "thumbnailUrl",
      "pages",
      "author",
      "schoolGrade",
      "subject",
    ];
    for (const f of required) {
      if ((body as any)[f] === undefined || (body as any)[f] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${f}` },
          { status: 400 }
        );
      }
    }

    const existing = await Course.findOne({ slug: body.slug }).lean();
    if (existing)
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );

    const created = await Course.create(body);
    return NextResponse.json({ id: created._id.toString() }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/courses error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
