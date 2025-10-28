"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

export interface CartItem {
  itemId: string;
  itemType: "course" | "chapter";
  name: string;
  price: number;
  addedAt?: string;
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

// -------- FETCH CART --------
export const useCart = () =>
  useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      // Normalizing the response
      if (Array.isArray(res.data)) {
        return {
          items: res.data,
          total: res.data.reduce((s, i) => s + i.price, 0),
        };
      }
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

// -------- ADD TO CART --------
export const useAddToCart = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      itemId: string;
      itemType: "course" | "chapter";
    }) => {
      console.log("POST /cart/add");
      const res = await api.post("/cart/add", payload);
      return res.data;
    },
    onSuccess: (res) => {
      // update cache instantly
      if (res?.items) {
        qc.setQueryData(["cart"], res);
      } else {
        qc.invalidateQueries({ queryKey: ["cart"] });
      }
    },
  });
};

// -------- REMOVE FROM CART --------
export const useRemoveFromCart = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { itemId: string; itemType: string }) =>
      api.post("/cart/remove", data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

// -------- CLEAR CART --------
export const useClearCart = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/cart/clear").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};
