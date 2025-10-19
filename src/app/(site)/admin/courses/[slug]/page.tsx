// src/app/admin/courses/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl: string;
  fullCoursePdfPath: string;
  pages: number;
  author: string;
  grade: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
};

type Chapter = {
  id: string;
  title: string;
  slug: string;
  order: number;
  excerpt: string;
  pages: number;
  pdfUrl: string | null;
  previewPdfUrl?: string | null;
};

export default function AdminCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params as { slug: string };

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [courseRes, chaptersRes] = await Promise.all([
          fetch(`/api/courses/${slug}`),
          fetch(`/api/courses/${slug}/chapters`),
        ]);

        if (!courseRes.ok) throw new Error("Failed to load course");
        if (!chaptersRes.ok) throw new Error("Failed to load chapters");

        const courseData = await courseRes.json();
        const chaptersData = await chaptersRes.json();

        setCourse(courseData);
        setChapters(chaptersData.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  async function handleDeleteChapter(chapterSlug: string) {
    if (!confirm("Are you sure you want to delete this chapter?")) return;

    const res = await fetch(`/api/chapters/${chapterSlug}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setChapters((chs) => chs.filter((ch) => ch.slug !== chapterSlug));
    } else {
      alert("Failed to delete chapter");
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (!course) return <p className="p-4">Course not found</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Course Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
          <p className="text-sm text-gray-500">
            Subject: {course.subject} | Grade: {course.grade}
          </p>
          <p className="text-sm text-gray-500">
            Author: {course.author} | Pages: {course.pages}
          </p>
          <p className="mt-2 font-semibold">
            Price: ₹{course.price} | Chapter Price: ₹{course.chapterPrice}
          </p>
        </div>
        <div className="space-x-2">
          <Link
            href={`/admin/courses/${course.slug}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Edit Course
          </Link>
          <Link
            href={`/admin/courses/${course.slug}/chapters/new`}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Add Chapter
          </Link>
        </div>
      </div>

      {/* Chapters List */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Chapters</h2>
        {chapters.length === 0 ? (
          <p className="text-gray-500">No chapters added yet.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Excerpt</th>
                <th className="p-2 border">Pages</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch) => (
                <tr key={ch.id} className="border-t">
                  <td className="p-2 border">{ch.order}</td>
                  <td className="p-2 border">{ch.title}</td>
                  <td className="p-2 border">{ch.excerpt}</td>
                  <td className="p-2 border">{ch.pages}</td>
                  <td className="p-2 border space-x-2">
                    <Link
                      href={`/admin/courses/${course.slug}/chapters/${ch.slug}/edit`}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteChapter(ch.slug)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
