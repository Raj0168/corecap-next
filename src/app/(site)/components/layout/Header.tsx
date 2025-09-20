import Link from "next/link";
import { cookies } from "next/headers";
import UserMenu from "./UserMenu";

export default async function Header() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const loggedIn = !!token;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-blue-600 dark:text-blue-400"
        >
          MyEdTech
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/explore" className="hover:text-blue-500">
            Explore
          </Link>
          {loggedIn && (
            <Link href="/my-courses" className="hover:text-blue-500">
              My Courses
            </Link>
          )}
        </nav>

        {/* User Menu */}
        <UserMenu loggedIn={loggedIn} />
      </div>
    </header>
  );
}
