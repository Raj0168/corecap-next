"use client";

import React from "react";
import CourseForm from "@/app/(site)/components/admin/CourseForm";
import { useRouter } from "next/navigation";

export default function NewCoursePage() {
  const router = useRouter();

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Create Course</h1>
      <CourseForm
        mode="create"
        onSuccess={(id: any) => {
          // navigate to course detail admin view
          router.push(`/admin/courses/${id}`);
        }}
      />
    </div>
  );
}
