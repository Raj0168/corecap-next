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

export interface CartResponse {
  items: CartItem[];
  total: number;
  discount: number;
  payable: number;
  coupon: {
    code: string | null;
    discount: number;
  } | null;
}

// -------- FETCH CART --------
export const useCart = () =>
  useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
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
    mutationFn: (payload: { itemId: string; itemType: "course" | "chapter" }) =>
      api.post("/cart/add", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

// -------- REMOVE FROM CART --------
export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { itemId: string; itemType: string }) =>
      api.post("/cart/remove", data).then((r) => r.data),
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

// -------- APPLY COUPON --------
export const useApplyCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { code: string }) =>
      api.post("/cart/apply-coupon", payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

// -------- REMOVE COUPON --------
export const useRemoveCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/cart/remove-coupon").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
};

// -------- INITIATE PAYMENT --------
export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: () => api.post("/payments/initiate").then((r) => r.data),
  });
};
