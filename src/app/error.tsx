// app/error.tsx
"use client";
import { useEffect } from "react";
import { toastGlobal } from "./(site)/components/ui/toast";

export default function GlobalError({ error }: { error: Error }) {
  useEffect(() => {
    toastGlobal({
      type: "error",
      message: error.message || "Something went wrong",
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">{error.message}</p>
    </div>
  );
}
