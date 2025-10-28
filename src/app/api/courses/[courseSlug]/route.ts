import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course, { ICourse } from "@/models/Course";
import User, { IUser } from "@/models/User";
import { getUserFromApiRoute } from "@/lib/auth-guard";

async function getUserSafe() {
  try {
    return await getUserFromApiRoute();
  } catch {
    return null;
  }
}

// -------------------- [GET] --------------------
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ courseSlug: string }> } // 👈 async params
) {
  try {
    const { courseSlug } = await context.params; // 👈 await required
    await connectDB();

    const course = await Course.findOne({ slug: courseSlug }).lean<ICourse>();
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const tokenPayload = await getUserSafe();

    const dbUser: IUser | null = tokenPayload
      ? await User.findById(tokenPayload.id).lean<IUser>().exec()
      : null;

    const userPurchasedCourses = new Set(
      dbUser?.purchasedCourses?.map((id) => id.toString()) || []
    );
    const hasAccess = userPurchasedCourses.has(course._id.toString());

    return NextResponse.json({ ...course, hasAccess });
  } catch (err: any) {
    console.error("GET /api/courses/[courseSlug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

// -------------------- [PATCH] --------------------
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const { courseSlug } = await context.params; // 👈 await required
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user?.role || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await req.json();

    const updated = await Course.findOneAndUpdate(
      { slug: courseSlug },
      updates,
      { new: true }
    ).lean<ICourse>();

    if (!updated) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/courses/[courseSlug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}

// -------------------- [DELETE] --------------------
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ courseSlug: string }> }
) {
  try {
    const { courseSlug } = await context.params; // 👈 await required
    await connectDB();

    const user = await getUserFromApiRoute();
    if (!user?.role || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await Course.findOneAndDelete({ slug: courseSlug });
    if (!deleted) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/courses/[courseSlug] error:", err);
    return NextResponse.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}
