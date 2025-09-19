import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/db";
import Chapter, { IChapter } from "@/models/Chapter";
import { getUserFromApiRoute, getUserIdFromApiRoute } from "@/lib/auth-guard";
import { sanitizeHtml } from "@/lib/sanitize";
import { canAccessChapter } from "@/lib/access";
import { Types } from "mongoose";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await context.params;
    const userId = await getUserIdFromApiRoute();

    const chapter = await Chapter.findOne({ slug }).lean<IChapter>().exec();
    if (!chapter)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const hasAccess = await canAccessChapter(
      userId,
      (chapter._id as Types.ObjectId).toString()
    );

    return NextResponse.json({
      id: (chapter._id as Types.ObjectId).toString(),
      title: chapter.title,
      slug: chapter.slug,
      order: chapter.order,
      public: chapter.public,
      excerpt: chapter.excerpt,
      content:
        hasAccess && chapter.contentHtml
          ? sanitizeHtml(chapter.contentHtml)
          : null,
    });
  } catch (err: any) {
    console.error("GET /api/chapters/[slug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
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
    const updated = await Chapter.findOneAndUpdate({ slug }, body, {
      new: true,
    })
      .lean<IChapter>()
      .exec();
    if (!updated)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    return NextResponse.json({
      id: (updated._id as Types.ObjectId).toString(),
    });
  } catch (err: any) {
    console.error("PATCH /api/chapters/[slug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
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

    const deleted = await Chapter.findOneAndDelete({ slug })
      .lean<IChapter>()
      .exec();
    if (!deleted)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/chapters/[slug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
