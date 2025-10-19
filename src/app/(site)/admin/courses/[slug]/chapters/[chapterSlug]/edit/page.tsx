"use client";

import React, { useEffect, useState } from "react";
import ChapterForm from "@/app/(site)/components/admin/ChapterForm";
import { useRouter, useParams } from "next/navigation";

interface ChapterData {
  title: string;
  slug: string;
  order: number;
  excerpt: string;
  pdfPath: string;
  previewPdfPath?: string;
  pages: number;
}

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const { slug: courseSlug, chapterSlug } = params as {
    slug: string;
    chapterSlug: string;
  };

  const [initialData, setInitialData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChapter() {
      try {
        const res = await fetch(
          `/api/chapters/${encodeURIComponent(chapterSlug)}`
        );
        if (!res.ok) throw new Error("Chapter not found");
        const chapter = await res.json();

        setInitialData({
          title: chapter.title,
          slug: chapter.slug,
          order: chapter.order,
          excerpt: chapter.excerpt ?? "",
          pdfPath: chapter.pdfUrl ?? "",
          previewPdfPath: chapter.previewPdfUrl ?? "",
          pages: chapter.pages ?? 1,
        });
      } catch (err: any) {
        console.error(err);
        setError("Failed to load chapter");
      } finally {
        setLoading(false);
      }
    }

    loadChapter();
  }, [chapterSlug]);

  if (loading) return <div className="p-6">Loading chapter...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!initialData) return null;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">
        Edit Chapter: {initialData.title}
      </h1>
      <ChapterForm
        mode="edit"
        initial={initialData}
        slug={chapterSlug}
        onSuccess={() => {
          router.push(`/admin/courses/${courseSlug}`);
        }}
      />
    </div>
  );
}
