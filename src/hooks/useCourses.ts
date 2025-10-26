import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { Course } from "@/types/interfaces";

export const useCourses = () =>
  useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await api.get("/courses");
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.items)) return data.items;
      return [];
    },
  });

export const useCourse = (slug: string) =>
  useQuery<Course>({
    queryKey: ["course", slug],
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}`);
      const data = res.data;
      return data?.item ?? data ?? {};
    },
    enabled: !!slug,
  });

export const useAddCourse = () =>
  useMutation({
    mutationFn: (data: Partial<Course>) =>
      api.post("/courses", data).then((res) => res.data),
  });
