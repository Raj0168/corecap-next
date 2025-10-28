import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import User, { IUser } from "@/models/User";
import { getUserFromApiRoute } from "@/lib/auth-guard";
import { addUserWatermark } from "@/lib/pdf-watermark";
import { bucket } from "@/lib/gcsClient";

function normalizeGcsPath(path: string | undefined) {
  if (!path) return "";
  return path.replace(/^gs:\/\/[^/]+\//, "");
}

function idEquals(objId: unknown, idStr: string) {
  try {
    if (!objId) return false;
    return (objId as any).toString() === idStr;
  } catch {
    return false;
  }
}

// NOTE: Using 'any' for the context to bypass a persistent internal Next.js type generation error.
export async function GET(req: NextRequest, { params }: any) {
  try {
    await connectDB();

    const course = (await Course.findOne({ slug: params.courseSlug })
      .lean()
      .exec()) as ICourse | null;
    if (!course)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

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
      (Array.isArray(user.purchasedCourses) &&
        user.purchasedCourses.some((pc: any) =>
          idEquals(pc, course._id.toString())
        ));

    if (!hasAccess)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const normalizedPath = normalizeGcsPath(course.fullCoursePdfPath);
    console.log("📘 Normalized GCS file path:", normalizedPath);

    const file = bucket.file(normalizedPath);
    const [exists] = await file.exists();

    if (!exists) throw new Error("Course PDF not found in GCS");

    const [buffer] = await file.download();
    const stamped = await addUserWatermark(
      buffer,
      user.name,
      user._id.toString()
    );

    return new NextResponse(stamped as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${course.slug}-course.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("GET /api/courses/[courseSlug]/download error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
