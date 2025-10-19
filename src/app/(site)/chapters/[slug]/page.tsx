// src/app/chapters/[slug]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "../../components/ui/button";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Chapter {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  pages: number;
  pdfUrl: string | null;
  previewPdfUrl?: string;
}

export default function ChapterPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/chapters/${slug}`);
        const ch = await res.json();

        // If purchased, try to load secure chapter list to get pdfUrl
        const chaptersRes = await fetch(`/api/courses/${ch.courseId}/chapters`);
        const chaptersData = await chaptersRes.json();
        const fullData = chaptersData.items.find((c: any) => c.slug === slug);

        setChapter({ ...ch, ...fullData });
        setFileUrl(fullData?.pdfUrl || fullData?.previewPdfUrl || null);
      } catch (err) {
        console.error("Failed to load chapter", err);
      }
    }
    load();
  }, [slug]);

  function onDocLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  async function handleDownload() {
    window.location.href = `/api/chapters/${slug}/download`;
  }

  if (!chapter) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{chapter.title}</h1>
      <p className="text-gray-600">{chapter.excerpt}</p>

      <div className="mt-4 flex gap-2">
        {chapter.pdfUrl ? (
          <Button onClick={handleDownload}>Download PDF</Button>
        ) : (
          <Button variant="outline" disabled>
            Purchase required
          </Button>
        )}
      </div>

      <div className="mt-8 border rounded-xl p-4 bg-gray-50">
        {fileUrl ? (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocLoadSuccess}
            loading={<p>Loading PDF...</p>}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            ))}
          </Document>
        ) : (
          <p>No preview available.</p>
        )}
      </div>
    </div>
  );
}
