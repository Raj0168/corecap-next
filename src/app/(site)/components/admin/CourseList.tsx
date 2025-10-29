"use client";

import React from "react";
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

export default function CourseList({ courses }: { courses: CourseItem[] }) {
  const router = useRouter();

  async function handleDelete(slug: string) {
    if (!confirm("Delete this course and all its chapters?")) return;
    try {
      const res = await fetch(`/api/courses/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        alert("Delete error: " + (err.error ?? "unknown"));
        return;
      }
      // refresh page
      router.refresh();
    } catch (err) {
      alert("Delete failed: " + String(err));
    }
  }

  return (
    <div className="grid gap-4">
      {courses.length === 0 && (
        <div className="p-6 bg-white rounded shadow">No courses found.</div>
      )}
      {courses.map((c) => (
        <div key={c.id} className="p-4 bg-white rounded shadow flex gap-4">
          <img
            loading="lazy"
            src={c.thumbnailUrl}
            alt={c.title}
            className="w-28 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <div className="text-sm text-gray-600">{c.slug}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/courses/${c.slug}`)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  View
                </button>
                <button
                  onClick={() => router.push(`/admin/courses/${c.slug}/edit`)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.slug)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {c.description}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {c.author} • {c.pages} pages • Grade {c.schoolGrade} • ₹{c.price}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
