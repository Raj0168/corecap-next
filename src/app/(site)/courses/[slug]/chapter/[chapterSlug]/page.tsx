"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import PdfViewer from "@/app/(site)/components/ui/PdfViewer";
import { Button } from "@/app/(site)/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

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
  const { slug, chapterSlug } = useParams() as {
    slug: string;
    chapterSlug: string;
  };
  const router = useRouter();

  const {
    data: chapter,
    isLoading,
    isError,
    error,
  } = useQuery<ChapterResp, Error>({
    queryKey: ["chapter", slug, chapterSlug],
    queryFn: async () => {
      const res = await api.get<ChapterResp>(
        `/courses/${encodeURIComponent(slug)}/chapters/${encodeURIComponent(
          chapterSlug
        )}`
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  if (isLoading) return <div className="p-6">Loading chapter…</div>;
  if (isError || !chapter)
    return (
      <div className="p-6 text-red-600">
        {(error as any)?.message ?? "Chapter not found"}
      </div>
    );

  const fileObjName = chapter.hasAccess
    ? chapter.pdfPath
    : chapter.previewPdfPath;
  if (!fileObjName)
    return <div className="p-6">No PDF available for this chapter.</div>;

  const viewerFilename = chapter.signedUrl ? chapter.signedUrl : fileObjName;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>

      <PdfViewer filename={viewerFilename} className="min-h-[60vh]" />

      <div className="mt-4 flex gap-2">
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
