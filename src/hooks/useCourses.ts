"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { Course } from "@/types/interfaces";

export const useCourses = () =>
  useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => api.get("/courses").then((res) => res.data),
  });

export const useCourse = (slug: string) =>
  useQuery<Course>({
    queryKey: ["course", slug],
    queryFn: () => api.get(`/courses/${slug}`).then((res) => res.data),
    enabled: !!slug,
  });

export const useAddCourse = () =>
  useMutation({
    mutationFn: (data: Partial<Course>) =>
      api.post("/courses", data).then((res) => res.data),
  });
