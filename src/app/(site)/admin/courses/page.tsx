// client page for listing courses + create button
"use client";

import React, { useEffect, useState } from "react";
import CourseList from "../../components/admin/CourseList";
import { useRouter } from "next/navigation";

type CourseItem = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl?: string;
  author?: string;
  pages?: number;
  schoolGrade?: string;
  subject?: string;
  createdAt?: string;
};

export default function AdminCoursesPage() {
  const [items, setItems] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/courses?page=1&limit=50", {
      method: "GET",
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setItems(data.items ?? []);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Courses</h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/courses/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Course
          </button>
        </div>
      </div>

      {loading && <div>Loading courses...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && <CourseList courses={items} />}
    </div>
  );
}
