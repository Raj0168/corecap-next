"use client";

import { usePurchases } from "@/hooks/usePurchases";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  BadgeIndianRupee,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  IndianRupee,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PurchaseSkeleton() {
  return (
    <div className="animate-pulse rounded-xl p-4 space-y-3 shadow-sm">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-1/5" />
    </div>
  );
}

export default function PurchasesPage() {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = usePurchases();
  const purchases = data?.purchases || [];

  if (isLoading || isFetching) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <PurchaseSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Failed to load purchases.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No purchases yet. Start exploring courses!
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {purchases.map((purchase) => (
        <Card
          key={purchase._id}
          className="p-4 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center transition hover:shadow-lg"
        >
          <div className="flex-1 pr-0 md:pr-6 w-full space-y-1">
            <div className="flex items-center gap-2">
              <BadgeIndianRupee className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-lg">
                Purchase #{purchase._id.slice(-6).toUpperCase()}
              </h3>
            </div>

            <div className="flex flex-wrap gap-4 mt-2 text-gray-600 text-sm">
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" /> {purchase.amount}
              </div>
              <div className="flex items-center gap-1 capitalize">
                {purchase.status === "paid" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : purchase.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                )}
                {purchase.status}
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-4 w-4" />
                {formatDate(purchase.createdAt)}
              </div>
            </div>
          </div>

          {/* Right Section — Actions */}
          <div className="flex flex-col w-full md:w-40 mt-4 md:mt-0">
            <Button
              className="flex items-center justify-center gap-2 w-full md:w-auto"
              onClick={() => router.push(`/purchases/${purchase._id}`)}
            >
              <Eye className="h-4 w-4" /> View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
