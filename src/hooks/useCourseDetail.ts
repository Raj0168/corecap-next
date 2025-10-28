// src/hooks/useCourseDetail.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

export interface CourseAPI {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  chapterPrice?: number;
  thumbnailUrl?: string | null;
  author?: string;
  pages?: number;
  hasAccess?: boolean;
}

export interface ChapterAPI {
  id: string;
  title: string;
  slug: string;
  order?: number;
  excerpt?: string;
  pages?: number;
  theoryPages?: number;
  questions?: number;
  pdfPath?: string | null;
  previewPdfPath?: string | null;
  hasAccess?: boolean;
}

export interface CartItem {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
  addedAt: string;
}

export const useCourse = (slug?: string) =>
  useQuery<CourseAPI | null>({
    queryKey: ["course", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}`);
      return res.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useChapters = (slug?: string) =>
  useQuery<ChapterAPI[]>({
    queryKey: ["course", slug, "chapters"],
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}/chapters`);
      const data = res.data;
      if (Array.isArray(data)) return data as any;
      if (Array.isArray(data.items)) return data.items;
      return [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

export const useCart = (enabled = true) =>
  useQuery<CartItem[]>({
    queryKey: ["cart"],
    enabled,
    queryFn: async () => {
      const res = await api.get("/cart");
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.items)) return data.items;
      return [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { itemId: string; itemType: "course" | "chapter" }) =>
      api.post("/cart/add", payload).then((r) => r.data),
    onSuccess: (res) => {
      if (res?.items) {
        qc.setQueryData(["cart"], res.items);
      } else {
        qc.invalidateQueries({ queryKey: ["cart"] });
      }
    },
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { itemId: string; itemType: string }) =>
      api.post("/cart/remove", payload).then((r) => r.data),
    onSuccess: (res) => {
      if (res?.items) {
        qc.setQueryData(["cart"], res.items);
      } else {
        qc.invalidateQueries({ queryKey: ["cart"] });
      }
    },
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/cart/clear").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};
