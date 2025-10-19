// src/app/courses/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  chapterPrice: number;
  thumbnailUrl: string;
  author: string;
  pages: number;
}

interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
  excerpt: string;
  pages: number;
  pdfUrl: string | null;
  previewPdfUrl?: string | null;
  hasAccess?: boolean;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const resCourse = await fetch(`/api/courses/${slug}`);
        const c = await resCourse.json();
        setCourse(c);

        const resChapters = await fetch(`/api/courses/${slug}/chapters`);
        const ch = await resChapters.json();
        setChapters(ch.items || []);
      } catch (e) {
        console.error("Failed to load course detail", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  async function addToCart(itemId: string, itemType: "course" | "chapter") {
    try {
      setAdding(itemId);
      await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType }),
      });
      alert("Added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    } finally {
      setAdding(null);
    }
  }

  if (loading) return <div className="p-6">Loading course...</div>;
  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="p-6">
      {/* Course Header */}
      <div className="flex gap-6">
        <img
          height={200}
          width={200}
          src={course.thumbnailUrl}
          alt={course.title}
          className="w-60 h-40 object-cover rounded-xl"
        />
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
          <p className="mt-2 font-semibold">By {course.author}</p>
          <p className="mt-2 text-lg font-bold">₹{course.price}</p>
          <div className="mt-4 flex gap-3">
            <Button
              disabled={adding === course.id}
              onClick={() => addToCart(course.id, "course")}
            >
              Add Full Course to Cart
            </Button>
            {/* For now, keep this separate – ideally backend should also return signedUrl for full course */}
            <Button
              onClick={() =>
                window.open(`/api/courses/${slug}/download`, "_blank")
              }
            >
              Download Full Course
            </Button>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <h2 className="mt-10 text-xl font-bold">Chapters</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((ch) => (
          <Card key={ch.id} className="rounded-xl shadow">
            <CardContent className="p-4">
              <h3 className="font-semibold">
                {ch.order}. {ch.title}
              </h3>
              <p className="text-sm text-gray-600">{ch.excerpt}</p>
              <p className="text-sm mt-1">{ch.pages} pages</p>

              <div className="mt-3 flex gap-2">
                {ch.pdfUrl ? (
                  <>
                    <Button onClick={() => window.open(ch.pdfUrl!, "_blank")}>
                      View
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(ch.pdfUrl!, "_blank")}
                    >
                      Download
                    </Button>
                  </>
                ) : ch.previewPdfUrl ? (
                  <Button
                    variant="outline"
                    onClick={() => window.open(ch.previewPdfUrl!, "_blank")}
                  >
                    Preview
                  </Button>
                ) : (
                  <Button
                    disabled={adding === ch.id}
                    onClick={() => addToCart(ch.id, "chapter")}
                  >
                    Buy Chapter ₹{course.chapterPrice}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
