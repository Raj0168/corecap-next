"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { User, Sun, Moon } from "lucide-react";
import { useLogout } from "@/hooks/useAuth";

export default function UserMenu({
  loggedIn,
  avatarUrl,
}: {
  loggedIn: boolean;
  avatarUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const logoutMutation = useLogout();
  const processing = logoutMutation.status === "pending";

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
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className={`p-1 rounded-full transition cursor-pointer ${
          loggedIn
            ? "border-2 border-yellow-400 hover:border-yellow-300"
            : "bg-yellow-400 text-[#0a2342] hover:bg-yellow-300"
        }`}
        onClick={() =>
          loggedIn ? setOpen((p) => !p) : router.push("/auth/login")
        }
      >
        {loggedIn ? (
          <img
            loading="lazy"
            src={avatarUrl ?? "/avatars/avatar1.webp"}
            alt="User avatar"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        ) : (
          <User size={24} />
        )}
      </button>

      {open && loggedIn && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => handleLinkClick("/purchases")}
          >
            Purchases
          </button>

          {/* <button
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
          </button> */}

          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 text-red-400 cursor-pointer"
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
