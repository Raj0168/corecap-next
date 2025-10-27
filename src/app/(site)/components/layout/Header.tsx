"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
  const user = useAuthStore((s) => s.user); // reactive user
  const loggedIn = !!user;

  // Random avatar for logged-in user
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (loggedIn) {
      const randomIndex = Math.floor(Math.random() * 6) + 1; // 1–6
      setAvatarUrl(`/avatars/avatar${randomIndex}.webp`);
    } else {
      setAvatarUrl(null);
    }
  }, [loggedIn]);

  return (
    <header className="sticky top-0 z-50 bg-[#0a2342] text-white border-b border-[#1b355d]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Sidebar for mobile */}
        <div className="md:hidden flex items-center">
          <Sidebar />
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="flex-1 flex items-center justify-center md:justify-start gap-2"
        >
          <Image
            src="/logo-l.webp"
            alt="Logo"
            width={50}
            height={50}
            className="object-contain"
            priority
          />
          <span className="hidden md:inline text-xl font-semibold tracking-wide text-yellow-400">
            CoreCapMaths
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 text-white ml-auto">
          {!loggedIn ? (
            <>
              <Link
                href="/courses"
                className="hover:text-yellow-400 transition-colors"
              >
                Courses
              </Link>
              {/* <ThemeSwitcher /> */}
              <UserMenu loggedIn={false} />
            </>
          ) : (
            <>
              <Link
                href="/courses"
                className="hover:text-yellow-400 transition-colors"
              >
                Explore Courses
              </Link>
              <Link
                href="/my-courses"
                className="hover:text-yellow-400 transition-colors"
              >
                My Courses
              </Link>
              <Link
                href="/cart"
                className="hover:text-yellow-400 transition-colors"
              >
                Cart
              </Link>
              {/* <ThemeSwitcher /> */}
              <UserMenu loggedIn={true} avatarUrl={avatarUrl ?? undefined} />
            </>
          )}
        </nav>

        {/* Mobile user menu */}
        <div className="md:hidden flex items-center justify-end">
          <UserMenu loggedIn={loggedIn} avatarUrl={avatarUrl ?? undefined} />
        </div>
      </div>
    </header>
  );
}
