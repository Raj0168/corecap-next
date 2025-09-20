"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { Course, PaginatedResponse } from "@/types/interfaces";

export default function Home() {
  const { data, isLoading, error } = useQuery<PaginatedResponse<Course>, Error>(
    {
      queryKey: ["courses", 1],
      queryFn: () =>
        api.get("/courses?page=1&limit=20").then((res) => res.data),
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching courses: {error.message}</div>;

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {data?.items.map((course) => (
          <li key={course.slug}>{course.title}</li>
        ))}
      </ul>
    </div>
  );
}
