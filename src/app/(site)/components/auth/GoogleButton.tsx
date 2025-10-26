"use client";

import Image from "next/image";
import React from "react";

export default function GoogleButton({
  onClick,
  className,
  size = 48,
}: {
  onClick?: () => void;
  className?: string;
  size?: number;
}) {
  const handleDefault = () => {
    window.location.href = "/api/auth/oauth/google/start";
  };

  const handleClick = onClick ?? handleDefault;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Sign in with Google"
      className={`cursor-pointer rounded-full border border-gray-300 shadow-sm hover:shadow-md hover:scale-105 transition-transform duration-200 flex items-center justify-center bg-white ${
        className ?? ""
      }`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/google.svg"
        alt="Google logo"
        width={size * 0.6}
        height={size * 0.6}
        className="object-contain"
        priority
      />
    </button>
  );
}
