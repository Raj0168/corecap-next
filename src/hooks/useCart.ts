"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { CartItem } from "@/types/interfaces";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/app/(site)/components/ui/toast";

export const useCart = () =>
  useQuery<CartItem[]>({
    queryKey: ["cart"],
    queryFn: () => api.get("/cart").then((res) => res.data),
  });

export const useAddToCart = () => {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  return useMutation({
    mutationFn: (item: CartItem) =>
      api.post("/cart/add", item).then((res) => res.data),
    onSuccess: (data) => {
      addItem(data);
      toast({ type: "success", message: "Added to cart!" });
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast({ type: "warning", message: "Item already in cart" });
      } else {
        toast({ type: "error", message: "Failed to add to cart" });
      }
    },
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
