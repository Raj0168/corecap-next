"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  mode: "create" | "edit";
  initial?: Partial<any>;
  slug?: string; // for edit mode
  onSuccess?: (slugOrId: string) => void;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-+/g, "-");
}

export default function CourseForm({
  mode,
  initial = {},
  slug,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(initial.title ?? "");
  const [slugVal, setSlugVal] = useState(initial.slug ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState(initial.price ?? 0);
  const [chapterPrice, setChapterPrice] = useState(initial.chapterPrice ?? 0);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial.thumbnailUrl ?? "");
  const [fullCoursePdfPath, setFullCoursePdfPath] = useState(
    initial.fullCoursePdfPath ?? ""
  );
  const [pages, setPages] = useState(initial.pages ?? 0);
  const [author, setAuthor] = useState(initial.author ?? "");
  const [schoolGrade, setschoolGrade] = useState(initial.schoolGrade ?? "10");
  const [subject, setSubject] = useState(initial.subject ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !title ||
      !slugVal ||
      !price ||
      !chapterPrice ||
      !thumbnailUrl ||
      !fullCoursePdfPath ||
      !pages ||
      !author ||
      !subject
    ) {
      setError("Please fill required fields.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        title,
        slug: slugVal,
        description,
        price: Number(price),
        chapterPrice: Number(chapterPrice),
        thumbnailUrl,
        fullCoursePdfPath,
        pages: Number(pages),
        author,
        schoolGrade,
        subject,
      };

      const endpoint =
        mode === "create"
          ? "/api/courses"
          : `/api/courses/${encodeURIComponent(slug ?? slugVal)}`;
      const method = mode === "create" ? "POST" : "PUT";

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

      const id = json.id ?? slugVal;
      onSuccess?.(id);
      // navigate to course admin page
      router.push(
        `/admin/courses/${mode === "create" ? slugVal : slug ?? slugVal}`
      );
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <span className="font-medium">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="border p-2 rounded"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col">
          <span className="font-medium">Price (course) *</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border p-2 rounded"
          />
        </label>
        <label className="flex flex-col">
          <span className="font-medium">Chapter Price *</span>
          <input
            type="number"
            value={chapterPrice}
            onChange={(e) => setChapterPrice(Number(e.target.value))}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col">
          <span className="font-medium">Thumbnail URL *</span>
          <input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="border p-2 rounded"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Full Course PDF Path (GCS) *</span>
          <input
            value={fullCoursePdfPath}
            onChange={(e) => setFullCoursePdfPath(e.target.value)}
            className="border p-2 rounded"
            placeholder="e.g. courses/fullstack/full.pdf"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Author *</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border p-2 rounded"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="font-medium">schoolGrade *</span>
          <select
            value={schoolGrade}
            onChange={(e) => setschoolGrade(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </label>

        <label className="flex flex-col">
          <span className="font-medium">Subject *</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border p-2 rounded"
          />
        </label>
      </div>

      <div className="flex gap-3">
        <button
          disabled={loading}
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Saving..."
            : mode === "create"
            ? "Create Course"
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
