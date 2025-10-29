"use client";

import { usePayments } from "@/hooks/usePayments";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function PaymentSkeleton() {
  return (
    <div className="animate-pulse space-y-3 border rounded-2xl p-4 shadow-sm">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-6 bg-gray-200 rounded w-1/4 mt-2" />
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const { data, isLoading, isFetching, isError, refetch } = usePayments();

  const payments = data?.payments || [];

  if (isLoading || isFetching) {
    return (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PaymentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Failed to load payments.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No payments found yet.
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {payments.map((payment) => (
        <Card
          key={payment._id}
          className="shadow-md hover:shadow-lg transition rounded-2xl"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold">₹{payment.amount}</h2>
              </div>

              {payment.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : payment.status === "failed" ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
              )}
            </div>

            <p className="text-sm text-gray-600 mt-2">
              Status: <span className="capitalize">{payment.status}</span>
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(payment.createdAt).toLocaleString()}
            </p>

            <Button
              className="mt-4 w-full"
              onClick={() => router.push(`/payments/${payment._id}`)}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
