"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

// -------- TYPES --------
export interface Payment {
  _id: string;
  txnid: string;
  amount: number;
  status: "pending" | "success" | "failed";
  provider: "payu";
  createdAt: string;
  purchaseId?: {
    _id: string;
    amount: number;
    status: "created" | "paid" | "failed";
    createdAt: string;
  };
}

interface PaymentsResponse {
  success: boolean;
  payments: Payment[];
}

interface PaymentDetailResponse {
  success: boolean;
  payment: Payment;
}

// -------- FETCH ALL PAYMENTS --------
export const usePayments = () =>
  useQuery<PaymentsResponse>({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await api.get("/payments");
      return res.data;
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

// -------- FETCH SINGLE PAYMENT DETAIL --------
export const usePaymentDetails = (id?: string) =>
  useQuery<PaymentDetailResponse>({
    queryKey: ["payment", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing payment ID");
      const res = await api.get(`/payments/${id}`);
      return res.data;
    },
    enabled: !!id, // only run when id exists
    refetchOnWindowFocus: false,
  });
