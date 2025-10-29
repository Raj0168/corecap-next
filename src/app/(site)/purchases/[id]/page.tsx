"use client";

import { useParams, useRouter } from "next/navigation";
import { usePurchaseDetails } from "@/hooks/usePurchases";
import { Card, CardContent } from "@/app/(site)/components/ui/card";
import { Button } from "@/app/(site)/components/ui/button";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function PurchaseDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const { data, isLoading, isError, refetch } = usePurchaseDetails(id);
  const purchase = data?.purchase;

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  // ---------- Error ----------
  if (isError || !purchase) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">
          {isError ? "Failed to load purchase details." : "Purchase not found."}
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Button
        variant="outline"
        onClick={() => router.push("/purchases")}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Purchases</span>
      </Button>

      <Card className="shadow-lg rounded-2xl border border-gray-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Purchase #{purchase._id.slice(-6).toUpperCase()}
            </h2>
            {purchase.status === "paid" ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : purchase.status === "failed" ? (
              <XCircle className="w-6 h-6 text-red-500" />
            ) : (
              <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Amount:</span> ₹{purchase.amount}
            </p>
            <p className="text-gray-700 capitalize">
              <span className="font-semibold">Status:</span> {purchase.status}
            </p>
            <p className="text-gray-500 text-sm">
              Created: {new Date(purchase.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm">
              Updated: {new Date(purchase.updatedAt).toLocaleString()}
            </p>
          </div>

          {purchase.items && purchase.items.length > 0 && (
            <div className="pt-4">
              <h3 className="font-medium mb-2 text-gray-800">Items</h3>
              <div className="border rounded-lg divide-y">
                {purchase.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium capitalize">{item.itemType}</p>
                      <p className="text-xs text-gray-500">ID: {item.itemId}</p>
                    </div>
                    <p className="font-semibold text-gray-700">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
