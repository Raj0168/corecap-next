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
    <div className="p-6 flex gap-6">
      <div className="w-60 h-40 bg-gray-200 rounded-xl animate-pulse" />
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
            <div className="w-full md:w-1/2 h-64 md:h-80 lg:h-96 relative rounded-xl overflow-hidden bg-gray-100">
              <img
                loading="lazy"
                src={course.thumbnailUrl ?? "/course-default.jpg"}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
              <p className="text-gray-600 mt-3 md:mt-4">{course.description}</p>
              <p className="mt-2 text-gray-800 font-semibold">
                By {course.author}
              </p>
              <p className="mt-3 text-2xl md:text-3xl font-bold text-indigo-600">
                ₹{course.price}
              </p>

              {/* Buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                {course.hasAccess ? (
                  <Button
                    className="w-full sm:w-auto"
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
                    className="w-full sm:w-auto"
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
