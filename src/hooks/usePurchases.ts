"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

// -------- TYPES --------
export interface PurchaseItem {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
}

export interface Purchase {
  _id: string;
  amount: number;
  status: "created" | "paid" | "failed";
  items?: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

interface PurchasesResponse {
  success: boolean;
  purchases: Purchase[];
}

interface PurchaseDetailResponse {
  success: boolean;
  purchase: Purchase;
}

// -------- FETCH ALL PURCHASES --------
export const usePurchases = () =>
  useQuery<PurchasesResponse>({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await api.get("/purchases");
      return res.data;
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

// -------- FETCH SINGLE PURCHASE DETAIL --------
export const usePurchaseDetails = (id?: string) =>
  useQuery<PurchaseDetailResponse>({
    queryKey: ["purchase", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing purchase ID");
      const res = await api.get(`/purchases/${id}`);
      return res.data;
    },
    enabled: !!id, // only run when id exists
    refetchOnWindowFocus: false,
  });
