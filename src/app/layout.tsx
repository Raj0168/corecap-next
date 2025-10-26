// app/layout.tsx
import "../styles/globals.css";
import { ReactNode } from "react";
import { ToastProvider } from "./(site)/components/ui/toast";
import Header from "./(site)/components/layout/Header";
import Footer from "./(site)/components/layout/Footer";
import Providers from "./(site)/components/Providers";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

export default async function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal?: ReactNode;
}) {
  const isAdmin =
    typeof window === "undefined" &&
    process.env.NODE_ENV !== "test" &&
    typeof globalThis.window === "undefined" &&
    globalThis.location?.pathname.startsWith("/admin");

  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken")?.value;

  let user = null;
  if (token) {
    try {
      user = verifyAccessToken(token);
    } catch {
      user = null;
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Providers initialUser={user}>
          <ToastProvider>
            {!isAdmin && <Header />}
            <main className="flex-1">{children}</main>
            {!isAdmin && <Footer />}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
