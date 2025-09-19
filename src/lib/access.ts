// src/lib/access.ts
import Purchase from "@/models/Purchase";
import Chapter, { IChapter } from "@/models/Chapter";
import Course, { ICourse } from "@/models/Course";
import mongoose from "mongoose";

/**
 * Returns true if userId has access to chapterId
 */
export async function canAccessChapter(
  userId: string | null,
  chapterId: string
): Promise<boolean> {
  const chapter = await Chapter.findById(chapterId).lean<IChapter>().exec();
  if (!chapter) return false;

  if (chapter.public) return true;
  if (!userId) return false;

  const oid = new mongoose.Types.ObjectId(userId);

  const hasChapter = await Purchase.exists({
    userId: oid,
    chapterId: chapter._id,
    status: "paid",
  });
  if (hasChapter) return true;

  const hasCourse = await Purchase.exists({
    userId: oid,
    courseId: chapter.courseId,
    status: "paid",
  });
  return !!hasCourse;
}

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
