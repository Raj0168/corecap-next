// src/app/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  author: string;
  grade: string;
  subject: string;
  pages: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        setCourses(data.items || []);
      } catch (e) {
        console.error("Failed to load courses", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading courses...</div>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="shadow-lg rounded-2xl">
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-40 object-cover rounded-t-2xl"
          />
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">
              {course.description}
            </p>
            <p className="text-md font-bold mt-2">₹{course.price}</p>
            <Link href={`/courses/${course.slug}`}>
              <Button className="mt-3 w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
