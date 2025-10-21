"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";

type CartItem = {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
  addedAt: string;
};

type PayuParams = {
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

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load cart for order summary
  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

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

  async function handleCheckoutRedirect() {
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/initiate", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.payuParams)
        throw new Error(data?.error || "Failed to initiate payment");

      const payu: PayuParams = data.payuParams;

      const mode = (
        process.env.NEXT_PUBLIC_PAYU_MODE || "sandbox"
      ).toLowerCase();
      const payuAction =
        mode === "prod"
          ? "https://secure.payu.in/_payment"
          : "https://sandboxsecure.payu.in/_payment";

      const formParams: Record<string, any> = {
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
      };

      postToPayU(payuAction, formParams);

      setTimeout(() => {
        setProcessing(false);
        if (!document.hidden && document.visibilityState === "visible") {
          setError(
            "If you are still on this page, the payment did not start — try again."
          );
        }
      }, 5000);
    } catch (err: any) {
      console.error("Checkout redirect error:", err);
      setError(err?.message || "Checkout initiation failed");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading order...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
        <div className="mt-4">
          <Button onClick={loadCart}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {/* Order summary */}
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
              <div className="text-sm text-gray-400">
                Added: {new Date(item.addedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="font-bold text-lg">₹{item.price}</div>
          </div>
        ))}
      </div>

      <div className="text-right mb-6 font-bold text-xl">Total: ₹{total}</div>

      <div className="flex gap-3">
        <Button
          onClick={handleCheckoutRedirect}
          disabled={processing || items.length === 0}
        >
          {processing ? "Starting payment..." : "Pay Now"}
        </Button>
      </div>

      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
