import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Chapter, { IChapter } from "@/models/Chapter";
import Course, { ICourse } from "@/models/Course";
import User, { IUser } from "@/models/User";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { getSignedUrl } from "@/lib/gcp";
import { addUserWatermark } from "@/lib/pdf-watermark";

/** Safe id compare helper */
function idEquals(objId: unknown, idStr: string) {
  try {
    if (!objId) return false;
    const s = (objId as any).toString();
    return s === idStr;
  } catch {
    return false;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const chapter = (await Chapter.findOne({ slug: params.slug })
      .lean()
      .exec()) as unknown as IChapter | null;
    if (!chapter)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const course = (await Course.findById(chapter.courseId)
      .lean()
      .exec()) as unknown as ICourse | null;
    if (!course)
      return NextResponse.json(
        { error: "Parent course not found" },
        { status: 404 }
      );

    const tokenPayload = await getUserFromApiRoute();
    if (!tokenPayload || !tokenPayload.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = (await User.findById(tokenPayload.id)
      .lean()
      .exec()) as unknown as IUser | null;
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

    const signedUrl = await getSignedUrl(chapter.pdfPath, 120);
    const fetched = await fetch(signedUrl);
    if (!fetched.ok) throw new Error("Failed to fetch chapter PDF from GCS");

    const arrayBuffer = await fetched.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stamped = await addUserWatermark(
      buffer,
      user.name,
      user._id.toString()
    );
    const body = stamped as unknown as BodyInit;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${chapter.slug}-chapter.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/chapters/[slug]/download error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
