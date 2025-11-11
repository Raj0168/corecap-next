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
    url: "https://www.corecapmaths.in/",
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
  metadataBase: new URL("https://www.corecapmaths.in/"),
  alternates: {
    canonical: "https://www.corecapmaths.in/",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CorecapMaths",
    url: "https://www.corecapmaths.in",
    logo: "https://www.corecapmaths.in/logo-l.webp",
    sameAs: ["https://www.instagram.com/corecapmaths/"],
    description:
      "CorecapMaths offers compact, expert-curated Class 10 Maths PDFs — master theory and must-do questions efficiently.",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <Providers initialUser={user}>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
