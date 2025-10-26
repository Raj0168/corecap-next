// src/hooks/useCourseDetail.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

/**
 * Course shape returned from API (adjust fields as required)
 */
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

/**
 * Chapter shape returned from API
 */
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

/**
 * Cart item
 */
export interface CartItem {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
  addedAt: string;
}

/* -------------------------
   Queries
   ------------------------- */

/** fetch course by slug */
export const useCourse = (slug?: string) =>
  useQuery<CourseAPI | null>({
    queryKey: ["course", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}`);
      // backend returns an object (course) — normalize to shape
      return res.data ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

/** fetch chapters for a course */
export const useChapters = (slug?: string) =>
  useQuery<ChapterAPI[]>({
    queryKey: ["course", slug, "chapters"],
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}/chapters`);
      const data = res.data;
      // backend returns { items: [...] }
      if (Array.isArray(data)) return data as any;
      if (Array.isArray(data.items)) return data.items;
      return [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

/** fetch cart - returns whole cart object (items + meta) or items only (adapt to your API) */
export const useCart = (enabled = true) =>
  useQuery<CartItem[]>({
    queryKey: ["cart"],
    enabled, // allow consumer to control initial fetching (we'll use true by default)
    queryFn: async () => {
      const res = await api.get("/cart");
      const data = res.data;
      // normalize: server might return { items: [...] }
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.items)) return data.items;
      return [];
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

/* -------------------------
   Mutations (add/remove)
   ------------------------- */

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { itemId: string; itemType: "course" | "chapter" }) =>
      api.post("/cart/add", payload).then((r) => r.data),
    onSuccess: (res) => {
      // server returns updated cart (per your examples). Update cart cache with returned items
      if (res?.items) {
        qc.setQueryData(["cart"], res.items);
      } else {
        // fallback: refetch cart
        qc.invalidateQueries(["cart"]);
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
        qc.invalidateQueries(["cart"]);
      }
    },
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/cart/clear").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries(["cart"]),
  });
};
