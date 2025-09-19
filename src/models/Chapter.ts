import mongoose, { Schema, Document, models } from "mongoose";

export interface IChapter extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  order: number;
  public: boolean;
  excerpt?: string;
  contentHtml?: string;
  assets: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
    public: { type: Boolean, default: false },
    excerpt: { type: String },
    contentHtml: { type: String },
    assets: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Chapter =
  models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);
export default Chapter;
