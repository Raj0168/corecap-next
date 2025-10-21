"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  hasAccess?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
  excerpt: string;
  pages: number;
  pdfPath: string | null;
  previewPdfPath?: string | null;
  hasAccess?: boolean;
  signedUrl?: string | null;
}

interface CartItem {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
  addedAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        // --- Fetch course ---
        const resCourse = await fetch(`/api/courses/${slug}`);
        const c = await resCourse.json();

        const mappedCourse: Course = {
          id: c._id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          price: c.price,
          chapterPrice: c.chapterPrice,
          thumbnailUrl: c.thumbnailUrl,
          author: c.author,
          pages: c.pages,
          hasAccess: c.hasAccess,
        };

        setCourse(mappedCourse);

        // --- Fetch chapters ---
        const resChapters = await fetch(`/api/courses/${slug}/chapters`);
        const ch = await resChapters.json();
        setChapters(ch.items || []);

        // --- Fetch cart ---
        const resCart = await fetch("/api/cart");
        const cartData = await resCart.json();
        setCart(cartData.items || []);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  // --- Add to cart ---
  async function addToCart(itemId: string, itemType: "course" | "chapter") {
    try {
      setAdding(itemId);
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      setCart(data.items);
      alert("Added to cart!");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    } finally {
      setAdding(null);
    }
  }

  const cartHasCourse = cart.some((it) => it.itemType === "course");
  const cartHasChapter = cart.some((it) => it.itemType === "chapter");

  if (loading) return <div className="p-6">Loading course...</div>;
  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="p-6">
      {/* --- Course Header --- */}
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
            {course.hasAccess ? (
              <Button
                onClick={() =>
                  window.open(`/api/courses/${course.slug}/download`, "_blank")
                }
              >
                Download Full Course
              </Button>
            ) : (
              <Button
                disabled={adding === course.id || cartHasChapter}
                onClick={() => addToCart(course.id, "course")}
              >
                {cartHasChapter
                  ? "Cannot buy course: cart has chapters"
                  : "Buy Full Course"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- Chapters --- */}
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

              <div className="mt-3 flex flex-col gap-2">
                {ch.hasAccess && ch.pdfPath ? (
                  <>
                    <Button
                      onClick={() =>
                        router.push(`/courses/${slug}/chapter/${ch.slug}`)
                      }
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `/api/courses/${course.slug}/chapters/${ch.slug}/download`,
                          "_blank"
                        )
                      }
                    >
                      Download PDF
                    </Button>
                  </>
                ) : (
                  <>
                    {ch.previewPdfPath && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/courses/${slug}/chapter/${ch.slug}`)
                        }
                      >
                        Preview
                      </Button>
                    )}
                    <Button
                      disabled={adding === ch.id || cartHasCourse}
                      onClick={() => addToCart(ch.id, "chapter")}
                    >
                      {cartHasCourse
                        ? "Cannot buy chapter: cart has courses"
                        : `Buy Chapter ₹${course.chapterPrice}`}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
