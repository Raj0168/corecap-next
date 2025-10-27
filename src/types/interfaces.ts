import { Types } from "mongoose";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface CoursePopulated {
  _id: Types.ObjectId | string;
  title: string;
  slug: string; 
}

export interface ChapterPopulated {
  _id: Types.ObjectId | string;
  title: string;
  slug: string; 
  courseId: CoursePopulated;
}

export interface UserPopulated {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
  provider: "credentials" | "google" | "github";
  purchasedCourses?: CoursePopulated[];
  purchasedChapters?: ChapterPopulated[];
  progress?: any[];
  bookmarks?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
  public: boolean;
  excerpt: string;
  contentHtml: string;
}

export type CartItem = {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
  addedAt?: string;
};
