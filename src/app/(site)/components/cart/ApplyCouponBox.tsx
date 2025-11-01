"use client";

import React from "react";
import Button from "../ui/button";
import { useToast } from "../ui/toast";
import { Loader2 } from "lucide-react";
import { useApplyCoupon, useRemoveCoupon } from "@/hooks/useCart";

type AppliedCoupon = {
  code: string | null;
  discount: number;
};

export default function ApplyCouponBox({
  appliedCoupon,
}: {
  appliedCoupon?: AppliedCoupon | null;
}) {
  const [code, setCode] = React.useState("");
  const { toast } = useToast();

  const applyMutation = useApplyCoupon();
  const removeMutation = useRemoveCoupon();

  const onApply = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast({ type: "error", message: "Enter coupon code" });
      return;
    }

    applyMutation.mutate(
      { code: trimmed.toUpperCase() },
      {
        onSuccess: (res: any) => {
          if (!res || !res.success) {
            toast({
              type: "error",
              message: res?.error ?? "Failed to apply coupon",
            });
          } else {
            toast({ type: "success", message: "Coupon applied" });
            setCode("");
          }
        },
        onError: () =>
          toast({ type: "error", message: "Failed to apply coupon" }),
      }
    );
  };

  const onRemove = () => {
    removeMutation.mutate(undefined, {
      onSuccess: (res: any) => {
        if (res?.success) toast({ type: "success", message: "Coupon removed" });
        else toast({ type: "error", message: res?.error ?? "Remove failed" });
      },
      onError: () => toast({ type: "error", message: "Remove failed" }),
    });
  };

  // Already applied
  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-between">
        <div className="text-sm text-green-800">
          <strong>{appliedCoupon.code}</strong> applied — saved ₹
          {appliedCoupon.discount}
        </div>
        <Button
          variant="ghost"
          onClick={onRemove}
          disabled={removeMutation.isPending}
          className="text-red-600"
        >
          {removeMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Remove"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter coupon code"
        className="flex-1 border rounded px-3 py-2"
        onKeyDown={(e) => e.key === "Enter" && onApply()}
      />

      <Button
        onClick={onApply}
        disabled={applyMutation.isPending || !code.trim()}
      >
        {applyMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Apply"
        )}
      </Button>
    </div>
  );
}
