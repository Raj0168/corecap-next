"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function UserMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    router.push("/login");
  };

  return (
    <div className="relative">
      <button
        className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-2"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => router.push("/profile")}
          >
            Profile
          </button>

          {loggedIn ? (
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </button>
          )}

          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
    </div>
  );
}
