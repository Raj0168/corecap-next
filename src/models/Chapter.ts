import mongoose, { Schema, Document, models, Types } from "mongoose";

export interface IChapter extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  slug: string;
  order: number;
  excerpt: string;
  pdfPath: string;
  previewPdfPath?: string | null;
  pages: number;
  theoryPages?: number; // NEW
  questions?: number; // NEW
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true },
    excerpt: { type: String, required: true },
    pdfPath: { type: String, required: true },
    previewPdfPath: { type: String, default: null },
    pages: { type: Number, required: true },
    theoryPages: { type: Number, default: 0 }, // NEW
    questions: { type: Number, default: 0 }, // NEW
  },
  { timestamps: true }
);

export const Chapter =
  models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);
export default Chapter;
