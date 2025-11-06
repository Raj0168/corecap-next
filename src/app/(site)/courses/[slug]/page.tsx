"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";
import { useCourse, useChapters, useCart } from "@/hooks/useCourseDetail";
import { useToast } from "../../components/ui/toast";
import {
  Eye,
  Download,
  FileText,
  BookOpen,
  FileText as TheoryIcon,
  ListCheck,
} from "lucide-react";
import DownloadModal from "../../components/ui/DownloadModal";
import { useAddToCart } from "@/hooks/useCart";

function CourseSkeleton() {
  return (
    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
      <div className="w-full md:w-1/2 aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />

      <div className="flex-1 space-y-3">
        <div className="h-6 bg-gray-200 w-3/4 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 w-full rounded animate-pulse" />
        <div className="h-4 bg-gray-200 w-1/3 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 w-40 rounded mt-3 animate-pulse" />
      </div>
    </div>
  );
}

function ChapterSkeleton() {
  return (
    <div className="p-4 flex gap-4 bg-gray-100 rounded-xl animate-pulse">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
      </div>
      <div className="flex flex-col justify-around gap-2 w-40">
        <div className="h-10 bg-gray-300 rounded" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { toast } = useToast();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useCourse(slug);
  const { data: chapters, isLoading: chaptersLoading } = useChapters(slug);
  const addToCartMutation = useAddToCart();

  const { data: rawCartItems, refetch: refetchCart } = useCart(false);
  const cartItems = Array.isArray(rawCartItems) ? rawCartItems : [];

  const cartHasCourse = cartItems.some((it) => it.itemType === "course");
  const cartHasChapter = cartItems.some((it) => it.itemType === "chapter");

  async function addToCart(itemId: string, itemType: "course" | "chapter") {
    try {
      setAddingId(itemId);
      await addToCartMutation.mutateAsync({ itemId, itemType });
      toast({ type: "success", message: "Added to cart!" });
    } catch (err: any) {
      if (err?.response?.status === 409)
        toast({ type: "warning", message: "Item already in cart" });
      else toast({ type: "error", message: "Failed to add to cart" });
    } finally {
      setAddingId(null);
    }
  }

  function handleDownload(url: string, filename: string) {
    setDownloadUrl(url);
    setDownloadFilename(filename);
  }

  if (courseError)
    return <div className="p-6 text-red-600">Failed to load course.</div>;

  return (
    <div className="p-6 space-y-8">
      {/* COURSE HEADER */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {courseLoading || !course ? (
          <CourseSkeleton />
        ) : (
          <>
            <div className="w-full md:w-1/2 h-64 md:h-80 lg:h-96 relative rounded-xl overflow-hidden bg-gray-200">
              <img
                loading="lazy"
                src="/course-image.webp"
                alt={course.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-2xl md:text-3xl font-bold tracking-tight">
                    ₹{course.price}
                  </p>
                  <p className="text-sm md:text-base line-through">
                    ₹{course.price + 300}
                  </p>
                </div>

                {course.hasAccess ? (
                  <Button
                    className="w-full sm:w-auto bg-white/90 text-black font-semibold backdrop-blur hover:bg-white"
                    onClick={() =>
                      handleDownload(
                        `/api/courses/${course.slug}/download`,
                        `${course.slug}-course.pdf`
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Full Course
                  </Button>
                ) : (
                  <Button
                    className="w-full md:w-auto"
                    disabled={addingId === course._id || cartHasChapter}
                    onClick={() =>
                      addToCart(
                        course._id ?? (course as any).id ?? course.slug,
                        "course"
                      )
                    }
                  >
                    {addingId === course._id
                      ? "Adding..."
                      : cartHasChapter
                      ? "Cannot buy course: cart has chapters"
                      : "Buy Full Course"}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="h-64 md:h-80 lg:h-96 overflow-y-auto pr-2 modern-scroll">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {course.title}
                </h1>

                <section className="mt-4 md:mt-6 text-gray-700">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                    Course Description
                  </h2>

                  <p className="mt-3 text-sm md:text-base leading-7">
                    CoreCap Maths offers a focused, time-efficient way to master
                    Class 10 CBSE Mathematics — designed for students who value
                    clarity, structure, and precision over endless material.
                  </p>

                  <div className="mt-4 md:mt-6">
                    <h3 className="text-sm md:text-base font-medium text-gray-900">
                      You’ll get:
                    </h3>

                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          <strong>Concise Concept Notes:</strong> Compact
                          summaries for all 14 chapters — complete, clear and
                          designed to strengthen understanding without overload.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          <strong>Types of Questions:</strong> A handpicked set
                          of high-value questions for each chapter aligned with
                          the CBSE 2026 pattern — each explained with the “how
                          to approach” thought process.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          <strong>Strategic Coverage:</strong> Every topic is
                          planned with purpose, so you know exactly what to
                          study, what to revise, and what to skip.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          <strong>Exclusive A&amp;R chapter:</strong> Assertion
                          &amp; Reasoning exercises to develop deep conceptual
                          understanding and logical thinking.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <p className="mt-4 text-sm md:text-base leading-7">
                    Whether you’re revising before exams, brushing up before
                    tests, or seeking full confidence in tricky topics, this
                    course turns revision into a guided, smart, and stress-free
                    experience.
                  </p>

                  <p className="mt-3 text-sm md:text-base font-semibold text-gray-900">
                    Smart Revision. Focused Effort. Confident Results.
                  </p>

                  <div className="mt-5 md:mt-6">
                    <h3 className="text-sm md:text-base font-medium text-gray-900">
                      Who This Course Is For
                    </h3>

                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          Class 10 CBSE students preparing for the 2026 Board
                          Exams.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          Learners who prefer structured, efficient revision
                          over bulky textbooks and endless question banks.
                        </span>
                      </li>

                      <li className="flex items-start">
                        <span className="mr-3 mt-1 text-indigo-600 font-bold">
                          —
                        </span>
                        <span className="text-sm md:text-base leading-6">
                          Students who want to understand the why and how behind
                          each solution, not just memorize steps.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CHAPTERS */}
      <h2 className="text-xl font-bold">Chapters</h2>
      {chaptersLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChapterSkeleton key={i} />
          ))}
        </div>
      ) : chapters && chapters.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {chapters.map((ch) => {
            if (!course) return null; // safety check

            const isAdding = addingId === ch.id;
            const hasAccess = !!ch.hasAccess;

            return (
              <Card
                key={ch.id}
                className="p-4 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                {/* Left side - Chapter info */}
                <div className="flex-1 pr-0 md:pr-4 w-full">
                  <h3 className="font-semibold text-lg">
                    {ch.order}. {ch.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{ch.excerpt}</p>

                  {/* Stats with icons */}
                  <div className="flex flex-wrap gap-4 mt-2 text-gray-500 text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> {ch.pages} pages
                    </div>
                    <div className="flex items-center gap-1">
                      <TheoryIcon className="h-4 w-4" /> {ch.theoryPages} theory
                      pages
                    </div>
                    <div className="flex items-center gap-1">
                      <ListCheck className="h-4 w-4" /> {ch.questions} questions
                    </div>
                  </div>
                </div>

                {/* Right side - Buttons */}
                <div className="flex flex-col gap-2 w-full md:w-40 mt-3 md:mt-0">
                  {hasAccess && ch.pdfPath ? (
                    <>
                      <Button
                        className="w-full md:w-auto"
                        onClick={() =>
                          router.push(`/courses/${slug}/chapter/${ch.slug}`)
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      <Button
                        className="w-full md:w-auto"
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            `/api/courses/${course.slug}/chapters/${ch.slug}/download`,
                            `${ch.slug}-chapter.pdf`
                          )
                        }
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </>
                  ) : (
                    <>
                      {ch.previewPdfPath && (
                        <Button
                          className="w-full md:w-auto"
                          variant="outline"
                          onClick={() =>
                            router.push(`/courses/${slug}/chapter/${ch.slug}`)
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" /> Preview
                        </Button>
                      )}
                      <Button
                        className="w-full md:w-auto"
                        disabled={isAdding || cartHasCourse}
                        onClick={() => addToCart(ch.id, "chapter")}
                      >
                        {isAdding
                          ? "Adding..."
                          : cartHasCourse
                          ? "Cannot buy chapter: cart has courses"
                          : `Buy Chapter ₹${course.chapterPrice ?? "—"}`}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500">No chapters available.</div>
      )}

      {/* DOWNLOAD MODAL */}
      {downloadUrl && (
        <DownloadModal
          url={downloadUrl}
          filename={downloadFilename}
          onClose={() => {
            setDownloadUrl(null);
            setDownloadFilename("");
          }}
        />
      )}
    </div>
  );
}
