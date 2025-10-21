"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";

type CartItem = {
  itemId: string;
  itemType: "course" | "chapter";
  price: number;
  addedAt: string;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart on mount
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
      console.error("Error loading cart:", err);
      setError(err?.message ?? "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(item: CartItem) {
    try {
      setProcessing(true);
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.itemId, itemType: item.itemType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Remove failed");
      await loadCart();
    } catch (err: any) {
      alert(err?.message || "Failed to remove item");
    } finally {
      setProcessing(false);
    }
  }

  async function clearCart() {
    if (!confirm("Are you sure you want to clear the cart?")) return;
    try {
      setProcessing(true);
      const res = await fetch("/api/cart/clear", { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear cart");
      await loadCart();
    } catch (err: any) {
      alert(err?.message || "Failed to clear cart");
    } finally {
      setProcessing(false);
    }
  }

  function goToCheckout() {
    router.push("/checkout");
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading your cart...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading cart: {error}
        <div className="mt-4">
          <Button onClick={loadCart}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-gray-600 mt-6">Your cart is empty.</div>
      ) : (
        <>
          <div className="border rounded-lg divide-y">
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
                <div className="flex items-center gap-4">
                  <div className="font-bold text-lg">₹{item.price}</div>
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(item)}
                    disabled={processing}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6">
            <div className="text-xl font-bold">Total: ₹{total}</div>
            <div className="flex gap-3">
              <Button
                onClick={clearCart}
                disabled={processing}
              >
                Clear Cart
              </Button>
              <Button onClick={goToCheckout} disabled={processing}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
