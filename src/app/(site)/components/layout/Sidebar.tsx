"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/info/privacy-policy" },
  { label: "Terms of Service", href: "/info/terms-of-service" },
  { label: "Contact Us", href: "/info/contact-us" },
  { label: "About Us", href: "/info/about-us" },
  { label: "Cancellation and Refund", href: "/info/cancellation-and-refund" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logoutMutation = useLogout();
  const user = useAuthStore((s) => s.user);
  const loggedIn = !!user;

  const processing = logoutMutation.status === "pending";

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setOpen(false);
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
    }
  };

  // Close sidebar on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Toggle button */}
      <button
        className="p-2 rounded-md hover:bg-yellow-400/20 transition"
        onClick={() => setOpen(true)}
      >
        <Menu size={22} />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        } bg-black/50 backdrop-blur-sm`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar panel */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xl flex flex-col justify-between transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <Image
              src="/logo-l.webp"
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span className="text-xl font-bold text-yellow-500">
              CorecapMaths
            </span>
            <button
              className="ml-auto p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Courses / Explore */}
            {!loggedIn ? (
              <>
                <Link
                  href="/courses"
                  className="block hover:text-yellow-500 transition"
                  onClick={() => setOpen(false)}
                >
                  Courses
                </Link>
                {/* <button
                  className="flex items-center gap-2 hover:text-yellow-500 transition"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  Theme
                </button> */}
                <Link
                  href="/auth/login"
                  className="block text-yellow-400 font-semibold hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/explore"
                  className="block hover:text-yellow-500 transition"
                  onClick={() => setOpen(false)}
                >
                  Explore Courses
                </Link>
                <Link
                  href="/my-courses"
                  className="block hover:text-yellow-500 transition"
                  onClick={() => setOpen(false)}
                >
                  My Courses
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 hover:text-yellow-500 transition"
                  onClick={() => setOpen(false)}
                >
                  <ShoppingCart size={18} /> Cart
                </Link>
                {/* <button
                  className="flex items-center gap-2 hover:text-yellow-500 transition"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  Theme
                </button> */}
                <button
                  className="block text-red-600 font-semibold hover:underline mt-2"
                  onClick={handleLogout}
                  disabled={processing}
                >
                  {processing ? "Logging out..." : "Logout"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 space-y-2 text-sm">
          <div className="border-t border-gray-300 dark:border-gray-700" />
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block hover:text-yellow-500 transition"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-300 dark:border-gray-700" />

          <div className="mt-4 text-gray-500 dark:text-gray-400 text-xs">
            © {new Date().getFullYear()} CorecapMaths. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
}
