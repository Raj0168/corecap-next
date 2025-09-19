import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string | null;
  role: "user" | "admin";
  isEmailVerified: boolean;
  provider: "credentials" | "google" | "github";
  purchasedCourses?: mongoose.Types.ObjectId[];
  purchasedChapters?: mongoose.Types.ObjectId[];
  progress?: {
    chapterId: mongoose.Types.ObjectId;
    completed: boolean;
    updatedAt: Date;
  }[];
  bookmarks?: {
    chapterId: mongoose.Types.ObjectId;
    note?: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isEmailVerified: { type: Boolean, default: false },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    purchasedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    purchasedChapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    progress: [
      {
        chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
        completed: { type: Boolean, default: false },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    bookmarks: [
      {
        chapterId: { type: Schema.Types.ObjectId, ref: "Chapter" },
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
