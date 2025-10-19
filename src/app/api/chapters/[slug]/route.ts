import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const ch = await Chapter.findOne({ slug: params.slug })
      .lean<IChapter>()
      .exec();
    if (!ch) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: ch._id.toString(),
      courseId: ch.courseId.toString(),
      title: ch.title,
      slug: ch.slug,
      order: ch.order,
      excerpt: ch.excerpt,
      pdfPath: ch.pdfPath,
      previewPdfPath: ch.previewPdfPath ?? null,
      pages: ch.pages,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    });
  } catch (err: any) {
    console.error("GET /api/chapters/[slug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await Chapter.findOneAndUpdate(
      { slug: params.slug },
      body,
      { new: true }
    )
      .lean<IChapter>()
      .exec();

    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: updated._id.toString() });
  } catch (err: any) {
    console.error("PUT /api/chapters/[slug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromApiRoute();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await Chapter.findOneAndDelete({ slug: params.slug })
      .lean<IChapter>()
      .exec();
    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ id: deleted._id.toString() });
  } catch (err: any) {
    console.error("DELETE /api/chapters/[slug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
