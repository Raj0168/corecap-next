import { NextResponse } from "next/server";
import connectDB from "@/lib/db";

// Import the **default exports** to ensure model is registered
import User from "@/models/User";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";

import { getUserFromApiRoute } from "@/lib/auth-guard";

export async function GET() {
  await connectDB();

  const payload = await getUserFromApiRoute();
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findById(payload.id)
    .select("-password")
    .populate({
      path: "purchasedCourses",
      model: Course,
      select: "title slug",
    })
    .populate({
      path: "purchasedChapters",
      model: Chapter,
      select: "title slug courseId",
      populate: { path: "courseId", model: Course, select: "title slug" },
    });

  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ ok: true, user }, { status: 200 });
}
