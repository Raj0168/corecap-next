"use client";

import React from "react";
import Button from "../components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useInitiatePayment } from "@/hooks/useInitiatePayment";

export default function CheckoutPage() {
  const {
    data: items = [],
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useCart();

  const total = items.reduce((sum, it) => sum + it.price, 0);

  const paymentMutation = useInitiatePayment();
  const processing = paymentMutation.status === "pending"; // ✅ React Query v5 correct

  const postToPayU = (actionUrl: string, params: Record<string, any>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    form.style.display = "none";

    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = String(v ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => form.remove(), 5000);
  };

  const handleCheckoutRedirect = () => {
    paymentMutation.mutate(undefined, {
      onSuccess: (data) => {
        const payu = data.payuParams;
        const mode = (
          process.env.NEXT_PUBLIC_PAYU_MODE || "sandbox"
        ).toLowerCase();
        const payuAction =
          mode === "prod"
            ? "https://secure.payu.in/_payment"
            : "https://sandboxsecure.payu.in/_payment";

        postToPayU(payuAction, {
          key: payu.key,
          txnid: payu.txnid,
          amount: payu.amount,
          productinfo: payu.productinfo,
          firstname: payu.firstname,
          email: payu.email,
          phone: payu.phone ?? "",
          surl: payu.surl,
          furl: payu.furl,
          hash: payu.hash,
        });
      },
    });
  };

  if (cartLoading)
    return (
      <div className="p-6 text-center text-gray-600">Loading order...</div>
    );

  if (items.length === 0)
    return (
      <div className="p-6 text-center text-gray-600">
        Your cart is empty.
        <div className="mt-4">
          <Button onClick={() => refetchCart()}>Refresh Cart</Button>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="border rounded-lg divide-y mb-4">
        {items.map((item) => (
          <div
            key={item.itemId}
            className="flex justify-between items-center p-4"
          >
            <div>
              <div className="font-semibold capitalize">
                {item.itemType === "course" ? "Course" : "Chapter"}
              </div>
              <div className="text-gray-500 text-sm">ID: {item.itemId}</div>
              {item.addedAt && (
                <div className="text-sm text-gray-400">
                  Added: {new Date(item.addedAt).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="font-bold text-lg">₹{item.price}</div>
          </div>
        ))}
      </div>

      <div className="text-right mb-6 font-bold text-xl">Total: ₹{total}</div>

      <Button
        onClick={handleCheckoutRedirect}
        disabled={processing || items.length === 0}
      >
        {processing ? "Starting payment..." : "Pay Now"}
      </Button>
    </div>
  );
}
