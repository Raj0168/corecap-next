"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { CartItem } from "@/types/interfaces";
import { useCartStore } from "@/store/cartStore";

export const useCart = () =>
  useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: () => api.get("/cart").then((res) => res.data),
  });

export const useAddToCart = () => {
  const addItem = useCartStore((s) => s.addItem);

  return useMutation({
    mutationFn: (item: CartItem) =>
      api.post("/cart/add", item).then((res) => res.data),
    onSuccess: (item) => addItem(item),
  });
};

export const useRemoveFromCart = () => {
  const removeItem = useCartStore((s) => s.removeItem);

  return useMutation({
    mutationFn: (data: { itemId: string; itemType: string }) =>
      api.post("/cart/remove", data).then((res) => res.data),
    onSuccess: (_, variables) => removeItem(variables.itemId),
  });
};
