"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PdfViewer from "@/app/(site)/components/ui/PdfViewer";
import { Button } from "@/app/(site)/components/ui/button";

interface ChapterResp {
  id: string;
  title: string;
  slug: string;
  pdfPath?: string | null;
  previewPdfPath?: string | null;
  hasAccess?: boolean;
  signedUrl?: string | null;
}

export default function ChapterViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { slug, chapterSlug } = params as { slug: string; chapterSlug: string };

  const [chapter, setChapter] = useState<ChapterResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchChapter = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/courses/${encodeURIComponent(
            slug
          )}/chapters/${encodeURIComponent(chapterSlug)}`,
          { cache: "no-store", credentials: "include" }
        );
        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(
            `Failed to load chapter (${res.status}) ${text ?? ""}`
          );
        }
        const data = await res.json();
        if (!cancelled) setChapter(data);
      } catch (err: any) {
        console.error("fetchChapter err:", err);
        if (!cancelled) setError(err.message ?? "Failed to load chapter");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchChapter();
    return () => {
      cancelled = true;
    };
  }, [slug, chapterSlug]);

  if (loading) return <div className="p-6">Loading chapter…</div>;
  if (error || !chapter)
    return (
      <div className="p-6 text-red-600">{error ?? "Chapter not found"}</div>
    );

  // Determine which PDF to show
  const fileObjName = chapter.hasAccess
    ? chapter.pdfPath // full access
    : chapter.previewPdfPath; // fallback to preview

  if (!fileObjName)
    return <div className="p-6">No PDF available for this chapter.</div>;

  const viewerFilename = chapter.signedUrl ? chapter.signedUrl : fileObjName;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>

      <PdfViewer filename={viewerFilename} className="min-h-[60vh]" />

      <div className="mt-4 flex gap-2">
        {/* Only allow download if user has access */}
        {chapter.hasAccess && chapter.pdfPath && (
          <Button
            variant="outline"
            onClick={() => {
              const url = chapter.signedUrl
                ? chapter.signedUrl
                : `/api/pdf?filename=${encodeURIComponent(chapter.pdfPath!)}`;
              window.open(url, "_blank");
            }}
          >
            Download PDF
          </Button>
        )}
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
    </div>
  );
}
