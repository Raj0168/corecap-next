"use client";

import { useMutation } from "@tanstack/react-query";
import api from "@/utils/api";
import { useToast } from "@/app/(site)/components/ui/toast";

export type PayuParams = {
  key: string;
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string;
  furl: string;
  hash: string;
};

type PaymentResponse = { payuParams: PayuParams };

export const useInitiatePayment = () => {
  const { toast } = useToast();

  return useMutation<PaymentResponse, Error, void>({
    mutationFn: async () => {
      const res = await api.post("/payments/initiate");
      return res.data;
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        message: error.message || "Payment initiation failed",
      });
    },
  });
};
