import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chapter, { IChapter } from "@/models/Chapter";
import Course, { ICourse } from "@/models/Course";
import User, { IUser } from "@/models/User";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { addUserWatermark } from "@/lib/pdf-watermark";
import { bucket } from "@/lib/gcsClient";

/** Safe id compare helper */
function idEquals(objId: unknown, idStr: string) {
  try {
    if (!objId) return false;
    return (objId as any).toString() === idStr;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { courseSlug: string; chapterSlug: string } }
) {
  try {
    await connectDB();

    const course = (await Course.findOne({ slug: params.courseSlug })
      .lean()
      .exec()) as ICourse | null;
    if (!course)
      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const chapter = (await Chapter.findOne({
      slug: params.chapterSlug,
      courseId: course._id,
    })
      .lean()
      .exec()) as IChapter | null;
    if (!chapter)
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });

    const tokenPayload = await getUserFromApiRoute();
    if (!tokenPayload?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = (await User.findById(tokenPayload.id)
      .lean()
      .exec()) as IUser | null;
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hasAccess =
      user.role === "admin" ||
      (Array.isArray(user.purchasedChapters) &&
        user.purchasedChapters.some((pc: any) =>
          idEquals(pc, chapter._id.toString())
        )) ||
      (Array.isArray(user.purchasedCourses) &&
        user.purchasedCourses.some((pc: any) =>
          idEquals(pc, course._id.toString())
        ));

    if (!hasAccess)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const file = bucket.file(chapter.pdfPath!);
    const [exists] = await file.exists();
    if (!exists) throw new Error("Chapter PDF not found in GCS");

    const [buffer] = await file.download();
    const stamped = await addUserWatermark(
      buffer,
      user.name,
      user._id.toString()
    );

    return new NextResponse(stamped as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${chapter.slug}-chapter.pdf"`,
      },
    });
  } catch (err: any) {
    console.error(
      "GET /api/courses/[courseSlug]/chapters/[chapterSlug]/download error:",
      err
    );
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
