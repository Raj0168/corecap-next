"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import {
  ShoppingCart,
  Trash2,
  X,
  Loader2,
  Package,
  ArrowRight,
} from "lucide-react";
import { useCart, useRemoveFromCart, useClearCart } from "@/hooks/useCart";
import ApplyCouponBox from "../components/cart/ApplyCouponBox";

function CartSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded-lg" />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex justify-between items-center p-4 bg-gray-50 rounded-xl shadow-sm"
        >
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded" />
        </div>
      ))}
      <div className="flex justify-between mt-6">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-36 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();

  // your cart hook (already exists)
  const { data, isPending, isError, refetch } = useCart();

  // mutations (already exist)
  const removeMutation = useRemoveFromCart();
  const clearMutation = useClearCart();

  // Loading and error handling (unchanged)
  if (isPending) return <CartSkeleton />;

  if (isError || !data)
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load cart.
        <div className="mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );

  // Data from your GET /api/cart — matches your implementation
  const {
    items = [],
    total = 0,
    discount = 0,
    payable = total,
    coupon = null,
  } = data;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Your Cart</h1>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-600 mt-10">
          <Package className="w-12 h-12 mb-3 text-gray-400" />
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <>
          {/* Cart items */}
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

                <div className="flex items-center gap-3">
                  <div className="font-semibold text-lg text-gray-900">
                    ₹{item.price}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-red-600"
                    disabled={removeMutation.isPending}
                    onClick={() =>
                      removeMutation.mutate(
                        { itemId: item.itemId, itemType: item.itemType },
                        {
                          onSuccess: () => {
                            toast({
                              type: "success",
                              message: "Item removed!",
                            });
                          },
                          onError: () =>
                            toast({
                              type: "error",
                              message: "Failed to remove item.",
                            }),
                        }
                      )
                    }
                  >
                    {removeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Box */}
          <div className="mt-4">
            <ApplyCouponBox appliedCoupon={coupon} />
          </div>

          {/* Footer / Total */}
          <div className="flex justify-between items-center mt-6 bg-gray-50 p-4 rounded-xl">
            <div className="text-right">
              <div className="text-sm text-gray-600">Subtotal: ₹{total}</div>
              {discount > 0 && (
                <div className="text-sm text-green-600">
                  Discount: -₹{discount}
                </div>
              )}
              <div className="text-xl font-semibold">Total: ₹{payable}</div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  clearMutation.mutate(undefined, {
                    onSuccess: () =>
                      toast({ type: "success", message: "Cart cleared!" }),
                  })
                }
                disabled={clearMutation.isPending}
                className="flex items-center gap-1"
              >
                {clearMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Clear
              </Button>

              <Button
                onClick={() => router.push("/checkout")}
                className="flex items-center gap-1"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
