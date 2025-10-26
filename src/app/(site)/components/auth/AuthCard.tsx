// components/auth/AuthCard.tsx
"use client";
import { ReactNode } from "react";

export default function AuthCard({
  title,
  children,
  imageUrl,
}: {
  title: string;
  children: ReactNode;
  imageUrl?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row bg-gray-50 overflow-hidden min-h-[80vh] md:min-h-[70vh]">
      {/* Left Image Section */}
      {imageUrl && (
        <div className="hidden md:flex w-7/12">
          <img
            src={imageUrl}
            alt="Auth Illustration"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
      )}

      {/* Right Form Section */}
      <div className="flex w-full md:w-5/12 items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500">
          <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
