// src/lib/access.ts
import Purchase from "@/models/Purchase";
import Chapter, { IChapter } from "@/models/Chapter";
import Course, { ICourse } from "@/models/Course";
import mongoose from "mongoose";

/**
 * Returns true if userId has access to the course
 */
export async function canAccessCourse(
  userId: string | null,
  courseId: string
): Promise<boolean> {
  const course = await Course.findById(courseId).lean<ICourse>().exec();
  if (!course) return false;
  if (!userId) return false;

  const oid = new mongoose.Types.ObjectId(userId);

  const exists = await Purchase.exists({
    userId: oid,
    courseId: course._id,
    status: "paid",
  });
  return !!exists;
}
