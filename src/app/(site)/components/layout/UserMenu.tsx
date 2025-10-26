"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User, Sun, Moon } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

export default function UserMenu({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const logoutMutation = useLogout();

  const processing = logoutMutation.status === "pending"; // ✅ React Query v5

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setOpen(false);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLinkClick = (path: string) => {
    router.push(path);
    setOpen(false); // auto-close menu
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 cursor-pointer rounded-full bg-yellow-400 text-[#0a2342] hover:bg-yellow-300 transition"
        onClick={() =>
          loggedIn ? setOpen((p) => !p) : router.push("/auth/login")
        }
      >
        <User size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleLinkClick("/profile")}
          >
            Profile
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleLinkClick("/purchases")}
          >
            Purchases
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <>
                <Sun size={16} /> Light Mode
              </>
            ) : (
              <>
                <Moon size={16} /> Dark Mode
              </>
            )}
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 text-red-300"
            onClick={handleLogout}
            disabled={processing}
          >
            {processing ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}
