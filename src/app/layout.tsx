import "../styles/globals.css";
import { ReactNode } from "react";
import { ToastProvider } from "./(site)/components/ui/toast";
import Header from "./(site)/components/layout/Header";
import Footer from "./(site)/components/layout/Footer";
import Providers from "./(site)/components/Providers";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "CorecapMaths - Smart Revision for Class 10",
    template: "%s | CorecapMaths",
  },
  description:
    "CorecapMaths offers compact, expert-curated Class 10 Maths PDFs — master theory and must-do questions efficiently.",
  keywords: [
    "class 10 maths",
    "revision notes",
    "compact pdfs",
    "corecapmaths",
    "smart revision",
    "cbse maths",
  ],
  authors: [{ name: "CorecapMaths Team" }],
  creator: "CorecapMaths",
  openGraph: {
    title: "CorecapMaths – Smartly Revised Class 10 Maths",
    description:
      "Master Class 10 Maths through compact PDFs. Only what matters — theory + must-do questions.",
    url: "https://corecapmaths.in",
    siteName: "CorecapMaths",
    images: [
      {
        url: "/logo-l.webp",
        width: 1200,
        height: 630,
        alt: "CorecapMaths preview",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@corecapmaths",
    title: "CorecapMaths - Smartly Revised Class 10 Maths",
    description:
      "Master Class 10 Maths with concise PDFs, must-do questions, and expert-curated content.",
    images: ["/logo-l.webp"],
  },
  metadataBase: new URL("https://corecapmaths.in"),
  alternates: {
    canonical: "https://corecapmaths.in",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-l.webp",
  },
};

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
