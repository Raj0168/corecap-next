"use client";

import React from "react";

interface CommonButtonProps {
  color?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: () => void;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  color = "primary",
  children,
  onClick,
}) => {
  const base =
    "px-4 py-2 font-semibold rounded-lg text-base transition-colors duration-200 cursor-pointer";
  const styles =
    color === "primary"
      ? "bg-yellow-400 text-[#1A2A49] hover:bg-yellow-300"
      : "bg-white text-[#1A2A49] border border-gray-300 hover:bg-gray-100";

  return (
    <button className={`${base} ${styles}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default CommonButton;
