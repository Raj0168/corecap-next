"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useCourses } from "@/hooks/useCourses";
import { useState } from "react";

function CourseSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="w-full h-40 bg-gray-200 rounded-t-2xl" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [download, setDownload] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const {
    data: courses,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCourses();

  if (isLoading || isFetching) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Failed to load courses.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No courses available right now.
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <Card
          key={index}
          className="shadow-lg rounded-2xl hover:shadow-xl transition-shadow"
        >
          <div className="relative w-full h-40 overflow-hidden rounded-t-2xl">
            <img
              src="/course-image.webp"
              alt={course.title || "Course image"}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
            />
          </div>

          <CardContent className="p-4">
            <h2 className="text-lg font-semibold line-clamp-1">
              {course.title}
            </h2>

            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {course.description}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <p className="text-md font-bold">₹{course.price}</p>
              <p className="text-sm text-gray-500 line-through">
                ₹{course.price + 200}
              </p>
            </div>

            <Link href={`/courses/${course.slug}`}>
              <Button className="mt-3 w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
