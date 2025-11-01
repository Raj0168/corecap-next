"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Loader2, CreditCard, ShieldCheck, Receipt } from "lucide-react";
import { useCart, useInitiatePayment } from "@/hooks/useCart";

export default function CheckoutPage() {
  const router = useRouter();

  // react-query hooks from your codebase
  const { data, isPending, isError, refetch } = useCart();
  const paymentMutation = useInitiatePayment();

  // simple loading UI (no external Skeleton component)
  if (isPending) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow-sm"
          >
            <div className="space-y-2 w-3/4">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-5 w-40 bg-gray-200 rounded" />
        </div>
        <div className="h-11 w-full bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load checkout.
        <div className="mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const {
    items = [],
    total = 0,
    discount = 0,
    payable = total,
    coupon = null,
  } = data;

  function postToPayU(actionUrl: string, params: Record<string, any>) {
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
  }

  async function handlePayment() {
    paymentMutation.mutate(undefined, {
      onSuccess: (res: any) => {
        if (!res?.payuParams) {
          // fallback: show nothing here (caller handles UI)
          return;
        }
        const payu = res.payuParams;
        const mode = (
          process.env.NEXT_PUBLIC_PAYU_MODE || "sandbox"
        ).toLowerCase();
        const payuAction =
          mode === "prod"
            ? "https://secure.payu.in/_payment"
            : "https://sandboxsecure.payu.in/_payment";

        postToPayU(payuAction, payu);
      },
      onError: () => {
        // mutation state can be observed by caller; keep UI minimal
      },
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="rounded-2xl shadow-sm divide-y divide-gray-100 bg-white border border-gray-100">
        {items.map((item: any) => (
          <div
            key={item.itemId}
            className="flex justify-between items-center p-4 hover:bg-gray-50 transition"
          >
            <div>
              <div className="font-medium text-gray-800">{item.name}</div>
              <div className="text-gray-500 text-sm capitalize">
                {item.itemType}
              </div>
              {item.addedAt && (
                <div className="text-xs text-gray-400">
                  Added: {new Date(item.addedAt).toLocaleString()}
                </div>
              )}
            </div>
            <div className="font-semibold text-lg text-gray-900">
              ₹{item.price}
            </div>
          </div>
        ))}
      </div>

      {/* Coupon summary (read-only on checkout) */}
      {coupon && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
          <div className="text-sm text-green-800">
            <strong>{coupon.code}</strong> applied — saved ₹{coupon.discount}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex justify-between items-center mt-4 bg-gray-50 p-4 rounded-xl">
        <div>
          <div className="text-sm text-gray-600">Subtotal: ₹{total}</div>
          {discount > 0 && (
            <div className="text-sm text-green-600">Discount: -₹{discount}</div>
          )}
          <div className="text-xl font-semibold">Payable: ₹{payable}</div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/cart")}
            className="flex items-center gap-1"
          >
            Back to Cart
          </Button>

          <Button
            onClick={handlePayment}
            disabled={paymentMutation.isPending || items.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
          >
            {paymentMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing…
              </div>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Pay ₹{payable}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-500 mt-3 text-sm">
        <Receipt className="w-4 h-4" />
        Payments secured & encrypted, powered by PayU
      </div>
    </div>
  );
}
