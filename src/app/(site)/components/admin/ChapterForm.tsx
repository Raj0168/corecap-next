"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type ChapterData = {
  title: string;
  slug: string;
  order: number;
  excerpt?: string;
  pdfPath: string;
  previewPdfPath?: string | null;
  pages: number;
  theoryPages?: number; // NEW
  questions?: number; // NEW
};

// Props: create requires courseSlug, edit requires slug
type Props =
  | {
      mode: "create";
      courseSlug: string;
      initial?: Partial<ChapterData>;
      onSuccess?: () => void;
    }
  | {
      mode: "edit";
      slug: string;
      courseSlug?: string;
      initial?: Partial<ChapterData>;
      onSuccess?: () => void;
    };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-");
}

export default function ChapterForm(props: Props) {
  const { mode, initial = {}, onSuccess } = props;
  const router = useRouter();

  let courseSlug: string | undefined;
  let slug: string | undefined;
  if (mode === "create") courseSlug = props.courseSlug;
  else {
    slug = props.slug;
    courseSlug = props.courseSlug;
  }

  const [title, setTitle] = useState(initial.title ?? "");
  const [slugVal, setSlugVal] = useState(initial.slug ?? "");
  const [order, setOrder] = useState(initial.order ?? 1);
  const [excerpt, setExcerpt] = useState(initial.excerpt ?? "");
  const [pdfPath, setPdfPath] = useState(initial.pdfPath ?? "");
  const [previewPdfPath, setPreviewPdfPath] = useState(
    initial.previewPdfPath ?? ""
  );
  const [pages, setPages] = useState(initial.pages ?? 1);

  // NEW FIELDS
  const [theoryPages, setTheoryPages] = useState(initial.theoryPages ?? 0);
  const [questions, setQuestions] = useState(initial.questions ?? 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalizeGcsPath(path: string) {
    if (!path) return "";
    return path.replace(/^gs:\/\/[^/]+\//, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title || !slugVal || !pdfPath || !pages) {
      setError("Please fill required fields.");
      return;
    }

    setLoading(true);
    try {
      const body: ChapterData = {
        title,
        slug: slugVal,
        order: Number(order),
        excerpt,
        pdfPath: normalizeGcsPath(pdfPath),
        previewPdfPath: previewPdfPath
          ? normalizeGcsPath(previewPdfPath)
          : null,
        pages: Number(pages),
        theoryPages: Number(theoryPages), // NEW
        questions: Number(questions), // NEW
      };

      let endpoint = "";
      let method: "POST" | "PUT" = "POST";

      if (mode === "create") {
        endpoint = `/api/courses/${encodeURIComponent(courseSlug!)}/chapters`;
        method = "POST";
      } else {
        endpoint = `/api/chapters/${encodeURIComponent(slug!)}`;
        method = "PUT";
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? "Server error");
        return;
      }

      onSuccess?.();
      router.back();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="font-medium">Title *</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugVal) setSlugVal(slugify(e.target.value));
            }}
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          <span className="font-medium">Slug *</span>
          <input
            value={slugVal}
            onChange={(e) => setSlugVal(e.target.value)}
            className="border p-2 rounded"
          />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="font-medium">Excerpt</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          className="border p-2 rounded"
        />
      </label>

      <div className="grid md:grid-cols-3 gap-4">
        <label className="flex flex-col">
          <span className="font-medium">Order *</span>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          <span className="font-medium">Pages *</span>
          <input
            type="number"
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          <span className="font-medium">Preview PDF Path (optional)</span>
          <input
            value={previewPdfPath}
            onChange={(e) => setPreviewPdfPath(e.target.value)}
            className="border p-2 rounded"
            placeholder="chapters/...-preview.pdf"
          />
        </label>
      </div>

      {/* NEW FIELDS */}
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="font-medium">Theory Pages</span>
          <input
            type="number"
            value={theoryPages}
            onChange={(e) => setTheoryPages(Number(e.target.value))}
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          <span className="font-medium">Questions</span>
          <input
            type="number"
            value={questions}
            onChange={(e) => setQuestions(Number(e.target.value))}
            className="border p-2 rounded"
          />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="font-medium">PDF Path (GCS) *</span>
        <input
          value={pdfPath}
          onChange={(e) => setPdfPath(e.target.value)}
          className="border p-2 rounded"
          placeholder="chapters/course-slug/01.pdf"
        />
      </label>

      <div className="flex gap-3">
        <button
          disabled={loading}
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Add Chapter"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
