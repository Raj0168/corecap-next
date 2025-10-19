import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl: string;
  fullCoursePdfPath: string; // GCS object path
  pages: number;
  author: string;
  schoolGrade: "10" | "11" | "12";
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    chapterPrice: { type: Number, required: true },
    thumbnailUrl: { type: String, required: true },
    fullCoursePdfPath: { type: String, required: true },
    pages: { type: Number, required: true },
    author: { type: String, required: true },
    schoolGrade: { type: String, enum: ["10", "11", "12"], required: true },
    subject: { type: String, required: true },
  },
  { timestamps: true }
);

export const Course =
  models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
