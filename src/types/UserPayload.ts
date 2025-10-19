import mongoose from "mongoose";

export interface TokenPayload {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: "admin" | "student";
  purchasedCourses: mongoose.Types.ObjectId[];
  purchasedChapters: mongoose.Types.ObjectId[];
}
