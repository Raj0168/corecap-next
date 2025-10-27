"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, BookOpen, Layers } from "lucide-react";
import { Card } from "../components/ui/card";
import Button from "../components/ui/button";
import { useMe } from "@/hooks/useAuth";
import DownloadModal from "../components/ui/DownloadModal";

function CourseSkeleton() {
  return (
    <div className="p-4 rounded-xl animate-pulse flex justify-between items-center">
      <div className="space-y-2 w-3/4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="w-24 h-10 bg-gray-200 rounded" />
    </div>
  );
}

function ChapterSkeleton() {
  return (
    <div className="p-4 rounded-xl animate-pulse flex justify-between items-center">
      <div className="space-y-2 w-3/4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="w-24 h-10 bg-gray-200 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();

  // --- Download modal state ---
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");

  function handleDownload(url: string, filename: string) {
    setDownloadUrl(url);
    setDownloadFilename(filename);
  }

  if (isError)
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load your dashboard.
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name ?? "..."}
        </h1>
        <p className="text-gray-600 mt-2">
          Access your purchased courses and chapters below.
        </p>
      </div>

      {/* COURSES */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Purchased Courses
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <CourseSkeleton key={i} />
            ))}
          </div>
        ) : user?.purchasedCourses?.length ? (
          <div className="grid gap-4">
            {user.purchasedCourses.map((course) => (
              <Card
                key={course._id.toString()}
                className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:shadow-lg transition-shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                </div>

                <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a2342]"
                    onClick={() =>
                      handleDownload(
                        `/api/courses/${course.slug}/download`,
                        `${course.slug}-course.pdf`
                      )
                    }
                  >
                    <Download className="h-4 w-4" /> Download Course
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No purchased courses yet.</div>
        )}
      </section>

      {/* CHAPTERS */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5" /> Purchased Chapters
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ChapterSkeleton key={i} />
            ))}
          </div>
        ) : user?.purchasedChapters?.length ? (
          <div className="grid gap-4">
            {user.purchasedChapters.map((chapter) => (
              <Card
                key={chapter._id.toString()}
                className="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">{chapter.title}</h3>
                  <p className="text-gray-500 text-sm">
                    Chapter: {chapter.courseId?.title}
                  </p>
                </div>

                <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex items-center gap-2"
                    onClick={() =>
                      router.push(
                        `/courses/${chapter.courseId.slug}/chapter/${chapter.slug}`
                      )
                    }
                  >
                    <Eye className="h-4 w-4" /> View
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() =>
                      handleDownload(
                        `/api/courses/${chapter.courseId.slug}/chapters/${chapter.slug}/download`,
                        `${chapter.slug}-chapter.pdf`
                      )
                    }
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No purchased chapters yet.</div>
        )}
      </section>

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
