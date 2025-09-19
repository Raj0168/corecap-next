import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    chapterPrice: { type: Number, default: 0 },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

export const Course =
  models.Course || mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
